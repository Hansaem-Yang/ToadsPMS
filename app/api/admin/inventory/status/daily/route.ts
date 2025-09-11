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
            , b.machine_id
            , c.machine_name
            , b.material_code
            , b.material_name
            , b.material_unit
            , isnull(b.standard_qty, 0) as standard_qty
            , convert(varchar(10), getdate(), 121) as [period]
            , sum(case when d.receive_date = convert(varchar(10), getdate(), 121) then isnull(d.receive_qty, 0) else 0 end) as receive_qty
            , sum(case when e.release_date = convert(varchar(10), getdate(), 121) then isnull(e.release_qty, 0) else 0 end) as release_qty
            , sum(case when f.loss_date = convert(varchar(10), getdate(), 121) then isnull(f.loss_qty, 0) else 0 end) as loss_qty
            , sum(isnull(d.receive_qty, 0)) - sum(isnull(e.release_qty, 0)) - sum(isnull(f.loss_qty, 0)) as stock_qty
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
               , b.standard_qty
        order by a.vessel_no
               , b.machine_id
               , b.material_code`);

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

    console.log(vessels);

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(vessels);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}