// Script para arreglar las asociaciones User-Company existentes
const API_BASE_URL = 'http://127.0.0.1:5000';

async function fixUserCompanyAssociations() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin-temp/fix-user-company-associations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Asociaciones corregidas:', result);
        } else {
            console.log('❌ Error:', result);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixUserCompanyAssociations();
