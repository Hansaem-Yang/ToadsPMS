// src/instrumentation.ts 또는 instrumentation.ts

// 이 함수는 서버가 시작될 때 딱 한 번만 호출됩니다.
export async function register() {
  const siteUrl = process.env.LOCAL_SITE_URL;
        
  if (process.env.NODE_ENV === 'production') {
    const cron = await import('node-cron');
    console.log('⏰ Scheduler has been initialized.');

  //   // 매일 자정에 실행되는 스케쥴을 설정
  //   // Cron 표현식: '분 시 일 월 요일'
  //   // 예: '0 0 * * *' -> 매일 0시 0분에 실행
    cron.schedule('30 * * * *', () => {
      console.log('🚀 Running a scheduled job at midnight...');

      fetch(`${siteUrl}/api/scheduler/send`)
        .then(res => {
          if (!res.ok) {
            console.error('Failed to trigger cron job:', res.statusText);
          }
          return res.json();
        })
        .then(data => {
          console.log('Cron job trigger response:', data);
        })
        .catch(err => {
          console.error('Error triggering cron job:', err);
        });

      fetch(`${siteUrl}/api/scheduler/receive`)
        .then(res => {
          if (!res.ok) {
            console.error('Failed to trigger cron job:', res.statusText);
          }
          return res.json();
        })
        .then(data => {
          console.log('Cron job trigger response:', data);
        })
        .catch(err => {
          console.error('Error triggering cron job:', err);
        });
    });
  }
}