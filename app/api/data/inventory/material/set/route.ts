import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { Material } from '@/types/inventory/material/material';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item : Material = body;

    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();
    try {
      let count = 0;
      let queryString = 
      `merge [material] as a
      using (select @vesselNo as vessel_no
                  , @materialCode as material_code
                  , @machineId as machine_id
                  , @materialName as material_name
                  , @materialGroup as material_group
                  , @materialSpec as material_spec
                  , @materialType as material_type
                  , @materialUnit as material_unit
                  , @warehouseNo as warehouse_no
                  , @drawingNo as drawing_no
                  , @standardQty as standard_qty
                  , @registDate as regist_date
                  , @registUser as regist_user) as b
          on (a.vessel_no = b.vessel_no 
          and a.material_code = b.material_code)
        when matched then
            update
                set a.machine_id = b.machine_id
                  , a.material_name = b.material_name
                  , a.material_group = b.material_group
                  , a.material_spec = b.material_spec
                  , a.material_type = b.material_type
                  , a.material_unit = b.material_unit
                  , a.warehouse_no = b.warehouse_no
                  , a.drawing_no = b.drawing_no
                  , a.standard_qty = b.standard_qty
                  , a.regist_date = b.regist_date
                  , a.regist_user = b.regist_user
        when not matched then
            insert (vessel_no
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
                  , regist_user)
            values (b.vessel_no
                  , b.material_code
                  , b.machine_id
                  , b.material_name
                  , b.material_group
                  , b.material_spec
                  , b.material_type
                  , b.material_unit
                  , b.warehouse_no
                  , b.drawing_no
                  , b.standard_qty
                  , b.regist_date
                  , b.regist_user);`

      let params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'materialCode', value: item.material_code }, 
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
        { name: 'registDate', value: item.regist_date }, 
        { name: 'registUser', value: item.regist_user }, 
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
                  , @registDate as regist_date
                  , @registUser as regist_user
                  , @modifyDate as modify_date
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
                 , a.last_receive_date = getdate()
                 , a.modify_date = b.modify_date
                 , a.modify_user = b.modify_user
      when not matched then
            insert (vessel_no
                  , receive_no
                  , material_code
                  , receive_unit
                  , receive_type
                  , receive_qty
                  , receive_location
                  , last_receive_date
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
                  , b.receive_location
                  , getdate()
                  , a.regist_date
                  , b.regist_user);`;
      params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'machineId', value: item.machine_id }, 
        { name: 'initialStock', value: item.initial_stock }, 
        { name: 'registDate', value: item.regist_date }, 
        { name: 'registUser', value: item.regist_user }, 
        { name: 'modifyDate', value: item.modify_date }, 
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
      
      // 성공 정보 반환
      return NextResponse.json({ success: true });
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