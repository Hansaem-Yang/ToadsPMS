import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Equipment } from '@/types/vessel/equipment';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vesselNo = searchParams.get('vesselNo');

  try {
    // DB에서 데쉬보드 정보 확인
    const items: Equipment[] = await query(
      `select a.vessel_no
            , a.equip_no
            , a.equip_name
            , a.manufacturer
            , a.category
            , a.model
            , a.specifications
            , a.description
            , a.lastest_date
            , min(convert(varchar(10), b.due_date, 121)) as due_date
            , count(b.plan_code) as maintenance_count
            , (select count(1) from section where vessel_no = a.vessel_no and equip_no = a.equip_no) as section_count
         from [equipment] as a
         left outer join (select a1.vessel_no
                               , a1.equip_no
                               , a1.section_code
                               , a1.plan_code
                               , case a1.interval_term when 'YEAR' then dateadd(year, a1.interval, a1.lastest_date)
                                                       when 'MONTH' then dateadd(month, a1.interval, a1.lastest_date)
                                                       when 'DAY' then dateadd(day, a1.interval, a1.lastest_date)
                                                       when 'HOUR' then dateadd(day, a1.interval / 24, a1.lastest_date) end as due_date
                            from [maintenance_plan] as a1
                           where vessel_no = @vesselNo) as b
           on a.vessel_no = b.vessel_no
          and a.equip_no = b.equip_no
        where a.vessel_no = @vesselNo
        group by a.vessel_no
            , a.equip_no
            , a.equip_name
            , a.manufacturer
            , a.category
            , a.model
            , a.specifications
            , a.description
            , a.lastest_date`,
      [
        { name: 'vesselNo', value: vesselNo }
      ]
    );

    // if (items.length === 0) {
    //   return NextResponse.json({ success: false, message: 'The data does not exist.' }, { status: 401 });
    // }

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}