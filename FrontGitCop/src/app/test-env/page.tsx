import React from 'react';

export default function TestEnv() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const useApi = process.env.NEXT_PUBLIC_USE_API;

  React.useEffect(() => {
    console.log('🔍 TestEnv - API URL:', apiUrl);
    console.log('🔍 TestEnv - Use API:', useApi);

    // Probar la API directamente
    if (apiUrl) {
      fetch(`${apiUrl}/api/geography/countries`)
        .then(response => {
          console.log('🔍 TestEnv - API Response Status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('🔍 TestEnv - API Response Data:', data);
        })
        .catch(error => {
          console.error('🔍 TestEnv - API Error:', error);
        });
    }
  }, [apiUrl, useApi]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Environment Variables</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {apiUrl || 'NOT SET'}</p>
        <p><strong>NEXT_PUBLIC_USE_API:</strong> {useApi || 'NOT SET'}</p>
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm">Revisa la consola del navegador (F12) para ver los logs de debug.</p>
      </div>
    </div>
  );
}