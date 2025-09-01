import { NextResponse } from 'next/server';
import { execute } from '@/db'; // 이전에 만든 query 함수

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      user_name,
      user_ename,
      email,
      password,
      position,
      ship_no,
      user_auth,
      use_yn
    } = body;

    // DB에서 사용자 정보 확인
    const count = await execute(
      `insert into [user] (
              account_no
            , user_name
            , user_ename
            , email
            , password
            , position
            , ship_no
            , user_auth
            , use_yn
       )
       values (
              (select isnull(max(account_no), 10000) + 1 from [user])
            , @userName
            , @userEname
            , @email
            , @password
            , @position
            , @shipNo
            , @userAuth
            , @useYn
       );`,
      [
        { name: 'userName', value: user_name },
        { name: 'userEname', value: user_ename },
        { name: 'email', value: email },
        { name: 'password', value: password },
        { name: 'position', value: position },
        { name: 'shipNo', value: ship_no },
        { name: 'userAuth', value: user_auth },
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