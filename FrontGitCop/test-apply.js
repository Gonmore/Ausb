// Test the apply functionality
const baseUrl = 'http://localhost:5000';

async function testApplyFunctionality() {
  console.log('🔍 Testing apply functionality...');
  
  // Test creating an application
  const applicationData = {
    offerId: 1,
    userId: 1,
    status: 'pending'
  };
  
  try {
    console.log('📤 Sending application request...');
    const response = await fetch(`${baseUrl}/api/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Application successful:', result);
    } else {
      const error = await response.text();
      console.log('❌ Application failed:', error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testApplyFunctionality();
