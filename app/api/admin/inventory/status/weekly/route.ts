import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Vessel } from '@/types/inventory/status/vessel'; // ✅ interface import
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
            , cast(year(getdate()) as varchar(4)) + '-' + right('0' + cast(datepart(wk, getdate()) as varchar(2)), 2) as [period]
            , isnull(a.receive_qty, 0) as receive_qty
            , isnull(a.release_qty, 0) as release_qty
            , isnull(a.loss_qty, 0) as loss_qty
            , isnull(a.total_receive_qty, 0) - (isnull(a.total_release_qty, 0) + isnull(a.total_loss_qty, 0)) as stock_qty
         from (select a.vessel_no
                    , a.vessel_name
                    , b.machine_id
                    , c.machine_name
                    , c.sort_no
                    , b.material_code
                    , b.material_name
                    , b.material_unit
                    , isnull(b.standard_qty, 0) as standard_qty
                    , (select sum(isnull(receive_qty, 0))
                         from [receive]
                        where vessel_no = b.vessel_no
                          and material_code = b.material_code
                          and receive_date >= dateadd(wk, datediff(wk, 0, getdate()), 0) and receive_date < dateadd(wk, datediff(wk, 0, getdate()), 7)) as receive_qty
                    , (select sum(isnull(release_qty, 0))
                         from [release]
                        where vessel_no = b.vessel_no
                          and material_code = b.material_code
                          and release_date >= dateadd(wk, datediff(wk, 0, getdate()), 0) and release_date < dateadd(wk, datediff(wk, 0, getdate()), 7)) as release_qty
                    , (select sum(isnull(loss_qty, 0))
                         from [loss]
                        where vessel_no = b.vessel_no
                          and material_code = b.material_code
                          and loss_date >= dateadd(wk, datediff(wk, 0, getdate()), 0) and loss_date < dateadd(wk, datediff(wk, 0, getdate()), 7)) as loss_qty
                    , (select sum(isnull(receive_qty, 0))
                         from [receive]
                        where vessel_no = b.vessel_no
                          and material_code = b.material_code) as total_receive_qty
                    , (select sum(isnull(release_qty, 0))
                         from [release]
                        where vessel_no = b.vessel_no
                          and material_code = b.material_code) as total_release_qty
                    , (select sum(isnull(loss_qty, 0))
                         from [loss]
                        where vessel_no = b.vessel_no
                          and material_code = b.material_code) as total_loss_qty
                 from [vessel] as a
                 left outer join [material] as b
                   on a.vessel_no = b.vessel_no
                 left outer join [machine] as c
                   on b.vessel_no = c.vessel_no
                  and b.machine_id = c.machine_id
                 left outer join [warehouse] as d
                   on b.vessel_no = d.vessel_no
                  and b.warehouse_no = d.warehouse_no
                where a.use_yn = 'Y') as a
        order by a.vessel_no
               , a.sort_no
               , a.material_code`);

    let vessels: Vessel[] = [];
    let vessel: Vessel;

    let vesselNo: string = '';

    items.map(item => {
      if (vesselNo !== item.vessel_no) {
        vessel = {
          vessel_no: item.vessel_no,
          vessel_name: item.vessel_name,
          children: [] = []
        }

        vessels.push(vessel);
        vesselNo = item.vessel_no;
      }
      
      if (item.material_code)
        vessel.children.push(item);
    });

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(vessels);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}