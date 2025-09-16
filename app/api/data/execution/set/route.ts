import { NextResponse } from 'next/server';
import { getSql, getPool } from '@/db'; // 이전에 만든 query 함수
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
      insert into [maintenance_work] (
              vessel_no
            , work_order
            , equip_no
            , section_code
            , plan_code
            , plan_date
            , work_date
            , manager
            , work_details
            , used_parts
            , work_hours
            , delay_reason
            , last_receive_date
            , regist_date
            , regist_user
      )
      values (
              @vesselNo
            , @workOrder
            , @equipNo
            , @sectionCode
            , @planCode
            , @planDate
            , getdate()
            , @manager
            , @workDetails
            , @usedParts
            , @workHours
            , @delayReason
            , getdate()
            , getdate()
            , @registUser
      );`;

      let params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'workOrder', value: item.work_order }, 
        { name: 'equipNo', value: item.equip_no }, 
        { name: 'sectionCode', value: item.section_code }, 
        { name: 'planCode', value: item.plan_code }, 
        { name: 'planDate', value: item.extension_date? item.extension_date : item.due_date }, 
        { name: 'manager', value: item.manager }, 
        { name: 'workDetails', value: item.work_details }, 
        { name: 'usedParts', value: item.used_parts }, 
        { name: 'workHours', value: item.work_hours }, 
        { name: 'delayReason', value: item.delay_reason }, 
        { name: 'registUser', value: item.regist_user }, 
        { name: 'modifyUser', value: item.modify_user }, 
      ];

      const request = new sql.Request(transantion);

      params?.forEach(p => request.input(p.name, p.value));
      let result = await request.query(queryString);
      count += result.rowsAffected[0];

      queryString = `
      update maintenance_plan
         set lastest_date = getdate()
           , modify_date = getdate()
           , modify_user = @modifyUser
       where vessel_no = @vesselNo
         and equip_no = @equipNo
         and section_code = @sectionCode
         and plan_code = @planCode;`;
      
      result = await request.query(queryString);

      queryString = `
      update equipment
         set lastest_date = getdate()
           , modify_date = getdate()
           , modify_user = @modifyUser
       where vessel_no = @vesselNo
         and equip_no = @equipNo;`;
      
      result = await request.query(queryString);

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