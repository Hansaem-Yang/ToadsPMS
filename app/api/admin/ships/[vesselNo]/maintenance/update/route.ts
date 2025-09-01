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
        where vessel_no = @vesselNo 
          and equip_no = @equipNo 
          and section_code = @sectionCode
          and plan_code = @planCode;`,
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
      return NextResponse.json({ success: false, message: 'Data was not updated.' }, { status: 401 });
    }

    // 성공 정보 반환
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}