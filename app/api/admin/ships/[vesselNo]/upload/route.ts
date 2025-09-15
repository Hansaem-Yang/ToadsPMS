import { NextResponse } from 'next/server';
import { getSql, getPool } from '@/db'; // 이전에 만든 query 함수

export async function POST(req: Request) {
  const body = await req.json();
  const {vesselNo, registUser, modifyUser, excelData} = body;

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

      for (const rows of excelData) {
        if (vesselNo !== rows.Vessel) {
          continue;
        }

        if (equipName !== rows.Equipment) {
          sectionCode = '';
          sectionName = '';

          let query = 
            `merge [equipment] as a
             using (select @vesselNo as vessel_no
                         , @equipName as equip_name
                         , @category as category
                         , @manufacturer as manufacturer
                         , @model as model
                         , @machine as machine
                         , @registUser as regist_user
                         , @modifyUser as modify_user) as b
                on (a.vessel_no = b.vessel_no 
               and  a.equip_name = b.equip_name)
              when matched then
                   update
                      set a.equip_name = b.equip_name
                        , a.category = lower(b.category)
                        , a.manufacturer = b.manufacturer
                        , a.model = b.model
                        , a.machine = b.machine
                        , a.modify_date = getdate()
                        , a.modify_user = b.modify_user
              when not matched then
                   insert (
                           vessel_no
                         , equip_no
                         , equip_name
                         , category
                         , manufacturer
                         , model
                         , machine
                         , regist_date
                         , regist_user
                   )
                   values (
                           b.vessel_no
                         , (select format(isnull(max(equip_no), 0) + 1, '00') from [equipment] where vessel_no = b.vessel_no)
                         , b.equip_name
                         , lower(b.category)
                         , b.manufacturer
                         , b.model
                         , b.machine
                         , getdate()
                         , b.regist_user
                   );`

          let params = [
            { name: 'vesselNo', value: vesselNo },
            { name: 'equipName', value: rows.Equipment },
            { name: 'category', value: rows.Category },
            { name: 'manufacturer', value: rows.Maker },
            { name: 'model', value: rows.Model },
            { name: 'machine', value: rows.Machine },
            { name: 'registUser', value: registUser },
            { name: 'modifyUser', value: modifyUser }
          ];

          const request = new sql.Request(transantion);
          params?.forEach(p => request.input(p.name, p.value));
          let result = await request.query(query);

          equipName = rows.Equipment;

          if (result.rowsAffected[0] > 0) {
            query = 
              `select max(equip_no) as equip_no
                 from [equipment] 
                where vessel_no = @vesselNo;`

            result = await request.query(query);

            if (result.recordset.length > 0)
              equipNo = result.recordset[0].equip_no;
            else
              equipNo = ''
          }
        }

        if (sectionName !== rows.Section) {          
          let query = 
            `merge [section] as a
             using (select @vesselNo as vessel_no
                         , @equipNo as equip_no
                         , @sectionName as section_name
                         , @registUser as regist_user
                         , @modifyUser as modify_user) as b
                on (a.vessel_no = b.vessel_no 
               and  a.equip_no = b.equip_no
               and  a.section_name = b.section_name)
              when matched then
                   update
                      set a.section_name = b.section_name
                        , a.modify_date = getdate()
                        , a.modify_user = b.modify_user
              when not matched then
                   insert (
                           vessel_no
                         , equip_no
                         , section_code
                         , section_name
                         , regist_date
                         , regist_user
                   )
                   values (
                           b.vessel_no
                         , b.equip_no
                         , (select format(isnull(max(section_code), 0) + 1, '000') from [section] where vessel_no = b.vessel_no and equip_no = b.equip_no)
                         , b.section_name
                         , getdate()
                         , b.regist_user
                   );`

          let params = [
            { name: 'vesselNo', value: vesselNo },
            { name: 'equipNo', value: equipNo },
            { name: 'sectionName', value: rows.Section },
            { name: 'registUser', value: registUser },
            { name: 'modifyUser', value: modifyUser }
          ];

          const request = new sql.Request(transantion);
          params?.forEach(p => request.input(p.name, p.value));
          let result = await request.query(query);
          
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

        let query = 
            `merge [maintenance_plan] as a
             using (select @vesselNo as vessel_no 
                         , @equipNo as equip_no 
                         , @sectionCode as section_code 
                         , @planName as plan_name 
                         , @manufacturer as manufacturer 
                         , @model as model 
                         , @specifications as specifications 
                         , @workers as workers 
                         , @workHours as work_hours 
                         , @intervalTerm as interval_term 
                         , @interval as interval 
                         , @location as location 
                         , @manager as manager 
                         , @selfMaintenance as self_maintenance 
                         , @critical as critical 
                         , @lastestDate as lastest_date 
                         , @instructions as instructions
                         , @registUser as regist_user
                         , @modifyUser as modify_user) as b
                on (a.vessel_no = b.vessel_no 
               and  a.equip_no = b.equip_no
               and  a.section_name = b.section_name)
              when matched then
                   update 
                      set a.plan_name = b.plan_name
                        , a.manufacturer = b.manufacturer
                        , a.model = b.model
                        , a.specifications = b.specifications
                        , a.workers = b.workers
                        , a.work_hours = b.work_hours
                        , a.interval_term = b.interval_term
                        , a.interval = b.interval
                        , a.location = b.location
                        , a.manager = b.manager
                        , a.self_maintenance = b.self_maintenance
                        , a.critical = b.critical
                        , a.lastest_date = b.lastest_date
                        , a.instructions = b.instructions
                        , a.modify_date = getdate()
                        , a.modify_user = b.modify_user
              when not matched then
                   insert (
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
                         , regist_date
                         , regist_user
                   )
                   values (
                           b.vessel_no
                         , b.equip_no
                         , b.section_code
                         , (select format(isnull(max(plan_code), 0) + 1, '000') from [maintenance_plan] where vessel_no = b.vessel_no and equip_no = b.equip_no and section_code = b.section_code)
                         , b.plan_name
                         , b.manufacturer
                         , b.model
                         , b.specifications
                         , b.workers
                         , b.work_hours
                         , b.interval_term
                         , b.interval
                         , b.location
                         , b.manager
                         , b.self_maintenance
                         , b.critical
                         , b.lastest_date
                         , b.instructions
                         , getdate()
                         , b.regist_user
                   );`

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
          { name: 'registUser', value: registUser },
          { name: 'modifyUser', value: modifyUser }
        ];
        

        const request = new sql.Request(transantion);

        params?.forEach(p => request.input(p.name, p.value));
        let result = await request.query(query);

        count += result.rowsAffected[0];
      }

      transantion.commit();

      if (count === 0) {
        return NextResponse.json({ success: false, message: 'Data was not inserted.' }, { status: 401 });
      }
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