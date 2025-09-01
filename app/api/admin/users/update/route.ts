import { NextResponse } from 'next/server';
import { execute } from '@/db'; // 이전에 만든 query 함수

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      account_no,
      user_name,
      user_ename,
      email,
      position,
      ship_no,
      user_auth,
      use_yn
    } = body;

    // DB에서 사용자 정보 확인
    const count = await execute(
      `update [user]
          set user_name = @userName
            , user_ename = @userEname
            , email = @email
            , position = @position
            , ship_no = @shipNo
            , user_auth = @userAuth
            , use_yn = @useYn
        where account_no = @accountNo;`,
      [
        { name: 'accountNo', value: account_no },
        { name: 'userName', value: user_name },
        { name: 'userEname', value: user_ename },
        { name: 'email', value: email },
        { name: 'position', value: position },
        { name: 'shipNo', value: ship_no },
        { name: 'userAuth', value: user_auth },
        { name: 'useYn', value: use_yn },
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