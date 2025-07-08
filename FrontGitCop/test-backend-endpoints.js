// Test script to check backend endpoints
const baseUrl = 'http://localhost:5000';

async function testBackendEndpoints() {
  console.log('🔍 Testing backend endpoints...');
  
  try {
    // Test offers endpoint
    console.log('\n📋 Testing offers endpoint...');
    const offersResponse = await fetch(`${baseUrl}/offers`);
    console.log('Offers status:', offersResponse.status);
    
    if (offersResponse.ok) {
      const offers = await offersResponse.json();
      console.log('Found offers:', offers.length);
      if (offers.length > 0) {
        console.log('First offer:', offers[0]);
      }
    }
    
    // Test if there's an apply endpoint
    console.log('\n🎯 Testing apply endpoint...');
    const applyResponse = await fetch(`${baseUrl}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId: 1, userId: 1 })
    });
    console.log('Apply endpoint status:', applyResponse.status);
    
    if (applyResponse.ok) {
      const result = await applyResponse.json();
      console.log('Apply result:', result);
    } else {
      console.log('Apply endpoint not found or error');
    }
    
    // Test available endpoints
    console.log('\n🌐 Testing available endpoints...');
    const endpoints = [
      '/offers',
      '/offers/apply',
      '/applications',
      '/student/apply',
      '/api/offers',
      '/api/apply'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET'
        });
        console.log(`${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`${endpoint}: ERROR - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error testing backend:', error);
  }
}

testBackendEndpoints();
