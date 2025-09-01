import { NextResponse } from 'next/server';
import { execute } from '@/db'; // 이전에 만든 query 함수

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vessel_no, vessel_name, vessel_short_name, imo_no, use_yn } = body;

    // DB에서 사용자 정보 확인
    const count = await execute(
      `merge [vessel] as a
       using (select @vesselNo as vessel_no
                   , @vesselName as vessel_name
                   , @vesselShortName as vessel_short_name
                   , @imoNo as imo_no
                   , @useYn as use_yn) as b
          on (a.vessel_no = b.vessel_no)
        when matched then
             update
                set a.vessel_name = b.vessel_name
                  , a.vessel_short_name = b.vessel_short_name
                  , a.imo_no = b.imo_no
                  , a.use_yn = b.use_yn
        when not matched then
             insert (vessel_no
                   , vessel_name
                   , vessel_short_name
                   , imo_no
                   , use_yn)
             values (b.vessel_no
                   , b.vessel_name
                   , b.vessel_short_name
                   , b.imo_no
                   , b.use_yn);`,
      [
        { name: 'vesselNo', value: vessel_no },
        { name: 'vesselName', value: vessel_name },
        { name: 'vesselShortName', value: vessel_short_name },
        { name: 'imoNo', value: imo_no },
        { name: 'useYn', value: use_yn },
      ]
    );

    if (count === 0) {
      return NextResponse.json({ success: false, message: 'Data was not saved.' }, { status: 401 });
    }

    // 성공 정보 반환
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}