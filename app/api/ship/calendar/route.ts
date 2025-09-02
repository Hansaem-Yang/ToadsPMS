import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Equipment } from '@/types/calendar/equipment';
import { CalendarDate } from '@/types/calendar/calendar_date';
import { Maintenance } from '@/types/calendar/maintenance';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vesselNo = searchParams.get('vesselNo');

  try {
    // DB에서 정보 확인
    const items: Maintenance[] = await query(
      `select a.vessel_no
            , a.equip_no
            , a.equip_name
            , a.section_code
            , a.section_name
            , a.plan_code
            , a.plan_name
            , a.workers
            , a.work_hours
            , a.location
            , a.self_maintenance
            , a.manager
            , a.critical
            , convert(varchar(10), a.lastest_date, 121) as lastest_date
            , convert(varchar(10), a.due_date, 121) as due_date
            , convert(varchar(10), a.extension_date, 121) as extension_date
            , convert(varchar(10), case when a.due_date < getdate() and a.extension_date is null then dateadd(day, -1, getdate()) 
                                        when a.due_date < getdate() and a.extension_date is not null and a.extension_date > getdate() then a.extension_date
                                        else a.due_date end, 121) as calendar_date
            , case when a.due_date < getdate() and a.lastest_date < getdate() and a.extension_date >= getdate() then 'EXTENSION'
			             when a.due_date < getdate() then 'DELAYED' 
                   else 'NORMAL' end as status
         from (select a.vessel_no
                    , c.equip_no
                    , c.equip_name
                    , b.section_code
                    , b.section_name
                    , a.plan_code
                    , a.plan_name
                    , a.workers
                    , a.work_hours
                    , a.location
                    , a.self_maintenance
                    , a.manager
                    , a.critical
                    , a.lastest_date
                    , case a.interval_term when 'YEAR' then dateadd(year, a.interval, a.lastest_date)
                                           when 'MONTH' then dateadd(month, a.interval, a.lastest_date)
                                           when 'DAY' then dateadd(day, a.interval, a.lastest_date)
                                           when 'HOUR' then dateadd(day, a.interval / 24, a.lastest_date) end as due_date
                    , dbo.fn_get_maintenance_extension(a.vessel_no, a.equip_no, a.section_code, a.plan_code) as extension_date
                 from [maintenance_plan] as a
                inner join [section] as b
                   on a.vessel_no = b.vessel_no
                  and a.equip_no = b.equip_no
                  and a.section_code = b.section_code
                inner join [equipment] as c
                   on b.vessel_no = c.vessel_no
                  and b.equip_no = c.equip_no
                where a.vessel_no = @vesselNo) as a
        where (a.due_date < getdate() or (a.due_date >= getdate() and a.due_date <= dateadd(day, 90, getdate())))
          and (a.extension_date is null or (a.extension_date >= getdate() and a.extension_date <= dateadd(day, 90, getdate())))
        order by a.vessel_no, a.equip_no, convert(varchar(10), case when a.due_date < getdate() then dateadd(day, -1, getdate()) else a.due_date end, 121), a.section_code, a.plan_code`,
      [
        { name: 'vesselNo', value: vesselNo }
      ]
    );

    let equipments: Equipment[] = [];
    let equipment : Equipment;
    let calendar : CalendarDate;
    let equipNo: string = '';
    let calendarDate: string = '';

    items.map(item => {
      if (equipNo !== item.equip_no) {
        equipment = {
          vessel_no: item.vessel_no,
          equip_no: item.equip_no,
          equip_name: item.equip_name,
          category: item.category,
          children: [] = []
        }

        equipments.push(equipment);
        equipNo = item.equip_no;
      }

      if (calendarDate !== item.calendar_date) {
        calendar = {
          calendar_date: item.calendar_date,
          children: [] = []
        }

        equipment.children.push(calendar);
        calendarDate = item.calendar_date;
      }

      calendar.children.push(item);
    });

    // 성공 시 정보 반환
    return NextResponse.json(equipments);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}