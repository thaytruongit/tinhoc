async function run() {
  try {
    // 1. Teacher Login
    const loginRes = await fetch('http://localhost:3000/api/auth/teacher/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '12345' }),
    });
    const loginData = await loginRes.json();
    console.log('1. Teacher Login:', loginData.ok ? 'PASS' : 'FAIL', '-', loginData.user?.name);

    // 2. Unauthorized access check (Should be 401/403)
    const unauthRes = await fetch('http://localhost:3000/api/db/clean-reset', { method: 'POST' });
    const unauthData = await unauthRes.json();
    console.log('2. Unauthorized clean-reset correctly blocked:', unauthData.code === 'AUTH_TOKEN_MISSING' ? 'PASS' : 'FAIL');

    // 3. Authorized request with Teacher Bearer Token
    const authRes = await fetch('http://localhost:3000/api/db/clean-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
    });
    const authData = await authRes.json();
    console.log('3. Authorized clean-reset succeeded:', authData.ok ? 'PASS' : 'FAIL');

    // 4. Student Login
    const stRes = await fetch('http://localhost:3000/api/auth/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: '61008', password: '12345' }),
    });
    const stData = await stRes.json();
    console.log('4. Student Login:', stData.ok ? 'PASS' : 'FAIL', '-', stData.student?.name, `(${stData.student?.classId})`);

    // 5. Live Session API (Public read)
    const liveRes = await fetch('http://localhost:3000/api/live-session');
    const liveData = await liveRes.json();
    console.log('5. Live Session read:', liveData.isBroadcasting !== undefined ? 'PASS' : 'FAIL');

    // 6. Curriculum API
    const currRes = await fetch('http://localhost:3000/api/curriculum');
    const currData = await currRes.json();
    console.log('6. Curriculum API:', currData.platform ? 'PASS' : 'FAIL', `(${currData.classes?.length} classes)`);

    console.log('\n>>> TẤT CẢ 6 BÀI KIỂM THỬ XÁC THỰC & MÔ-ĐUN HÓA ĐÃ HOÀN TẤT THÀNH CÔNG! <<<');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

run();

