import { NextResponse } from 'next/server';
import { execute, query } from '@/db'; // 이전에 만든 query 함수
import { Equipment } from '@/types/vessel/equipment';

export async function POST(req: Request) {
  try {
    const remoteSiteUrl = process.env.REMOTE_SITE_URL;
    const body = await req.json();
    const item: Equipment = body;

    // DB에서 사용자 정보 확인
    const count = await execute(
      `update [equipment]
          set equip_name = @equipName
            , category = @category
            , manufacturer = @manufacturer
            , model = @model
            , description = @description
            , modify_date = getdate()
            , modify_user = @modifyUser
        where vessel_no = @vesselNo 
          and equip_no = @equipNo;`,
      [
        { name: 'vesselNo', value: item.vessel_no },
        { name: 'equipNo', value: item.equip_no },
        { name: 'equipName', value: item.equip_name },
        { name: 'category', value: item.category },
        { name: 'manufacturer', value: item.manufacturer },
        { name: 'model', value: item.model },
        { name: 'description', value: item.description },
        { name: 'modifyUser', value: item.modify_user },
      ]
    );

    if (count === 0) {
      return NextResponse.json({ success: false, message: 'Data was not updated.' }, { status: 401 });
    }

    // 저장된 장비 정보 조회
    const sendData: Equipment[] = await query(
      `select vessel_no
            , equip_no
            , equip_name
            , category
            , manufacturer
            , model
            , description
            , regist_date
            , regist_user
         from [equipment]
        where vessel_no = @vesselNo
          and equip_no = (select max(equip_no) 
                            from [equipment]
                           where vessel_no = @vesselNo
                             and registUser = @registUser);`,
      [
        { name: 'vesselNo', value: item.vessel_no },
        { name: 'registUser', value: item.regist_user },
      ]
    );
    
    // 선박에서 저장된 장비 정보 전송
    if (sendData[0]) {
      fetch(`${remoteSiteUrl}/api/data/equipment/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendData[0]),
      })
      .then(res => {
        if (res.ok) {
          // 장비 정보의 마지막 전송일자 수정
          execute(
            `update [equipment]
                set last_send_date = getdate()
              where vessel_no = @vesselNo
                and equip_no = @equipNo;`,
            [
              { name: 'vesselNo', value: sendData[0].vessel_no },
              { name: 'equipNo', value: sendData[0].equip_no },
            ]
          );
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
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}