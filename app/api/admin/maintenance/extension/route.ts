import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Vessel } from '@/types/extension/vessel';
import { Equipment } from '@/types/extension/equipment';
import { MaintenanceExtension } from '@/types/extension/maintenance_extension';

export async function GET(req: Request) {
  try {
    // DB에서 데쉬보드 정보 확인
    const items: MaintenanceExtension[] = await query(
      `select a.vessel_no
            , e.vessel_name
            , a.equip_no
            , d.equip_name
            , a.section_code
            , c.section_name
            , a.plan_code
            , b.plan_name
            , a.extension_seq
            , convert(varchar(10), a.extension_date, 121) as extension_date
            , a.extension_reason
            , convert(varchar(10), a.request_date, 121) as request_date
            , a.applicant
            , dbo.fn_get_user(a.applicant) as applicant_name
            , a.approval_status
            , convert(varchar(10), a.approval_date, 121) as approval_date
            , a.approver
            , dbo.fn_get_user(a.approver) as approver_name
            , convert(varchar(10), b.lastest_date, 121) as lastest_date
            , convert(varchar(10), case b.interval_term when 'YEAR' then dateadd(year, b.interval, b.lastest_date)
                                                        when 'MONTH' then dateadd(month, b.interval, b.lastest_date)
                                                        when 'DAY' then dateadd(day, b.interval, b.lastest_date)
                                                        when 'HOUR' then dateadd(day, b.interval / 24, b.lastest_date) end, 121) as due_date
         from [maintenance_extension] as a
        inner join [maintenance_plan] as b
           on a.vessel_no = b.vessel_no
          and a.equip_no = b.equip_no
          and a.section_code = b.section_code
          and a.plan_code = b.plan_code
        inner join [section] as c
           on b.vessel_no = c.vessel_no
          and b.equip_no = c.equip_no
          and b.section_code = c.section_code
        inner join [equipment] as d
           on c.vessel_no = d.vessel_no
          and c.equip_no = d.equip_no
        inner join [vessel] as e
           on b.vessel_no = e.vessel_no
        where e.use_yn = 'Y'
        order by a.vessel_no, a.equip_no, a.section_code, a.plan_code, a.extension_seq`
    );

    let vessels: Vessel[] = [];
    let vessel: Vessel;
    let equipment: Equipment;

    let vesselNo: string = '';
    let equipNo: string = '';
    
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
      }

      equipment.children.push(item);
    });

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(vessels);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}