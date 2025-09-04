import { NextResponse } from 'next/server';
import { execute, query } from '@/db'; // 이전에 만든 query 함수
import { MaintenancePlan } from '@/types/vessel/maintenance_plan';

export async function POST(req: Request) {
  try {
    const remoteSiteUrl = process.env.REMOTE_SITE_URL;
    const body = await req.json();
    const item : MaintenancePlan = body;

    // DB에서 사용자 정보 확인
    const count = await execute(
      `update [maintenance_plan] 
          set plan_name = @planName
            , manufacturer = @manufacturer
            , model = @model
            , specifications = @specifications
            , lastest_date = @lastestDate
            , workers = @workers
            , work_hours = @workHours
            , interval = @interval
            , interval_term = @intervalTerm
            , location = @location
            , self_maintenance = @selfMaintenance
            , manager = @manager
            , important_items = @importantItems
            , instructions = @instructions
            , critical = @critical
            , modify_date = getdate()
            , modify_user = @modifyUser
        where vessel_no = @vesselNo 
          and equip_no = @equipNo 
          and section_code = @sectionCode
          and plan_code = @planCode;`,
      [
        { name: 'vesselNo', value: item.vessel_no },
        { name: 'equipNo', value: item.equip_no },
        { name: 'sectionCode', value: item.section_code },
        { name: 'planCode', value: item.plan_code },
        { name: 'planName', value: item.plan_name },
        { name: 'manufacturer', value: item.manufacturer },
        { name: 'model', value: item.model },
        { name: 'specifications', value: item.specifications },
        { name: 'lastestDate', value: item.lastest_date },
        { name: 'workers', value: item.workers },
        { name: 'workHours', value: item.work_hours },
        { name: 'interval', value: item.interval },
        { name: 'intervalTerm', value: item.interval_term },
        { name: 'location', value: item.location },
        { name: 'selfMaintenance', value: item.self_maintenance },
        { name: 'manager', value: item.manager },
        { name: 'importantItems', value: item.important_items },
        { name: 'instructions', value: item.instructions },
        { name: 'critical', value: item.critical },
        { name: 'modifyUser', value: item.modify_user }
      ]
    );

    if (count === 0) {
      return NextResponse.json({ success: false, message: 'Data was not updated.' }, { status: 401 });
    }
        
    // 저장된 정비 정보 조회
    const sendData: MaintenancePlan[] = await query(
      `select vessel_no
            , equip_no
            , section_code
            , plan_code
            , plan_name
            , manufacturer
            , model
            , specifications
            , lastest_date
            , workers
            , work_hours
            , interval
            , interval_term
            , location
            , self_maintenance
            , manager
            , important_items
            , instructions
            , critical
            , regist_date
            , regist_user
         from [maintenance_plan]
        where vessel_no = @vesselNo
          and equip_no = @equipNo
          and section_code = @sectionCode
          and plan_code = (select max(plan_code) 
                             from [maintenance_plan]
                            where vessel_no = @vesselNo
                              and equip_no = @equipNo
                              and section_code = @sectionCode
                              and regist_user = @registUser);`,
      [
        { name: 'vesselNo', value: item.vessel_no },
        { name: 'equipNo', value: item.equip_no },
        { name: 'sectionCode', value: item.section_code },
        { name: 'registUser', value: item.regist_user },
      ]
    );
    
    // 선박에서 저장된 정비 정보 전송
    if (sendData[0]) {
      fetch(`${remoteSiteUrl}/api/data/maintenance/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendData[0]),
      })
      .then(res => {
        if (res.ok) {
          // 정비 정보의 마지막 전송일자 수정
          execute(
            `update [maintenance_plan]
                set last_send_date = getdate()
              where vessel_no = @vesselNo
                and equip_no = @equipNo
                and section_code = @sectionCode
                and plan_code = @planCode;`,
            [
              { name: 'vesselNo', value: sendData[0].vessel_no },
              { name: 'equipNo', value: sendData[0].equip_no },
              { name: 'sectionCode', value: sendData[0].section_code },
              { name: 'planCode', value: sendData[0].plan_code },
            ]
          );
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
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}