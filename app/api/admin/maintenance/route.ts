import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Maintenance } from '@/types/status/maintenance'; // ✅ interface import

export async function GET(req: Request) {
  try {
    // DB에서 데쉬보드 정보 확인
    const items: Maintenance[] = await query(
      `select a.vessel_no
            , a.vessel_name
            , a.equip_no
            , a.equip_name
            , a.section_code
            , a.section_name
            , a.plan_code
            , a.plan_name
            , a.manufacturer
            , a.model
            , a.specifications
            , a.lastest_date
            , a.workers
            , a.work_hours
            , a.interval
            , a.interval_term
            , a.location
            , a.self_maintenance
            , a.manager
            , a.important_items
            , a.instructions
            , a.critical
            , convert(varchar(10), a.due_date, 121) as due_date 
            , convert(varchar(10), a.extension_date, 121) as extension_date 
            , case when a.due_date < getdate() and a.lastest_date < getdate() and a.extension_date >= getdate() then 'EXTENSION'
			             when a.due_date < getdate() then 'DELAY' 
                   when a.lastest_date >= dateadd(month, datediff(month, 0, getdate()), 0) and a.lastest_date < dateadd(month, 1, dateadd(month, datediff(month, 0, getdate()), 0)) then 'COMPLATE'
                   else 'NORMAL' end as status
            , datediff(day, getdate(), a.due_date) as days_until
            , datediff(day, getdate(), a.extension_date) as extension_days_until
         from (select a.vessel_no
                    , a.vessel_name
                    , b.equip_no
                    , b.equip_name
                    , c.section_code
                    , c.section_name
                    , d.plan_code
                    , d.plan_name
                    , d.manufacturer
                    , d.model
                    , d.specifications
                    , convert(varchar(10), d.lastest_date, 121) as lastest_date
                    , d.workers
                    , d.work_hours
                    , d.interval
                    , d.interval_term
                    , d.location
                    , d.self_maintenance
                    , d.manager
                    , d.important_items
                    , d.instructions
                    , d.critical
                    , convert(varchar(10), case d.interval_term when 'YEAR' then dateadd(year, d.interval, d.lastest_date)
                                                                when 'MONTH' then dateadd(month, d.interval, d.lastest_date)
                                                                when 'DAY' then dateadd(day, d.interval, d.lastest_date)
                                                                when 'HOUR' then dateadd(day, d.interval / 24, d.lastest_date) end, 121) as due_date
                    , dbo.fn_get_maintenance_extension(d.vessel_no, d.equip_no, d.section_code, d.plan_code) as extension_date
                 from [vessel] as a
                 left outer join [equipment] as b
                   on a.vessel_no = b.vessel_no
                 left outer join [section] as c
                   on b.vessel_no = c.vessel_no
                  and b.equip_no = c.equip_no
                 left outer join [maintenance_plan] as d
                   on c.vessel_no = d.vessel_no
                  and c.equip_no = d.equip_no
                  and c.section_code = d.section_code) as a
       order by a.vessel_no, a.equip_no, a.section_code, a.plan_code`);


    let vessels: Maintenance[] = [];
    let vessel: Maintenance;
    let equipment: Maintenance;
    let section: Maintenance;
    let maintenance: Maintenance;

    let vesselNo: string = '';
    let equipNo: string = '';
    let sectionCode: string = '';

    items.map(item => {
      if (vesselNo !== item.vessel_no) {
        vessel = {
          id: item.vessel_no,
          name: item.vessel_name,
          vessel_no: '',
          vessel_name: '',
          equip_no: '',
          equip_name: '',
          section_code: '',
          section_name: '',
          plan_code: '',
          plan_name: '',
          manufacturer: '',
          model: '',
          specifications: '',
          lastest_date: '',
          workers: 0,
          work_hours: 0,
          interval: 0,
          interval_term: '',
          location: '',
          self_maintenance: '',
          manager: '',
          critical: '',
          due_date: '',
          next_due_date: '',
          extension_date: '',
          status: '',
          days_until: 0,
          extension_days_until: 0,
          type: "VESSEL",
          children: [] = []
        }

        vessels.push(vessel);
        vesselNo = item.vessel_no;
      }

      if (item.equip_no !== null) {
        if (equipNo !== item.equip_no) {
          equipment = {
            id: item.equip_no,
            name: item.equip_name,
            vessel_no: '',
            vessel_name: '',
            equip_no: '',
            equip_name: '',
            section_code: '',
            section_name: '',
            plan_code: '',
            plan_name: '',
            manufacturer: '',
            model: '',
            specifications: '',
            lastest_date: '',
            workers: 0,
            work_hours: 0,
            interval: 0,
            interval_term: '',
            location: '',
            self_maintenance: '',
            manager: '',
            critical: '',
            due_date: '',
            next_due_date: '',
            extension_date: '',
            status: '',
            days_until: 0,
            extension_days_until: 0,
            type: "EQUIPMENT",
            children: [] = []
          }

          vessel?.children.push(equipment);
          equipNo = item.equip_no;
        }

        if (item.section_code !== null) {
          if (sectionCode !== item.section_code) {
            
            section = {
              id: `${item.equip_no}-${item.section_code}`,
              name: item.section_name,
              vessel_no: '',
              vessel_name: '',
              equip_no: '',
              equip_name: '',
              section_code: '',
              section_name: '',
              plan_code: '',
              plan_name: '',
              manufacturer: '',
              model: '',
              specifications: '',
              lastest_date: '',
              workers: 0,
              work_hours: 0,
              interval: 0,
              interval_term: '',
              location: '',
              self_maintenance: '',
              manager: '',
              critical: '',
              due_date: '',
              next_due_date: '',
              extension_date: '',
              status: '',
              days_until: 0,
              extension_days_until: 0,
              type: "SECTION",
              children: [] = []
            }

            equipment?.children.push(section);
            sectionCode = item.section_code;
          }

          maintenance = item;
          maintenance.id = `${item.equip_no}-${item.section_code}-${item.plan_code}`;
          maintenance.name = item.plan_name;
          maintenance.type = "TASK";

          section?.children.push(maintenance);
        }
      }
    });

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(vessels);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}