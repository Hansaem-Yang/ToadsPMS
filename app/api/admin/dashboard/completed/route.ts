import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Maintenance } from '@/types/dashboard/maintenance';

export async function GET(req: Request) {
  try {
    // DB에서 데쉬보드 정보 확인
    const url = new URL(req.url);
    const vessel_no = url.searchParams.get('vesselNo');

    const items: Maintenance[] = await query(
      `select a.vessel_no
            , a.vessel_name
            , b.equip_no
            , c.equip_name
            , b.section_code
            , b.plan_code
            , b.plan_name
            , b.manufacturer
            , b.model
            , b.specifications
            , convert(varchar(10), b.lastest_date, 121) as lastest_date
            , b.workers
            , b.work_hours
            , b.interval
            , b.interval_term
            , b.location
            , b.self_maintenance
            , b.manager
            , b.critical
            , convert(varchar(10), b.due_date, 121) as due_date 
            , convert(varchar(10), b.next_due_date, 121) as next_due_date 
            , convert(varchar(10), b.extension_date, 121) as extension_date 
            , case when b.due_date < getdate() and b.lastest_date < getdate() and b.extension_date >= getdate() then 'EXTENSION'
                    when b.due_date < getdate() then 'DELAYED' 
                    when b.lastest_date >= dateadd(month, datediff(month, 0, getdate()), 0) and b.lastest_date < dateadd(month, 1, dateadd(month, datediff(month, 0, getdate()), 0)) then 'COMPLATE'
                    else 'NORMAL' end as status
            , datediff(day, getdate(), b.due_date) as days_until
            , datediff(day, getdate(), b.extension_date) as extension_days_until
          from [vessel] as a
          left outer join (select vessel_no
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
                                , critical
                                , case interval_term when 'YEAR' then dateadd(year, interval, lastest_date)
                                                    when 'MONTH' then dateadd(month, interval, lastest_date)
                                                    when 'DAY' then dateadd(day, interval, lastest_date)
                                                    when 'HOURS' then dateadd(day, interval / 24, lastest_date) end as due_date
                                , case interval_term when 'YEAR' then dateadd(year, interval, getdate())
                                                    when 'MONTH' then dateadd(month, interval, getdate())
                                                    when 'DAY' then dateadd(day, interval, getdate())
                                                    when 'HOURS' then dateadd(day, interval / 24, getdate()) end as next_due_date
                                , dbo.fn_get_maintenance_extension(vessel_no, equip_no, section_code, plan_code) as extension_date
                            from [maintenance_plan]
                            where vessel_no = @vesselNo) as b
            on a.vessel_no = b.vessel_no
          left outer join [equipment] as c
            on b.vessel_no = c.vessel_no
          and b.equip_no = c.equip_no
        where a.vessel_no = @vesselNo
          and a.use_yn = 'Y'
          and b.lastest_date >= dateadd(month, datediff(month, 0, getdate()), 0) 
          and b.lastest_date < dateadd(month, 1, dateadd(month, datediff(month, 0, getdate()), 0))`,
      [
        { name: 'vesselNo', value: vessel_no },
      ]
    );

    // 성공 시 정비 계획 정보 반환
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}