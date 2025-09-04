import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { MaintenanceWork } from '@/types/vessel/maintenance_work';

export async function POST(req: Request) {
  try {
    const remoteSiteUrl = process.env.REMOTE_SITE_URL;
    const body = await req.json();
    const works : MaintenanceWork[] = body;

    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();
    try {
      let count = 0;
      for (const item of works) {
        // DB에서 사용자 정보 확인

        let query = `
        insert into [maintenance_work] (
                vessel_no
              , work_order
              , equip_no
              , section_code
              , plan_code
              , plan_date
              , work_date
              , manager
              , work_details
              , used_parts
              , work_hours
              , delay_reason
              , regist_date
              , regist_user
        )
        values (
                @vesselNo
              , (select isnull(max(work_order), 0) + 1 
                  from [maintenance_work]
                  where vessel_no = @vesselNo)
              , @equipNo
              , @sectionCode
              , @planCode
              , @planDate
              , getdate()
              , @manager
              , @workDetails
              , @usedParts
              , @workHours
              , @delayReason
              , getdate()
              , @registUser
        );`;

        let params = [
          { name: 'vesselNo', value: item.vessel_no }, 
          { name: 'equipNo', value: item.equip_no }, 
          { name: 'sectionCode', value: item.section_code }, 
          { name: 'planCode', value: item.plan_code }, 
          { name: 'planDate', value: item.extension_date? item.extension_date : item.due_date }, 
          { name: 'manager', value: item.manager }, 
          { name: 'workDetails', value: item.work_details }, 
          { name: 'usedParts', value: item.used_parts }, 
          { name: 'workHours', value: item.work_hours }, 
          { name: 'delayReason', value: item.delay_reason }, 
          { name: 'registUser', value: item.regist_user }, 
          { name: 'modifyUser', value: item.modify_user }, 
        ];

        const request = new sql.Request(transantion);

        params?.forEach(p => request.input(p.name, p.value));
        let result = await request.query(query);
        count += result.rowsAffected[0];

        query = `
        update maintenance_plan
           set lastest_date = getdate()
             , modify_date = getdate()
             , modify_user = @modifyUser
         where vessel_no = @vesselNo
           and equip_no = @equipNo
           and section_code = @sectionCode
           and plan_code = @planCode;`;
        
        result = await request.query(query);
        
        query = `
        update equipment
           set lastest_date = getdate()
             , modify_date = getdate()
             , modify_user = @modifyUser
         where vessel_no = @vesselNo
           and equip_no = @equipNo;`;
        
        result = await request.query(query);
      }

      if (count === 0) {
        transantion.rollback();
        return NextResponse.json({ success: false, message: 'Data was not inserted.' }, { status: 401 });
      }

      transantion.commit();

      // 저장된 정비 정보 조회
      const sendData: MaintenanceWork[] = await query(
        `select vessel_no
              , work_order
              , equip_no
              , section_code
              , plan_code
              , plan_date
              , work_date
              , manager
              , work_details
              , used_parts
              , work_hours
              , delay_reason
              , regist_date
              , regist_user
            from [maintenance_work]
          where vessel_no = @vesselNo
            and regist_user = @registUser
            and regist_date >= convert(varchar(10), getdate(), 121);`,
        [
          { name: 'vesselNo', value: works[0].vessel_no },
          { name: 'registUser', value: works[0].regist_user },
        ]
      );
      
      // 선박에서 저장된 정비 정보 전송
      if (sendData[0]) {
        const transantion1 = pool.transaction();
        await transantion1.begin();

        fetch(`${remoteSiteUrl}/api/data/execution/sets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sendData),
        })
        .then(res => {
          if (res.ok) {
            // 정비 정보의 마지막 전송일자 수정
            try {
              
              for (const item of sendData) {
                const queryString = 
                  `update [maintenance_work]
                      set last_send_date = getdate()
                    where vessel_no = @vesselNo
                      and work_order = @workOrder;`

                const request = new sql.Request(transantion);
                const params = [
                  { name: 'vesselNo', value: sendData[0].vessel_no },
                  { name: 'workOrder', value: sendData[0].work_order },
                ];

                params?.forEach(p => request.input(p.name, p.value));
                request.query(queryString);
              }
              
              transantion1.commit();
            } catch (err) {
              transantion1.rollback();
              console.log(err);
              return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
            }
          }
          
          return res.json();
        })
        .catch(err => {
          console.error('Error triggering cron job:', err);
        });
      }
      // 성공 정보 반환
      return NextResponse.json({ success: true });
    } catch (err) {
      transantion.rollback();
      console.log(err);
      return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}