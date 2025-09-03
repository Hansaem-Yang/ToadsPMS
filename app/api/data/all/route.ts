import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { PMSData } from '@/types/data/pms_data';
import { Equipment } from '@/types/vessel/equipment';
import { Section } from '@/types/vessel/section';
import { MaintenancePlan } from '@/types/vessel/maintenance_plan';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vesselNo = searchParams.get('vesselNo');
  let reqDate = searchParams.get('reqDate');

  if (!reqDate) {
    reqDate = '1900-01-01';
  }

  try {
    // DB에서 정보 확인
    const equipments: Equipment[] = await query(
      `select vessel_no
            , equip_no
            , equip_name
            , manufacturer
            , model
            , specifications
            , description
            , category
            , lastest_date
            , machine
            , regist_date
            , regist_user
            , modify_date
            , modify_user
         from [equipment]
        where vessel_no = @vesselNo
          and (regist_date >= @reqDate or modify_date >= @reqDate)`,
      [
        { name: 'vesselNo', value: vesselNo },
        { name: 'reqDate', value: reqDate }
      ]
    );

    const sections: Section[] = await query(
      `select vessel_no
            , equip_no
            , section_code
            , section_name
            , description
            , regist_date
            , regist_user
            , modify_date
            , modify_user
         from [section]
        where vessel_no = @vesselNo
          and (regist_date >= @reqDate or modify_date >= @reqDate)`,
      [
        { name: 'vesselNo', value: vesselNo },
        { name: 'reqDate', value: reqDate }
      ]
    );
    
    const maintenances: MaintenancePlan[] = await query(
      `select vessel_no
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
            , regist_user
            , modify_date
            , modify_user
         from [maintenance_plan]
        where vessel_no = @vesselNo
          and (regist_date >= @reqDate or modify_date >= @reqDate)`,
      [
        { name: 'vesselNo', value: vesselNo },
        { name: 'reqDate', value: reqDate }
      ]
    );
    
    const pmsData : PMSData = {
      req_date: reqDate,
      equipments: equipments,
      sections: sections,
      maintenances: maintenances,
    };

    // 성공 시 정보 반환
    return NextResponse.json(pmsData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}