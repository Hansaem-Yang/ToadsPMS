import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { MaintenanceWork } from '@/types/vessel/maintenance_work';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item : MaintenanceWork = body;

    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();
    try {

      let count = 0;
      let queryString = `
      update [maintenance_plan]
         set lastest_date = @workDate
           , modify_date = getdate()
           , modify_user = @modifyUser
       where vessel_no = @vesselNo
         and equip_no = @equipNo
         and section_code = @sectionCode
         and plan_code = @planCode
         and lastest_date = (select work_date
                               from [maintenance_work]
                              where vessel_no = @vesselNo
                                and work_order = @workOrder);`;
      
      let params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'equipNo', value: item.equip_no }, 
        { name: 'sectionCode', value: item.section_code }, 
        { name: 'planCode', value: item.plan_code }, 
        { name: 'workOrder', value: item.work_order.toString() }, 
        { name: 'workDate', value: item.work_date }, 
        { name: 'registUser', value: item.regist_user }, 
        { name: 'modifyUser', value: item.modify_user }, 
      ];

      let request = new sql.Request(transantion);
      
      params?.forEach(p => request.input(p.name, p.value));
      let result = await request.query(queryString);

      queryString = `
      update [equipment]
         set lastest_date = @workDate
           , modify_date = getdate()
           , modify_user = @modifyUser
       where vessel_no = @vesselNo
         and equip_no = @equipNo
         and lastest_date = (select work_date
                               from [maintenance_work]
                              where vessel_no = @vesselNo
                                and work_order = @workOrder);`;
      
      params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'equipNo', value: item.equip_no }, 
        { name: 'workOrder', value: item.work_order.toString() }, 
        { name: 'workDate', value: item.work_date }, 
        { name: 'registUser', value: item.regist_user }, 
        { name: 'modifyUser', value: item.modify_user }, 
      ];

      request = new sql.Request(transantion);
      
      params?.forEach(p => request.input(p.name, p.value));
      result = await request.query(queryString);

      queryString = `
      update [maintenance_work]
         set work_date = @workDate
           , modify_user = @modifyUser
           , modify_date = getdate()
       where vessel_no = @vesselNo
         and work_order = @workOrder;`;

      params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'workOrder', value: item.work_order.toString() }, 
        { name: 'workDate', value: item.work_date }, 
        { name: 'registUser', value: item.regist_user }, 
        { name: 'modifyUser', value: item.modify_user }, 
      ];

      request = new sql.Request(transantion);

      params?.forEach(p => request.input(p.name, p.value));
      result = await request.query(queryString);
      count += result.rowsAffected[0];

      transantion.commit();

      if (count === 0) {
        return NextResponse.json({ success: false, message: 'Data was not updated.' }, { status: 401 });
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