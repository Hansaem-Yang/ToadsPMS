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
      `select vessel_no
            , machine_id
            , machine_name
            , material_code
            , material_name
            , material_unit
            , warehouse_no
            , standard_qty
            , isnull(receive_qty, 0) - (isnull(release_qty, 0) + isnull(loss_qty, 0)) stock_qty
         from (select a.vessel_no
                    , b.machine_id
                    , c.machine_name
                    , c.sort_no
                    , b.material_code
                    , b.material_name
                    , b.material_unit
                    , b.warehouse_no
                    , b.standard_qty
                    , (select sum(isnull(receive_qty, 0))
                         from [receive]
                        where vessel_no = b.vessel_no
                          and material_code = b.material_code) as receive_qty
                    , (select sum(isnull(release_qty, 0))
                         from [release]
                        where vessel_no = b.vessel_no
                          and material_code = b.material_code) as release_qty
                    , (select sum(isnull(loss_qty, 0))
                         from [loss]
                        where vessel_no = b.vessel_no
                          and material_code = b.material_code) as loss_qty
                 from [vessel] as a
                inner join [material] as b
                   on a.vessel_no = b.vessel_no
                 left outer join [machine] as c
                   on b.vessel_no = c.vessel_no
                  and b.machine_id = c.machine_id
                where a.vessel_no = @vesselNo
                  and a.use_yn = 'Y') as a
        order by a.vessel_no, a.sort_no, a.material_code;`,
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