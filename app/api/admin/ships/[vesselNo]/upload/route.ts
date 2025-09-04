import { NextResponse } from 'next/server';
import { getSql, getPool } from '@/db'; // 이전에 만든 query 함수

export async function POST(req: Request) {
  const body = await req.json();
  const {vesselNo, excelData} = body;

  console.log(excelData)

  if (!Array.isArray(excelData) || excelData.length === 0) {
    return NextResponse.json({ success: false, message: 'There is no valid data.' }, { status: 400 });
  }

  try {
    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();

    try {
      let count = 0;
      let equipNo: string = '';
      let equipName: string = '';
      let sectionCode: string = '';
      let sectionName: string = '';
      let planCode: string = '';

      for (const rows of excelData) {
        if (vesselNo !== rows.Vessel) {
          continue;
        }

        if (equipName !== rows.Equipment) {
          sectionCode = '';
          sectionName = '';
          planCode = '';

          let query = 
            `select equip_no
               from [equipment] 
              where vessel_no = @vesselNo
                and equip_name = @equipName;`

          let params = [
            { name: 'vesselNo', value: vesselNo },
            { name: 'equipName', value: rows.Equipment },
            { name: 'category', value: rows.Category },
            { name: 'manufacturer', value: rows.Maker },
            { name: 'model', value: rows.Model },
            { name: 'machine', value: rows.Machine }
          ];

          const request = new sql.Request(transantion);
          params?.forEach(p => request.input(p.name, p.value));
          let result = await request.query(query);

          if (result.recordset.length > 0) {
            equipNo = result.recordset[0].equip_no;

            query = 
              `update [equipment]
                  set equip_name = @equipName
                    , category = lower(@category)
                    , manufacturer = @manufacturer
                    , model = @model
                    , machine = @machine
                where vessel_no = @vesselNo
                  and equip_no = @equipNo;`

            let params = [
              { name: 'equipNo', value: equipNo },
            ];
            params?.forEach(p => request.input(p.name, p.value));
            
            result = await request.query(query);
            count += result.rowsAffected[0];
          }
          else {
            query = 
              `insert into [equipment] (
                      vessel_no
                    , equip_no
                    , equip_name
                    , category
                    , manufacturer
                    , model
                    , machine
              )
              values (
                      @vesselNo
                    , (select format(isnull(max(equip_no), 0) + 1, '00') from [equipment] where vessel_no = @vesselNo)
                    , @equipName
                    , lower(@category)
                    , @manufacturer
                    , @model
                    , @machine
              );`

            result = await request.query(query);
            count += result.rowsAffected[0];

            equipName = rows.Equipment;

            if (result.rowsAffected[0] > 0) {
              query = 
                `select max(equip_no) as equip_no
                  from [equipment] 
                 where vessel_no = @vesselNo;`

              params = [
                { name: 'vesselNo', value: vesselNo }
              ];

              result = await request.query(query);

              if (result.recordset.length > 0)
                equipNo = result.recordset[0].equip_no;
              else
                equipNo = ''
            }
          }
        }

        if (sectionName !== rows.Section) {
          planCode = '';
          
          let query = 
            `select section_code
              from [section] 
             where vessel_no = @vesselNo
               and equip_no = @equipNo
               and section_name = @sectionName;`

          let params = [
            { name: 'vesselNo', value: vesselNo },
            { name: 'equipNo', value: equipNo },
            { name: 'sectionName', value: rows.Section }
          ];

          const request = new sql.Request(transantion);
          params?.forEach(p => request.input(p.name, p.value));
          let result = await request.query(query);

          if (result.recordset.length > 0) {
            sectionCode = result.recordset[0].section_code;
          }
          else {
            query = 
              `insert into [section] (
                      vessel_no
                    , equip_no
                    , section_code
                    , section_name
              )
              values (
                      @vesselNo
                    , @equipNo
                    , (select format(isnull(max(section_code), 0) + 1, '000') from [section] where vessel_no = @vesselNo and equip_no = @equipNo)
                    , @sectionName
              );`

            result = await request.query(query);
            count += result.rowsAffected[0];

            sectionName = rows.Section;
            
            if (result.rowsAffected[0] > 0) {
              query = 
                `select max(section_code) as section_code
                  from [section] 
                  where vessel_no = @vesselNo
                    and equip_no = @equipNo;`

              result = await request.query(query);

              if (result.recordset.length > 0)
                sectionCode = result.recordset[0].section_code;
              else
                sectionCode = ''
            }
          }
        }

        let query = 
          `select plan_code
             from [maintenance_plan] 
            where vessel_no = @vesselNo
              and equip_no = @equipNo
              and section_code = @sectionCode
              and plan_name = @planName;`

        let params = [
          { name: 'vesselNo', value: vesselNo },
          { name: 'equipNo', value: equipNo },
          { name: 'sectionCode', value: sectionCode },
          { name: 'planName', value: rows.MaintenanceName},
          { name: 'manufacturer', value: rows.Manufacturer},
          { name: 'model', value: rows.Model},
          { name: 'specifications', value: rows.Specifications},
          { name: 'workers', value: rows.Workers},
          { name: 'workHours', value: rows.WorkHours},
          { name: 'intervalTerm', value: rows.IntervalTerm},
          { name: 'interval', value: rows.Interval},
          { name: 'location', value: rows.Location},
          { name: 'manager', value: rows.Manager},
          { name: 'selfMaintenance', value: rows.SelfMaintenance},
          { name: 'critical', value: rows.Critical},
          { name: 'lastestDate', value: rows.LastestDate},
          { name: 'instructions', value: rows.Instructions},
        ];

        const request = new sql.Request(transantion);

        params?.forEach(p => request.input(p.name, p.value));
        let result = await request.query(query);

        if (result.recordset.length > 0) {
          planCode = result.recordset[0].plan_code;

          query = 
            `update [maintenance_plan]
                set plan_name = @planName
                  , manufacturer = @manufacturer
                  , model = @model
                  , specifications = @specifications
                  , workers = @workers
                  , work_hours = @workHours
                  , interval_term = @intervalTerm
                  , interval = @interval
                  , location = @location
                  , manager = @selfMaintenance
                  , self_maintenance = @manager
                  , critical = @critical
                  , lastest_date = @lastestDate
                  , instructions = @instructions
              where vessel_no = @vesselNo
                and equip_no = @equipNo
                and section_code = @sectionCode
                and plan_code = @planCode;`
            
          let params = [
            { name: 'planCode', value: planCode },
          ];
          params?.forEach(p => request.input(p.name, p.value));

          result = await request.query(query);
          count += result.rowsAffected[0];
        }
        else {
          query = 
            `insert into [maintenance_plan] (
                    vessel_no
                  , equip_no
                  , section_code
                  , plan_code
                  , plan_name
                  , manufacturer
                  , model
                  , specifications
                  , workers
                  , work_hours
                  , interval_term
                  , interval
                  , location
                  , manager
                  , self_maintenance
                  , critical
                  , lastest_date
                  , instructions
            )
            values (
                    @vesselNo
                  , @equipNo
                  , @sectionCode
                  , (select format(isnull(max(plan_code), 0) + 1, '000') from [maintenance_plan] where vessel_no = @vesselNo and equip_no = @equipNo and section_code = @sectionCode)
                  , @planName
                  , @manufacturer
                  , @model
                  , @specifications
                  , @workers
                  , @workHours
                  , @intervalTerm
                  , @interval
                  , @location
                  , @selfMaintenance
                  , @manager
                  , @critical
                  , @lastestDate
                  , @instructions
            );`
          result = await request.query(query);
          count += result.rowsAffected[0];
        }
      }

      if (count === 0) {
        transantion.rollback();
        return NextResponse.json({ success: false, message: 'Data was not inserted.' }, { status: 401 });
      }

      transantion.commit();
      // 성공 정보 반환
      return NextResponse.json({ success: true });
    } catch (err) {
      transantion.rollback();
      console.log(err);
      return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}