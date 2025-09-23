import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { Loss } from '@/types/inventory/loss/loss';

export async function POST(req: Request) {
  try {
    const remoteSiteUrl = process.env.REMOTE_SITE_URL;
    const body = await req.json();
    const items : Loss[] = body;

    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();
    try {
      let count = 0;
      for (const item of items) {
        // DB에서 사용자 정보 확인

        let queryString = `
        insert into [loss] (
               vessel_no
             , loss_no
             , material_code
             , loss_date
             , loss_type
             , loss_unit
             , loss_qty
             , loss_location
             , loss_reason
             , regist_date
             , regist_user
        )
        values (
                @vesselNo
              , (select 'L0' + format(getdate(), 'yyMM') + format(isnull(right(max(loss_no), 3), 0) + 1, '000')
                   from [loss]
                  where vessel_no = @vesselNo)
              , @materialCode
              , @lossDate
              , 'L0'
              , @lossUnit
              , @lossQty
              , @lossLocation
              , @lossReason
              , getdate()
              , @registUser
        );`;

        let params = [
          { name: 'vesselNo', value: item.vessel_no }, 
          { name: 'materialCode', value: item.material_code }, 
          { name: 'lossDate', value: item.loss_date }, 
          { name: 'lossUnit', value: item.loss_unit }, 
          { name: 'lossQty', value: item.loss_qty }, 
          { name: 'lossLocation', value: item.loss_location }, 
          { name: 'lossReason', value: item.loss_reason }, 
          { name: 'registUser', value: item.regist_user }, 
          { name: 'modifyUser', value: item.modify_user }, 
        ];

        const request = new sql.Request(transantion);

        params?.forEach(p => request.input(p.name, p.value));
        let result = await request.query(queryString);
        count += result.rowsAffected[0];
      }

      transantion.commit();

      if (count === 0) {
        return NextResponse.json({ success: false, message: 'Data was not inserted.' }, { status: 401 });
      }

      // 저장된 정비 정보 조회
      const sendData: Loss[] = await query(
        `select vessel_no
              , loss_no
              , material_code
              , loss_date
              , loss_type
              , loss_unit
              , loss_qty
              , loss_location
              , loss_reason
              , regist_date
              , regist_user
           from [loss]
          where vessel_no = @vesselNo
            and regist_user = @registUser
            and regist_date >= convert(varchar(10), getdate(), 121);`,
        [
          { name: 'vesselNo', value: items[0].vessel_no },
          { name: 'registUser', value: items[0].regist_user },
        ]
      );
      
      // 선박에서 저장된 정비 정보 전송
      if (sendData[0]) {
        const transantion1 = pool.transaction();
        await transantion1.begin();

        const fetchResponse = await fetch(`${remoteSiteUrl}/api/data/inventory/loss/sets`, {
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
                `update [loss]
                    set last_send_date = getdate()
                  where vessel_no = @vesselNo
                    and loss_no = @lossNo;`

              const request = new sql.Request(transantion1);
              const params = [
                { name: 'vesselNo', value: item.vessel_no },
                { name: 'lossNo', value: item.loss_no },
              ];

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