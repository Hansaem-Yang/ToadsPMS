import { NextResponse } from 'next/server';
import { getSql, getPool, query, execute } from '@/db'; // 이전에 만든 query 함수
import { Material } from '@/types/inventory/material/material';

export async function POST(req: Request) {
  try {
    const remoteSiteUrl = process.env.REMOTE_SITE_URL;
    const body = await req.json();
    const item : Material = body;

    const sql = await getSql();
    const pool = await getPool();
    const transantion = pool.transaction();
    await transantion.begin();
    try {
      let count = 0;
      let queryString = `
      delete [receive]
       where vessel_no = @vesselNo
         and material_code = @materialCode
         and receive_type = 'S0';`;

      let params = [
        { name: 'vesselNo', value: item.vessel_no }, 
        { name: 'materialCode', value: item.material_code }, 
      ];

      const request = new sql.Request(transantion);

      params?.forEach(p => request.input(p.name, p.value));
      let result = await request.query(queryString);
      count += result.rowsAffected[0];

      queryString = `
      delete [material]
       where vessel_no = @vesselNo
         and material_code = @materialCode;`;
      
      result = await request.query(queryString);
      count += result.rowsAffected[0];
      
      transantion.commit();
        
      if (count === 0) {
        return NextResponse.json({ success: false, message: 'Data was not deleted.' }, { status: 401 });
      }

      // 성공 정보 반환
      return NextResponse.json({ success: true });
    } catch (err) {
      transantion.rollback();
      console.error(err);
      return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}