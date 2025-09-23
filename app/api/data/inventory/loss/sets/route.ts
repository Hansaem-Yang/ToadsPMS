import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { Loss } from '@/types/inventory/loss/loss';

export async function POST(req: Request) {
  try {
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

        let queryString = 
        `merge [loss] as a
        using (select @vesselNo as vessel_no
                    , @lossNo as loss_no
                    , @materialCode as material_code
                    , @lossDate as loss_date
                    , @lossType as loss_type
                    , @lossUnit as loss_unit
                    , @lossQty as loss_qty
                    , @lossLocation as loss_location
                    , @lossReason as loss_reason
                    , @registDate as regist_date
                    , @registUser as regist_user) as b
            on (a.vessel_no = b.vessel_no 
            and a.lossNo = b.lossNo)
          when matched then
              update
                  set a.material_code = b.material_code
                    , a.loss_date = b.loss_date
                    , a.loss_type = b.loss_type
                    , a.loss_unit = b.loss_unit
                    , a.loss_qty = b.loss_qty
                    , a.loss_location = b.loss_location
                    , a.loss_reason = b.loss_reason
                    , a.regist_date = b.regist_date
                    , a.regist_user = b.regist_user
          when not matched then
              insert (vessel_no
                    , loss_no
                    , material_code
                    , loss_date
                    , loss_type
                    , loss_unit
                    , loss_qty
                    , loss_location
                    , loss_reason
                    , regist_date
                    , regist_user)
              values (b.vessel_no
                    , b.loss_no
                    , b.material_code
                    , b.loss_date
                    , b.loss_type
                    , b.loss_unit
                    , b.loss_qty
                    , b.loss_location
                    , b.loss_reason
                    , b.regist_date
                    , b.regist_user);`

        let params = [
          { name: 'vesselNo', value: item.vessel_no }, 
          { name: 'lossNo', value: item.loss_no }, 
          { name: 'materialCode', value: item.material_code }, 
          { name: 'lossDate', value: item.loss_date }, 
          { name: 'lossType', value: item.loss_type }, 
          { name: 'lossUnit', value: item.loss_unit }, 
          { name: 'lossQty', value: item.loss_qty }, 
          { name: 'lossLocation', value: item.loss_location }, 
          { name: 'lossReason', value: item.loss_reason }, 
          { name: 'registDate', value: item.regist_date }, 
          { name: 'registUser', value: item.regist_user }, 
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