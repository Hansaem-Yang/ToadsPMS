import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Equipment } from '@/types/vessel/equipment';
import { Section } from '@/types/vessel/section';
import { MaintenancePlan } from '@/types/vessel/maintenance_plan';
import { Maintenance } from '@/types/vessel/maintenance';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vesselNo = searchParams.get('vesselNo');

  try {
    // DB에서 데쉬보드 정보 확인
    const items: Maintenance[] = await query(
      `select a.vessel_no
            , a.equip_no
            , a.equip_name
            , a.manufacturer as equip_manufacturer
            , a.model as equip_model
            , a.specifications as equip_specifications
            , b.section_code
            , b.section_name
            , b.description
            , c.plan_code
            , c.plan_name
            , c.manufacturer
            , c.model
            , c.specifications
            , convert(varchar(10), c.lastest_date, 121) as lastest_date
            , c.workers
            , c.work_hours
            , c.interval
            , c.interval_term
            , c.location
            , c.self_maintenance
            , c.manager
            , c.important_items
            , c.instructions
            , c.critical
            , convert(varchar(10), case c.interval_term when 'YEAR' then dateadd(year, c.interval, c.lastest_date)
                                                        when 'MONTH' then dateadd(month, c.interval, c.lastest_date)
                                                        when 'DAY' then dateadd(day, c.interval, c.lastest_date)
                                                        when 'HOUR' then dateadd(day, c.interval / 24, c.lastest_date) end, 121) as due_date
         from [equipment] as a
         left outer join [section] as b
           on a.vessel_no = b.vessel_no
          and a.equip_no = b.equip_no
         left outer join [maintenance_plan] as c
           on b.vessel_no = c.vessel_no
          and b.equip_no = c.equip_no
          and b.section_code = c.section_code
        where a.vessel_no = @vesselNo
        order by a.vessel_no, a.equip_no, b.section_code, c.plan_code`,
      [
        { name: 'vesselNo', value: vesselNo }
      ]
    );
    
    let equips: Equipment[] = [];
    let equip: Equipment;
    let section : Section;
    let maintenance : MaintenancePlan;
    
    let equipNo: string = '';
    let sectionCode: string = '';

    items.map(item => {
      if (equipNo !== item.equip_no) {
        equip = {
          vessel_no: item.vessel_no,
          equip_no: item.equip_no,
          equip_name: item.equip_name,
          manufacturer: item.equip_manufacturer,
          category: '',
          model: item.equip_model,
          machine_name: '',
          specifications: item.equip_specifications,
          description: '',
          lastest_date: '',
          due_date: '',
          maintenance_count: 0,
          section_count: 0,
          regist_date: '',
          regist_user: '',
          modify_date: '',
          modify_user: '',
          children: []
        }
        
        equips.push(equip);
        equipNo = item.equip_no;
        sectionCode = '';
      }

      if (sectionCode !== item.section_code) {
        section = {
          vessel_no: item.vessel_no,
          equip_no: item.equip_no,
          section_code: item.section_code,
          section_name: item.section_name,
          description: item.description,
          due_date: '',
          maintenance_count: 0,
          regist_date: '',
          regist_user: '',
          modify_date: '',
          modify_user: '',
          children: [],
        }

        equip.children.push(section);
        sectionCode = item.section_code;
      }

      if (item.plan_code !== null)
        section.children.push(item);
    });

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(equips);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}