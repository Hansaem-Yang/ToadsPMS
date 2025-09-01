import { NextResponse } from 'next/server';
import { execute } from '@/db'; // 이전에 만든 query 함수

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vessel_no, equip_no, equip_name, category, manufacturer, model, description } = body;

    // DB에서 사용자 정보 확인
    const count = await execute(
      `merge [equipment] as a
       using (select @vesselNo as vessel_no
                   , @equipNo as equip_no
                   , @equipName as equip_name
                   , @category as category
                   , @manufacturer as manufacturer
                   , @model as model
                   , @description as description) as b
          on (a.vessel_no = b.vessel_no and a.equip_no = b.equip_no)
        when matched then
             update
                set a.equip_name = b.equip_name
                  , a.category = b.category
                  , a.manufacturer = b.manufacturer
                  , a.model = b.model
                  , a.description = b.description
        when not matched then
             insert (vessel_no
                   , equip_no
                   , equip_name
                   , category
                   , manufacturer
                   , model
                   , description)
             values (b.vessel_no
                   , (select format(isnull(max(equip_no), 0) + 1, '00') from [equipment] where vessel_no = b.vessel_no)
                   , b.equip_name
                   , b.category
                   , b.manufacturer
                   , b.model
                   , b.description);`,
      [
        { name: 'vesselNo', value: vessel_no },
        { name: 'equipNo', value: equip_no },
        { name: 'equipName', value: equip_name },
        { name: 'category', value: category },
        { name: 'manufacturer', value: manufacturer },
        { name: 'model', value: model },
        { name: 'description', value: description },
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