import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Stock } from '@/types/inventory/loss/stock';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vesselNo = searchParams.get('vesselNo');

  try {
    // DB에서 데쉬보드 정보 확인
    const items: Stock[] = await query(
      `select a.vessel_no
            , a.vessel_name
            , a.machine_id
            , a.machine_name
            , a.material_code
            , a.material_name
            , a.material_unit
            , a.receive_qty - (a.release_qty + a.loss_qty) as stock_qty
         from (select a.vessel_no
                    , a.vessel_name
                    , b.machine_id
                    , c.machine_name
                    , b.material_code
                    , b.material_name
                    , b.material_unit
                    , isnull((select sum(receive_qty)
                                from [receive] 
                               where vessel_no = b.vessel_no
                                 and material_code = b.material_code), 0) as receive_qty
                    , isnull((select sum(release_qty)
                                from [release] 
                               where vessel_no = b.vessel_no
                                 and material_code = b.material_code), 0) as release_qty
                    , isnull((select sum(loss_qty)
                                from [loss] 
                               where vessel_no = b.vessel_no
                                 and material_code = b.material_code), 0) as loss_qty
                 from vessel as a
                 left outer join material as b
                   on a.vessel_no = b.vessel_no
                 left outer join machines as c
                   on b.vessel_no = c.vessel_no
                  and b.machine_id = c.machine_id
                where a.vessel_no = @vesselNo
                  and a.use_yn = 'Y') as a
        where a.receive_qty > a.release_qty + a.loss_qty;`,
      [
        { name: 'vesselNo', value: vesselNo }
      ]
    );

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}