import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { ReceiveData } from '@/types/inventory/receive/receive_data';
import { Receive } from '@/types/inventory/receive/receive';

export async function POST(req: Request) {
  try {
    const remoteSiteUrl = process.env.REMOTE_SITE_URL;
    const body = await req.json();
    const receiveData : ReceiveData = body;

    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();

    try {
      let count = 0;
      for (const item of receiveData.materials) {
        // DB에서 사용자 정보 확인

        let queryString = `
        insert into [receive] (
               vessel_no
             , receive_no
             , material_code
             , receive_date
             , delivery_location
             , receive_type
             , receive_unit
             , receive_qty
             , receive_location
             , receive_remark
             , regist_date
             , regist_user
        )
        values (
               @vesselNo
             , (select 'I0' + format(getdate(), 'yyMM') + format(isnull(right(max(receive_no), 3), 0) + 1, '000')
                  from [receive]
                 where vessel_no = @vesselNo
                   and receive_type = 'I0')
             , @materialCode
             , @receiveDate
             , @deliveryLocation
             , 'I0'
             , (select material_unit
                  from material
                 where vessel_no = @vesselNo
                   and material_code = @materialCode)
             , @receiveQty
             , @receiveLocation
             , @receiveRemark
             , getdate()
             , @registUser
        );`;

        let params = [
          { name: 'vesselNo', value: receiveData.vessel_no }, 
          { name: 'materialCode', value: item.material_code }, 
          { name: 'receiveDate', value: receiveData.receive_date }, 
          { name: 'deliveryLocation', value: receiveData.delivery_location }, 
          { name: 'receiveType', value: item.receive_type }, 
          { name: 'receiveQty', value: item.receive_qty }, 
          { name: 'receiveLocation', value: item.delivery_location }, 
          { name: 'receiveRemark', value: item.receive_remark }, 
          { name: 'registUser', value: receiveData.regist_user }, 
          { name: 'modifyUser', value: receiveData.modify_user }, 
        ];

        const request = new sql.Request(transantion);

        params?.forEach(p => request.input(p.name, p.value));
        let result = await request.query(queryString);
        count += result.rowsAffected[0];
      }

      await transantion.commit();

      if (count === 0) {
        return NextResponse.json({ success: false, message: 'Data was not inserted.' }, { status: 401 });
      }

      // 저장된 정비 정보 조회
      const sendData: Receive[] = await query(
        `select vessel_no
              , receive_no
              , material_code
              , receive_date
              , receive_location
              , receive_type
              , receive_unit
              , receive_qty
              , receive_remark
              , delivery_location
              , regist_date
              , regist_user
           from [receive]
          where vessel_no = @vesselNo
            and regist_user = @registUser
            and regist_date >= convert(varchar(10), getdate(), 121);`,
        [
          { name: 'vesselNo', value: receiveData.vessel_no },
          { name: 'registUser', value: receiveData.regist_user },
        ]
      );
      
      // 선박에서 저장된 정비 정보 전송
      if (sendData[0]) {

        const fetchResponse = await fetch(`${remoteSiteUrl}/api/data/inventory/receive/sets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sendData),
        });

        if (fetchResponse.ok) {
          const pool1 = await getPool();
          const transantion1 = pool1.transaction();
          await transantion1.begin();

          // 정비 정보의 마지막 전송일자 수정
          try {
            for (const item of sendData) {
              const queryString = 
                `update [receive]
                    set last_send_date = getdate()
                  where vessel_no = @vesselNo
                    and receive_no = @receiveNo;`

              const params = [
                { name: 'vesselNo', value: item.vessel_no },
                { name: 'receiveNo', value: item.receive_no },
              ];

              const request = new sql.Request(transantion1);
              params?.forEach(p => request.input(p.name, p.value));
              await request.query(queryString);
            }
            
            transantion1.commit();
          } catch (err) {
            transantion1.rollback();
            console.log(err);
            return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
          }
        }
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