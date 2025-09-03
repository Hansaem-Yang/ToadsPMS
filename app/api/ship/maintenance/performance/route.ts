import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Vessel } from '@/types/performance/vessel';
import { Equipment } from '@/types/performance/equipment';
import { Maintenance } from '@/types/performance/maintenance';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paramVesselNo = searchParams.get('vesselNo');

  try {
    // DB에서 데쉬보드 정보 확인
    const items: Maintenance[] = await query(
      `select a.vessel_no
            , a.vessel_name
            , a.imo_no
            , b.equip_no
            , b.equip_name
            , b.category
            , c.section_code
            , c.section_name
            , d.plan_code
            , d.plan_name
            , d.interval
            , d.interval_term
            , convert(varchar(10), d.lastest_date, 121) as lastest_date
            , convert(varchar(10), case d.interval_term when 'YEAR' then dateadd(year, d.interval, d.lastest_date)
                                                        when 'MONTH' then dateadd(month, d.interval, d.lastest_date)
                                                        when 'DAY' then dateadd(day, d.interval, d.lastest_date)
                                                        when 'HOUR' then dateadd(day, d.interval / 24, d.lastest_date) end, 121) as due_date
            , convert(varchar(10), e.work_date, 121) as work_date
          from [vessel] as a
         inner join [equipment] as b
            on a.vessel_no = b.vessel_no
         inner join [section] as c
            on b.vessel_no = c.vessel_no
           and b.equip_no = c.equip_no
         inner join [maintenance_plan] as d
            on c.vessel_no = d.vessel_no
           and c.equip_no = d.equip_no
           and c.section_code = d.section_code
           left outer join (select a1.vessel_no
                                 , a1.equip_no
                                 , a1.section_code
                                 , a1.plan_code
                                 , a1.work_date
                             from (select vessel_no
                                         , equip_no
                                         , section_code
                                         , plan_code
                                         , work_date
                                         , ROW_NUMBER() OVER (
                                               PARTITION BY vessel_no, equip_no, section_code, plan_code
                                               ORDER BY work_date DESC
                                           ) AS rownum
                                     from [maintenance_work]) as a1
                                     where a1.rownum <= 5) as e
            on d.vessel_no = e.vessel_no
           and d.equip_no = e.equip_no
           and d.section_code = e.section_code
           and d.plan_code = e.plan_code
         where a.vessel_no = @vesselNo
           and a.use_yn = 'Y'
         order by a.vessel_no, b.equip_no, c.section_code, d.plan_code, e.work_date`,
      [
        { name: 'vesselNo', value: paramVesselNo }
      ]
    );

    let vessels: Vessel[] = [];
    let vessel: Vessel;
    let equipment: Equipment;
    let maintenance: Maintenance;

    let vesselNo: string = '';
    let equipNo: string = '';
    let workCode: string = '';
    
    items.map(item => {
      if (vesselNo !== item.vessel_no) {
        vessel = {
          vessel_no: item.vessel_no,
          vessel_name: item.vessel_name,
          imo_no: item.imo_no,
          type: '',
          children: [],
        }

        vessels.push(vessel);
        vesselNo = item.vessel_no;
        equipNo = ''
        workCode = '';
      }

      if (equipNo !== item.equip_no) {
        equipment = {
          vessel_no: item.vessel_no,
          equip_no: item.equip_no,
          equip_name: item.equip_name,
          category: item.category,
          type: '',
          children: [],
        }

        vessel.children.push(equipment);
        equipNo = item.equip_no;
        workCode = '';
      }

      if (workCode !== `${item.section_code}=${item.plan_code}`) {
        maintenance = {
          vessel_no: item.vessel_no,
          vessel_name: item.vessel_name,
          imo_no: item.imo_no,
          equip_no: item.equip_no,
          equip_name: item.equip_name,
          category: item.category,
          section_code: item.section_code,
          section_name: item.section_name,
          plan_code: item.plan_code,
          plan_name: item.plan_name,
          interval: item.interval,
          interval_term: item.interval_term,
          lastest_date: item.lastest_date,
          due_date: item.due_date,
          work_date: item.work_date,
          children: []
        }
        equipment.children.push(maintenance);
        workCode = `${item.section_code}=${item.plan_code}`;
      }

      maintenance.children.push(item.work_date);
    });

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(vessels);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}