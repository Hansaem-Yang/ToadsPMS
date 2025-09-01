import { NextResponse } from 'next/server';
import { execute } from '@/db'; // 이전에 만든 query 함수

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vessel_no
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
          , critical } = body;

    // DB에서 사용자 정보 확인
    const count = await execute(
      `insert into [maintenance_plan] (
              vessel_no
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
            , @lastestDate
            , @workers
            , @workHours
            , @interval
            , @intervalTerm
            , @location
            , @selfMaintenance
            , @manager
            , @importantItems
            , @instructions
            , @critical
      );`,
      [
        { name: 'vesselNo', value: vessel_no },
        { name: 'equipNo', value: equip_no },
        { name: 'sectionCode', value: section_code },
        { name: 'planCode', value: plan_code },
        { name: 'planName', value: plan_name },
        { name: 'manufacturer', value: manufacturer },
        { name: 'model', value: model },
        { name: 'specifications', value: specifications },
        { name: 'lastestDate', value: lastest_date },
        { name: 'workers', value: workers },
        { name: 'workHours', value: work_hours },
        { name: 'interval', value: interval },
        { name: 'intervalTerm', value: interval_term },
        { name: 'location', value: location },
        { name: 'selfMaintenance', value: self_maintenance },
        { name: 'manager', value: manager },
        { name: 'importantItems', value: important_items },
        { name: 'instructions', value: instructions },
        { name: 'critical', value: critical }
      ]
    );

    if (count === 0) {
      return NextResponse.json({ success: false, message: 'Data was not inserted.' }, { status: 401 });
    }

    // 성공 정보 반환
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}