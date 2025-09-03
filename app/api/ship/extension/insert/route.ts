import { NextResponse } from 'next/server';
import { getSql, getPool } from '@/db'; // 이전에 만든 query 함수
import { MaintenanceExtension } from '@/types/vessel/maintenance_extension';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item : MaintenanceExtension = body;

    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();
    try {
      let count = 0;
      let query = `
      insert into [maintenance_extension] (
             vessel_no
           , equip_no
           , section_code
           , plan_code
           , extension_seq
           , extension_date
           , extension_reason
           , request_date
           , applicant
           , approval_status
           , regist_date
           , regist_user
      )
      values (
             @vesselNo
           , @equipNo
           , @sectionCode
           , @planCode
           , (select isnull(max(extension_seq), 0) + 1 
                from [maintenance_extension] 
               where vessel_no = @vesselNo
                 and equip_no = @equipNo
                 and section_code = @sectionCode
                 and plan_code = @planCode)
           , @extensionDate
           , @extensionReason
           , getdate()
           , @applicant
           , 'R'
           , getdate()
           , @registUser
      );`;

      let params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'equipNo', value: item.equip_no }, 
        { name: 'sectionCode', value: item.section_code }, 
        { name: 'planCode', value: item.plan_code }, 
        { name: 'extensionDate', value: item.extension_date }, 
        { name: 'extensionReason', value: item.extension_reason }, 
        { name: 'applicant', value: item.applicant }, 
        { name: 'registUser', value: item.regist_user },
      ];

      const request = new sql.Request(transantion);

      params?.forEach(p => request.input(p.name, p.value));
      let result = await request.query(query);
      count += result.rowsAffected[0];

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