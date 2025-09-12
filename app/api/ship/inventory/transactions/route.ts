import { NextResponse } from 'next/server';
import { query } from '@/db'; // 이전에 만든 query 함수
import { Transactions } from '@/types/inventory/transactions/transactions'; // ✅ interface import

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item: Transactions = body;

    // DB에서 데쉬보드 정보 확인
    const items: Transactions[] = await query(
      `select a.vessel_no
            , b.vessel_name
            , convert(varchar(10), a.date, 121) as date
            , a.type
            , a.no
            , a.material_code
            , c.material_name
            , c.machine_id
            , d.machine_name
            , a.location
            , a.unit
            , a.qty
            , a.reason
            , a.regist_user
            , dbo.fn_get_user(a.regist_user) as registrant
         from (select vessel_no
                    , release_no as no
                    , material_code
                    , release_date as date
                    , release_type as type
                    , release_unit as unit
                    , release_qty as qty
                    , isnull(release_location, '') as location
                    , '' as reason
                    , release_remark as remark
               	   , regist_user
                 from [release]
                where release_date between convert(varchar(10), @startDate, 121) and convert(varchar(10), @endDate, 121)
                  and release_type in ('O0', 'AO')
               union all
               select vessel_no
                    , receive_no
                    , material_code
                    , receive_date
                    , receive_type
                    , receive_unit
                    , receive_qty
                    , isnull(receive_location, '')
                    , ''
                    , receive_remark
               	    , regist_user
                 from [receive]
                where receive_date between convert(varchar(10), @startDate, 121) and convert(varchar(10), @endDate, 121)
                  and receive_type in ('I0', 'AI')
               union all
               select vessel_no
                    , loss_no
                    , material_code
                    , loss_date
                    , loss_type
                    , loss_unit
                    , loss_qty
                    , isnull(loss_location, '')
                    , loss_reason
                    , loss_remark
               	    , regist_user
                 from [loss]
                where loss_date between convert(varchar(10), @startDate, 121) and convert(varchar(10), @endDate, 121)) as a
        inner join vessel as b
           on a.vessel_no = b.vessel_no
        inner join material as c
           on a.vessel_no = c.vessel_no
          and a.material_code = c.material_code
        inner join [machine] as d
           on c.vessel_no = d.vessel_no
          and c.machine_id = d.machine_id
        where a.vessel_no = @vesselNo
          and c.machine_id like case @machineId when 'all' then '' else @machineId end + '%'
          and a.location like case @location when 'all' then '' else @location end + '%'
          and a.type like case @type when 'all' then '' else @type end + '%'
        order by a.vessel_no
               , a.date desc
               , a.type
               , a.remark
               , a.material_code`, 
      [
        { name: 'vesselNo', value: item.vessel_no },
        { name: 'startDate', value: item.start_date },
        { name: 'endDate', value: item.end_date },
        { name: 'machineId', value: item.machine_id },
        { name: 'location', value: item.location },
        { name: 'type', value: item.type },
      ]);

    // 성공 시 데쉬보드 정보 반환
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}