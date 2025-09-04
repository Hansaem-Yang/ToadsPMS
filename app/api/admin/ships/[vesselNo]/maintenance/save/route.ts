import { NextResponse } from 'next/server';
import { execute } from '@/db'; // 이전에 만든 query 함수
import { MaintenancePlan } from '@/types/vessel/maintenance_plan';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item : MaintenancePlan = body;
    
    // DB에서 사용자 정보 확인
    const count = await execute(
      `merge [maintenance_plan] as a
        using (select @vesselNo as vessel_no
                    , @equipNo as equip_no
                    , @sectionCode as section_code
                    , @planCode as plan_code
                    , @planName as plan_name
                    , @manufacturer as manufacturer
                    , @model as model
                    , @specifications as specifications
                    , @lastestDate as lastest_date
                    , @workers as workers
                    , @workHours as work_hours
                    , @interval as interval
                    , @intervalTerm as interval_term
                    , @location as location
                    , @selfMaintenance as self_maintenance
                    , @manager as manager
                    , @importantItems as important_items
                    , @instructions as instructions
                    , @critical as critical
                    , @registUser as regist_user
                    , @modifyUser as modify_user) as b
          on (a.vessel_no = b.vessel_no 
          and a.equip_no = b.equip_no 
          and a.section_code = b.section_code
          and a.plan_code = b.plan_code)
        when matched then
              update
                set a.plan_name = b.plan_name
                  , a.manufacturer = b.manufacturer
                  , a.model = b.model
                  , a.specifications = b.specifications
                  , a.lastest_date = b.lastest_date
                  , a.workers = b.workers
                  , a.work_hours = b.work_hours
                  , a.interval = b.interval
                  , a.interval_term = b.interval_term
                  , a.location = b.location
                  , a.self_maintenance = b.self_maintenance
                  , a.manager = b.manager
                  , a.important_items = b.important_items
                  , a.instructions = b.instructions
                  , a.critical = b.critical
                  , a.modify_date = getdate()
                  , a.modify_user = b.modify_user
        when not matched then
              insert (vessel_no
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
                    , regist_user)
              values (b.vessel_no
                    , b.equip_no
                    , b.section_code
                    , (select format(isnull(max(plan_code), 0) + 1, '000') from [maintenance_plan] where vessel_no = b.vessel_no and equip_no = b.equip_no and section_code = b.section_code)
                    , b.plan_name
                    , b.manufacturer
                    , b.model
                    , b.specifications
                    , b.lastest_date
                    , b.workers
                    , b.work_hours
                    , b.interval
                    , b.interval_term
                    , b.location
                    , b.self_maintenance
                    , b.manager
                    , b.important_items
                    , b.instructions
                    , b.critical
                    , getdate()
                    , b.regist_user);`,
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
        { name: 'registUser', value: item.regist_user },
        { name: 'modifyUser', value: item.modify_user }
      ]
    );

    if (count === 0) {
      return NextResponse.json({ success: false, message: 'Data was not saved.' }, { status: 401 });
    }

    // 성공 정보 반환
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}