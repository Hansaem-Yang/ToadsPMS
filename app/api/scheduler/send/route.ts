import { NextResponse } from 'next/server';
import { query, getSql, getPool } from '@/db'; // 이전에 만든 query 함수
import { PMSData } from '@/types/data/pms_data';
import { Vessel } from '@/types/vessel/vessel';
import { Equipment } from '@/types/vessel/equipment';
import { Section } from '@/types/vessel/section';
import { MaintenancePlan } from '@/types/vessel/maintenance_plan';
import { MaintenanceExtension } from '@/types/vessel/maintenance_extension';
import { MaintenanceWork } from '@/types/vessel/maintenance_work';

export async function GET(req: Request) {
  try {
    const remoteSiteUrl = process.env.REMOTE_SITE_URL;
    let vesselNo = process.env.VESSEL;
    if (!vesselNo)
      vesselNo = ''

    const vessels: Vessel[] = await query(
      `select vessel_no
            , vessel_name
            , imo_no
            , use_yn
            , vessel_short_name
            , regist_date
            , regist_user
            , modify_date
            , modify_user
         from [vessel]
        where vessel_no = @vesselNo
          and (regist_date > last_send_date or modify_date > last_send_date)
          and (regist_date > last_receive_date or modify_date > last_receive_date)`,
      [
        { name: 'vesselNo', value: vesselNo }
      ]
    );

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
          and (regist_date > last_send_date or modify_date > last_send_date)
          and (regist_date > last_receive_date or modify_date > last_receive_date)`,
      [
        { name: 'vesselNo', value: vesselNo }
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
          and (regist_date > last_send_date or modify_date > last_send_date)
          and (regist_date > last_receive_date or modify_date > last_receive_date)`,
      [
        { name: 'vesselNo', value: vesselNo }
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
          and (regist_date > last_send_date or modify_date > last_send_date)
          and (regist_date > last_receive_date or modify_date > last_receive_date)`,
      [
        { name: 'vesselNo', value: vesselNo }
      ]
    );
    
    const extensions: MaintenanceExtension[] = await query(
      `select vessel_no
            , equip_no
            , section_code
            , plan_code
            , extension_seq
            , extension_date
            , extension_reason
            , request_date
            , applicant
            , approval_status
            , approval_date
            , approver
            , regist_date
            , regist_user
            , modify_date
            , modify_user
         from [maintenance_extension]
        where vessel_no = @vesselNo
          and (regist_date > last_send_date or modify_date > last_send_date)
          and (regist_date > last_receive_date or modify_date > last_receive_date)`,
      [
        { name: 'vesselNo', value: vesselNo }
      ]
    );
    
    
    const works: MaintenanceWork[] = await query(
      `select work_order
            , work_date
            , manager
            , work_details
            , used_parts
            , work_hours
            , delay_reason
            , plan_date
            , vessel_no
            , equip_no
            , section_code
            , plan_code
            , regist_date
            , regist_user
            , modify_date
            , modify_user
         from [maintenance_work]
        where vessel_no = @vesselNo
          and (regist_date > last_send_date or modify_date > last_send_date)
          and (regist_date > last_receive_date or modify_date > last_receive_date)`,
      [
        { name: 'vesselNo', value: vesselNo }
      ]
    );
    
    const sendPmsData : PMSData = {
      vessel_no: vesselNo,
      last_receive_date: '',
      vessels: vessels,
      equipments: equipments,
      sections: sections,
      maintenances: maintenances,
      extensions: extensions,
      works: works,
    };

    const response = await fetch(`${remoteSiteUrl}/api/data/all/set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendPmsData),
    });

    if (response.ok) {
      const sql = await getSql();
      const pool = await getPool();
      const transantion = pool.transaction();
      await transantion.begin();
      try {
        let queryString = `
        update [vessel]
           set last_send_date = getdate()
         where vessel_no = @vesselNo
           and (regist_date > last_send_date or modify_date > last_send_date)
           and (regist_date > last_receive_date or modify_date > last_receive_date);`;

        let params = [
          { name: 'vesselNo', value: vesselNo },
        ];

        const request = new sql.Request(transantion);

        params?.forEach(p => request.input(p.name, p.value));
        await request.query(queryString);

        queryString = `
        update [equipment]
           set last_send_date = getdate()
         where vessel_no = @vesselNo
           and (regist_date > last_send_date or modify_date > last_send_date)
           and (regist_date > last_receive_date or modify_date > last_receive_date);`;

        await request.query(queryString);

        queryString = `
        update [section]
           set last_send_date = getdate()
         where vessel_no = @vesselNo
           and (regist_date > last_send_date or modify_date > last_send_date)
           and (regist_date > last_receive_date or modify_date > last_receive_date);`;
           
        await request.query(queryString);

        queryString = `
        update [maintenance_plan]
           set last_send_date = getdate()
         where vessel_no = @vesselNo
           and (regist_date > last_send_date or modify_date > last_send_date)
           and (regist_date > last_receive_date or modify_date > last_receive_date);`;
           
        await request.query(queryString);

        queryString = `
        update [maintenance_extension]
           set last_send_date = getdate()
         where vessel_no = @vesselNo
           and (regist_date > last_send_date or modify_date > last_send_date)
           and (regist_date > last_receive_date or modify_date > last_receive_date);`;
           
        await request.query(queryString);

        queryString = `
        update [maintenance_work]
           set last_send_date = getdate()
         where vessel_no = @vesselNo
           and (regist_date > last_send_date or modify_date > last_send_date)
           and (regist_date > last_receive_date or modify_date > last_receive_date);`;
           
        await request.query(queryString);

        transantion.commit();
        // 성공 정보 반환
        return NextResponse.json({ success: true });
      } catch (err) {
        transantion.rollback();
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
      }
    }
    else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}