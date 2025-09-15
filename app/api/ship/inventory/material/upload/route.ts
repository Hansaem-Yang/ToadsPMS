import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { Material } from '@/types/inventory/material/material';

export async function POST(req: Request) {
  const remoteSiteUrl = process.env.REMOTE_SITE_URL;
  const body = await req.json();
  const {vesselNo, registUser, modifyUser, excelData} = body;

  if (!Array.isArray(excelData) || excelData.length === 0) {
    return NextResponse.json({ success: false, message: 'There is no valid data.' }, { status: 400 });
  }

  console.log(excelData);

  try {
    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();

    try {
      let count = 0;

      for (const rows of excelData) {
        let queryString = 
        `merge [material] as a
          using (select @vesselNo as vessel_no
                      , @materialName as material_name
                      , @materialGroup as material_group
                      , @materialType as material_type
                      , @materialUnit as material_unit
                      , dbo.fn_get_warehouse_no(@warehouseName) as warehouse_no
                      , @drawingNo as drawing_no
                      , @machineId as machine_id
                      , @standardQty as standard_qty
                      , @registUser as regist_user
                      , @modifyUser as modify_user ) as b
            on (a.vessel_no = b.vessel_no 
            and a.machine_id = b.machine_id
            and a.material_name = b.material_name)
          when matched then
                update 
                  set a.material_name = b.material_name
                    , a.material_group = b.material_group
                    , a.material_type = b.material_type
                    , a.material_unit = b.material_unit
                    , a.warehouse_no = b.warehouse_no
                    , a.drawing_no = b.drawing_no
                    , a.machine_id = b.machine_id
                    , a.standard_qty = b.standard_qty
                    , a.modify_date = getdate()
                    , a.modify_user = b.modify_user
          when not matched then
                insert (
                      vessel_no
                    , material_code
                    , material_name
                    , material_group
                    , material_type
                    , material_unit
                    , warehouse_no
                    , drawing_no
                    , machine_id
                    , standard_qty
                    , regist_date
                    , regist_user
              )
              values (
                      b.vessel_no
                    , (select b.material_type + format(getdate(), 'yyMM') + format(isnull(right(max(material_code), 3), 0) + 1, '000')
                         from [material]
                        where vessel_no = b.vessel_no
                          and material_type = b.material_type)
                    , b.material_name
                    , b.material_group
                    , b.material_type
                    , b.material_unit
                    , b.warehouse_no
                    , b.drawing_no
                    , b.machine_id
                    , b.standard_qty
                    , getdate()
                    , b.regist_user
              );`

        let params = [
          { name: 'vesselNo', value: vesselNo },
          { name: 'materialName', value: rows.MaterialName ? rows.MaterialName : '' },
          { name: 'materialGroup', value: rows.MaterialGroup ? rows.MaterialGroup : '' },
          { name: 'materialType', value: rows.MaterialType ? rows.MaterialType : '' },
          { name: 'materialUnit', value: rows.MaterialUnit ? rows.MaterialUnit : '' },
          { name: 'warehouseName', value: rows.WarehouseName ? rows.WarehouseName : '' },
          { name: 'drawingNo', value: rows.DrawingNo ? rows.DrawingNo : '' },
          { name: 'machineId', value: rows.MachineId ? rows.MachineId : '' },
          { name: 'standardQty', value: rows.StandardQty ? rows.StandardQty : '0' },
          { name: 'initialStock', value: rows.InitialStock ? rows.InitialStock : '0' }, 
          { name: 'registUser', value: registUser },
          { name: 'modifyUser', value: modifyUser },
        ];

        const request = new sql.Request(transantion);

        params?.forEach(p => request.input(p.name, p.value));
        let result = await request.query(queryString);

        count += result.rowsAffected[0];

        if (rows.InitialStock && Number.parseInt(rows.InitialStock) > 0) {
          queryString = `
          merge [receive] as a
          using (select a1.vessel_no
                      , a1.material_code
                      , a1.material_unit as receive_unit
                      , @initialStock as receive_qty
                      , 'S0' as receive_type
                      , @registUser as regist_user
                      , @modifyUser as modify_user
                  from [material] as a1
                  where a1.vessel_no = @vesselNo
                    and a1.machine_id = @machineId
                    and a1.material_code = (select max(material_code) 
                                              from [material]
                                            where vessel_no = @vesselNo
                                              and machine_id = @machineId
                                              and material_name = @materialName
                                              and regist_user = @registUser)) as b
            on (a.vessel_no = b.vessel_no 
                and a.material_code = b.material_code
                and a.receive_type = b.receive_type)
          when matched then
                update
                  set a.receive_unit = b.receive_unit
                    , a.receive_qty = b.receive_qty
                    , a.modify_date = getdate()
                    , a.modify_user = b.modify_user
          when not matched then
                insert (vessel_no
                      , receive_no
                      , material_code
                      , receive_unit
                      , receive_type
                      , receive_qty
                      , regist_date
                      , regist_user)
                values (b.vessel_no
                      , (select b.receive_type + format(getdate(), 'yyMM') + format(isnull(right(max(receive_no), 3), 0) + 1, '000') 
                          from [receive] 
                          where vessel_no = b.vessel_no
                            and receive_type = b.receive_type)
                      , b.material_code
                      , b.receive_unit
                      , b.receive_type
                      , b.receive_qty
                      , getdate()
                      , b.regist_user);`;
          
          result = await request.query(queryString);
          count += result.rowsAffected[0];
        }
      }

      transantion.commit();

      if (count === 0) {
        return NextResponse.json({ success: false, message: 'Data was not inserted.' }, { status: 401 });
      }

      // 저장된 자재 정보 조회
      const sendData: Material[] = await query(
        `select vessel_no
              , material_code
              , machine_id
              , material_name
              , material_group
              , material_spec
              , material_type
              , material_unit
              , warehouse_no
              , drawing_no
              , standard_qty
              , regist_date
              , regist_user
            from [material]
          where vessel_no = @vesselNo
            and regist_user = @registUser
            and convert(varchar(10), regist_date, 121) = convert(varchar(10), getdate(), 121);`,
        [
          { name: 'vesselNo', value: vesselNo },
          { name: 'registUser', value: registUser },
        ]
      );
      
      // 선박에서 저장된 자재 정보 전송
      if (sendData) {
        fetch(`${remoteSiteUrl}/api/data/inventory/material/sets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sendData),
        })
        .then(res => {
          if (res.ok) {
            const subTransantion = pool.transaction();
            try {
              async () => {
                await subTransantion.begin();

                for (const material of sendData) {
                  // 자재 정보의 마지막 전송일자 수정
                  const queryString = 
                    `update [material]
                        set last_send_date = getdate()
                      where vessel_no = @vesselNo
                        and material_code = @materialCode;`

                  let params =[
                    { name: 'vesselNo', value: material.vessel_no },
                    { name: 'materialCode', value: material.material_code },
                  ]

                  const request = new sql.Request(transantion);

                  params?.forEach(p => request.input(p.name, p.value));
                  await request.query(queryString);
                }

                subTransantion.commit();
              }
            } catch (err) {
              subTransantion.rollback();
              return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
            }
          }
          
          return res.json();
        })
        .catch(err => {
          console.error('Error triggering cron job:', err);
        });
      }

      // 성공 정보 반환
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error(err)
      transantion.rollback();
      return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}