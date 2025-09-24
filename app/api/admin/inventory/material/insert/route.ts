import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { Material } from '@/types/inventory/material/material';

export async function POST(req: Request) {
  try {
    const remoteSiteUrl = process.env.REMOTE_SITE_URL;
    const body = await req.json();
    const item : Material = body;

    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();
    try {
      let count = 0;
      let queryString = `
      insert into [material] (
              vessel_no
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
      )
      values (
              @vesselNo
            , (select 'A' + @materialType + format(getdate(), 'yyMM') + format(isnull(right(max(material_code), 3), 0) + 1, '000')
                 from [material]
                where vessel_no = @vesselNo
                  and material_type = @materialType
                  and material_code like 'A%')
            , @machineId
            , @materialName
            , @materialGroup
            , @materialSpec
            , @materialType
            , @materialUnit
            , @warehouseNo
            , @drawingNo
            , @standardQty
            , getdate()
            , @registUser
      );`;

      let params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'machineId', value: item.machine_id }, 
        { name: 'materialName', value: item.material_name }, 
        { name: 'materialGroup', value: item.material_group }, 
        { name: 'materialSpec', value: item.material_spec }, 
        { name: 'materialType', value: item.material_type }, 
        { name: 'materialUnit', value: item.material_unit }, 
        { name: 'warehouseNo', value: item.warehouse_no }, 
        { name: 'drawingNo', value: item.drawing_no }, 
        { name: 'standardQty', value: item.standard_qty }, 
        { name: 'initialStock', value: item.initial_stock }, 
        { name: 'registUser', value: item.regist_user }, 
        { name: 'modifyUser', value: item.modify_user }, 
      ];

      let request = new sql.Request(transantion);

      params?.forEach(p => request.input(p.name, p.value));
      let result = await request.query(queryString);
      count += result.rowsAffected[0];

      queryString = `
      merge [receive] as a
      using (select a1.vessel_no
                  , a1.material_code
                  , a1.material_unit as receive_unit
                  , a1.warehouse_no as receive_location
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
                                           and regist_user = @registUser)) as b
         on (a.vessel_no = b.vessel_no 
             and a.material_code = b.material_code
             and a.receive_type = b.receive_type)
       when matched then
            update
               set a.receive_unit = b.receive_unit
                 , a.receive_qty = b.receive_qty
                 , a.receive_location = b.receive_location
                 , a.modify_date = getdate()
                 , a.modify_user = b.modify_user
       when not matched then
            insert (vessel_no
                  , receive_no
                  , material_code
                  , receive_unit
                  , receive_type
                  , receive_qty
                  , receive_location
                  , regist_date
                  , regist_user)
            values (b.vessel_no
                  , (select 'A' + b.receive_type + format(getdate(), 'yyMM') + format(isnull(right(max(receive_no), 3), 0) + 1, '000') 
                       from [receive] 
                      where vessel_no = b.vessel_no
                        and receive_type = b.receive_type
                        and receive_no like 'A%')
                  , b.material_code
                  , b.receive_unit
                  , b.receive_type
                  , b.receive_qty
                  , b.receive_location
                  , getdate()
                  , b.regist_user);`;
      params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'machineId', value: item.machine_id }, 
        { name: 'initialStock', value: item.initial_stock }, 
        { name: 'registUser', value: item.regist_user }, 
        { name: 'modifyUser', value: item.modify_user }, 
      ];

      request = new sql.Request(transantion);

      params?.forEach(p => request.input(p.name, p.value));
      result = await request.query(queryString);
      count += result.rowsAffected[0];

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
            and material_code = (select max(material_code) 
                                   from [material]
                                  where vessel_no = @vesselNo
                                    and machine_id = @machineId
                                    and regist_user = @registUser);`,
        [
          { name: 'vesselNo', value: item.vessel_no },
          { name: 'machineId', value: item.machine_id },
          { name: 'registUser', value: item.regist_user },
        ]
      );

      // 성공 정보 반환
      return NextResponse.json({ success: true, data: sendData[0] });
    } catch (err) {
      transantion.rollback();
      console.error(err);
      return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}