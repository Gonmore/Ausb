// Test login from the frontend environment
const API_BASE_URL = 'http://localhost:5000';

async function testLogin() {
  console.log('🔍 Testing login from frontend environment...');
  
  const credentials = {
    email: 'test@example.com',
    password: '123456'
  };
  
  try {
    console.log('📤 Sending login request to:', `${API_BASE_URL}/login`);
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AusbildungApp/1.0',
      },
      body: JSON.stringify(credentials)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful:', data);
    } else {
      const error = await response.text();
      console.log('❌ Login failed:', error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testLogin();
