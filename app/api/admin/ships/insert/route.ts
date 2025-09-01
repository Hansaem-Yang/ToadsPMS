import { NextResponse } from 'next/server';
import { execute } from '@/db'; // 이전에 만든 query 함수

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vessel_no, vessel_name, vessel_short_name, imo_no, use_yn } = body;

    // DB에서 사용자 정보 확인
    const count = await execute(
      `insert into [vessel] (
              vessel_no
            , vessel_name
            , vessel_short_name
            , imo_no
            , use_yn)
       values (
              @vesselNo
            , @vesselName
            , @vesselShortName
            , @imoNo
            , @useYn
       );`,
      [
        { name: 'vesselNo', value: vessel_no },
        { name: 'vesselName', value: vessel_name },
        { name: 'vesselShortName', value: vessel_short_name },
        { name: 'imoNo', value: imo_no },
        { name: 'useYn', value: use_yn },
      ]
    );

    if (count === 0) {
      return NextResponse.json({ success: false, message: 'Data was not inserted.' }, { status: 401 });
    }

    // 성공 정보 반환
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}