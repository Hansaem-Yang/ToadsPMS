import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Inventory } from '@/types/inventory/status/inventory'; // ✅ interface import

export async function GET(req: Request) {
  try {
    // DB에서 데쉬보드 정보 확인
    const items: Inventory[] = await query(
      `select a.vessel_no
            , a.vessel_name
            , a.machine_id
            , a.machine_name
            , a.material_code
            , a.material_name
            , a.material_unit
            , a.standard_qty
            , a.stock_qty
            , a.standard_qty - a.stock_qty as shortage_qty
            , a.last_used
         from (select a.vessel_no
                    , a.vessel_name
                    , b.machine_id
                    , c.machine_name
                    , b.material_code
                    , b.material_name
                    , b.material_unit
                    , isnull(b.standard_qty, 0) as standard_qty
                    , sum(isnull(d.receive_qty, 0)) - sum(isnull(e.release_qty, 0)) - sum(isnull(f.loss_qty, 0)) as stock_qty
                    , max(e.release_date) as last_used
                 from [vessel] as a
                 left outer join [material] as b
                   on a.vessel_no = b.vessel_no
                 left outer join [machine] as c
                   on b.vessel_no = c.vessel_no
                  and b.machine_id = c.machine_id
                 left outer join [receive] as d
                   on b.vessel_no = d.vessel_no
                  and b.material_code = d.material_code
                 left outer join [release] as e
                   on b.vessel_no = e.vessel_no
                  and b.material_code = e.material_code
                 left outer join [loss] as f
                   on b.vessel_no = f.vessel_no
                  and b.material_code = f.material_code
                where a.use_yn = 'Y'
                group by a.vessel_no
                       , a.vessel_name
                       , b.machine_id
                       , c.machine_name
                       , b.material_code
                       , b.material_name
                       , b.material_unit
                       , b.standard_qty) as a
        where a.stock_qty < a.standard_qty
        order by a.vessel_no
               , a.machine_id
               , a.material_code`);

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}