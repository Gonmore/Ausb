// Check token expiration without dependencies
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTczNzIzMjQ2NiwiZXhwIjoxNzM3MjM2MDY2fQ.3nZ_hPJN8NdZJNLzDPqSMmWvUOt1qkpPgDPmSCIhZIU';

try {
  // Decode JWT token manually (without verification)
  const parts = token.split('.');
  const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  
  console.log('📊 Token Information:');
  console.log('Header:', header);
  console.log('Payload:', payload);
  console.log('');
  
  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp;
  const iat = payload.iat;
  
  console.log('🕒 Time Analysis:');
  console.log('Current timestamp:', now);
  console.log('Token issued at (iat):', iat);
  console.log('Token expires at (exp):', exp);
  console.log('Current time:', new Date().toISOString());
  console.log('Token issued:', new Date(iat * 1000).toISOString());
  console.log('Token expires:', new Date(exp * 1000).toISOString());
  console.log('');
  
  if (now > exp) {
    console.log('❌ Token is EXPIRED');
    const expiredFor = now - exp;
    console.log('Expired for:', expiredFor, 'seconds');
    console.log('Expired for:', Math.floor(expiredFor / 60), 'minutes');
  } else {
    console.log('✅ Token is VALID');
    const validFor = exp - now;
    console.log('Valid for:', validFor, 'seconds');
    console.log('Valid for:', Math.floor(validFor / 60), 'minutes');
  }
} catch (error) {
  console.error('❌ Error decoding token:', error.message);
}
