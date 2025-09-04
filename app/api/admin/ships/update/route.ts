import { NextResponse } from 'next/server';
import { execute } from '@/db'; // 이전에 만든 query 함수
import { Vessel } from '@/types/vessel/vessel';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item: Vessel = body;

    // DB에서 사용자 정보 확인
    const count = await execute(
      `update [vessel]
          set vessel_name = @vesselName
            , vessel_short_name = @vesselShortName
            , imo_no = @imoNo
            , use_yn = @useYn
            , modify_date = getdate()
            , modify_user = @modifyUser
        where vessel_no = @vesselNo;`,
      [
        { name: 'vesselNo', value: item.vessel_no },
        { name: 'vesselName', value: item.vessel_name },
        { name: 'vesselShortName', value: item.vessel_short_name },
        { name: 'imoNo', value: item.imo_no },
        { name: 'useYn', value: item.use_yn },
        { name: 'modifyUser', value: item.modify_user },
      ]
    );

    if (count === 0) {
      return NextResponse.json({ success: false, message: 'Data was not updated.' }, { status: 401 });
    }

    // 성공 정보 반환
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}