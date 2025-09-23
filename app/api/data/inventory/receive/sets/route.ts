import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { Receive } from '@/types/inventory/receive/receive';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items : Receive[] = body;

    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();
    try {
      let count = 0;
      for (const item of items) {
        // DB에서 사용자 정보 확인

        let queryString = 
        `merge [receive] as a
        using (select @vesselNo as vessel_no
                    , @receiveNo as receive_no
                    , @materialCode as material_code
                    , @receiveDate as receive_date
                    , @deliveryLocation as delivery_location
                    , @receiveType as receive_type
                    , @receiveUnit as receive_unit
                    , @receiveQty as receive_qty
                    , @receiveLocation as receive_location
                    , @receiveRemark as receive_remark
                    , @registDate as regist_date
                    , @registUser as regist_user) as b
            on (a.vessel_no = b.vessel_no 
            and a.receive_no = b.receive_no)
          when matched then
              update
                  set a.material_code = b.material_code
                    , a.receive_date = b.receive_date
                    , a.delivery_location = b.delivery_location
                    , a.receive_type = b.receive_type
                    , a.receive_unit = b.receive_unit
                    , a.receive_qty = b.receive_qty
                    , a.receive_location = b.receive_location
                    , a.receive_remark = b.receive_remark
                    , a.regist_date = b.regist_date
                    , a.regist_user = b.regist_user
          when not matched then
              insert (vessel_no
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
                    , regist_user)
              values (b.vessel_no
                    , b.receive_no
                    , b.material_code
                    , b.receive_date
                    , b.delivery_location
                    , b.receive_type
                    , b.receive_unit
                    , b.receive_qty
                    , b.receive_location
                    , b.receive_remark
                    , b.regist_date
                    , b.regist_user);`

        let params = [
          { name: 'vesselNo', value: item.vessel_no }, 
          { name: 'receiveNo', value: item.receive_no }, 
          { name: 'materialCode', value: item.material_code }, 
          { name: 'receiveDate', value: item.receive_date }, 
          { name: 'deliveryLocation', value: item.delivery_location }, 
          { name: 'receiveType', value: item.receive_type }, 
          { name: 'receiveUnit', value: item.receive_unit }, 
          { name: 'receiveQty', value: item.receive_qty }, 
          { name: 'receiveLocation', value: item.receive_location }, 
          { name: 'receiveRemark', value: item.receive_remark }, 
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