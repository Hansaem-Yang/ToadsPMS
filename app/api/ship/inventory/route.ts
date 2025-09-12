import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Machine } from '@/types/inventory/status/machine'; // ✅ interface import
import { Inventory } from '@/types/inventory/status/inventory'; // ✅ interface import

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vesselNo = searchParams.get('vesselNo');

  try {
    // DB에서 데쉬보드 정보 확인
    const items: Inventory[] = await query(
      `select a.vessel_no
            , a.vessel_name
            , a.machine_id
            , a.machine_name
            , a.material_code
            , a.material_name
            , a.stock_qty
            , a.standard_qty
         from (select a.vessel_no
                    , a.vessel_name
                    , b.machine_id
                    , c.machine_name
                    , b.material_code
                    , b.material_name
                    , sum(isnull(d.receive_qty, 0)) - sum(isnull(e.release_qty, 0)) - sum(isnull(f.loss_qty, 0)) as stock_qty
                    , isnull(b.standard_qty, 0) as standard_qty
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
                 left outer join [warehouse] as g
                   on b.vessel_no = g.vessel_no
                  and b.warehouse_no = g.warehouse_no
                where a.vessel_no = @vesselNo
                  and a.use_yn = 'Y'
                group by a.vessel_no
                       , a.vessel_name
                       , b.machine_id
                       , c.machine_name
                       , b.material_code
                       , b.material_name
                       , b.standard_qty) as a
        where a.stock_qty < a.standard_qty
        order by a.vessel_no
               , a.machine_id
               , a.material_code`,
    [
      { name: 'vesselNo', value: vesselNo }
    ]);

    let machines: Machine[] = [];
    let machine: Machine;

    let machineId: string = '';

    items.map(item => {
      if (machineId !== item.machine_id) {
        machine = {
          vessel_no: item.vessel_no,
          vessel_name: item.vessel_name,
          machine_id: item.machine_id,
          machine_name: item.machine_name,
          children: [] = []
        }

        machines.push(machine);
        machineId = item.machine_id;
      }
      
      if (item.material_code)
        machine.children.push(item);
    });

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(machines);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}