#!/usr/bin/env node

// Script para verificar el dashboard corregido
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando el dashboard corregido...\n');

// Verificar que el archivo del dashboard existe
const dashboardPath = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
if (fs.existsSync(dashboardPath)) {
  console.log('✅ Dashboard file exists:', dashboardPath);
  
  // Leer el contenido del archivo
  const content = fs.readFileSync(dashboardPath, 'utf8');
  
  // Verificar que contiene las funciones principales
  const checks = [
    { name: 'useEffect hook', regex: /useEffect\s*\(/ },
    { name: 'UserData interface', regex: /interface UserData/ },
    { name: 'getRoleDisplay function', regex: /const getRoleDisplay/ },
    { name: 'handleLogout function', regex: /const handleLogout/ },
    { name: 'Loading state', regex: /loading \|\| !user/ },
    { name: 'Mounted state', regex: /if \(!mounted\)/ },
    { name: 'Quick actions', regex: /const quickActions/ },
    { name: 'Lucide icons', regex: /from 'lucide-react'/ }
  ];
  
  checks.forEach(check => {
    if (check.regex.test(content)) {
      console.log(`✅ ${check.name} - Found`);
    } else {
      console.log(`❌ ${check.name} - Not found`);
    }
  });
  
  // Verificar que no hay código duplicado o malformado
  const duplicateChecks = [
    { name: 'Multiple export default', regex: /export default/g },
    { name: 'Orphaned case statements', regex: /^\s*case\s+/gm },
    { name: 'Unclosed braces', count: (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length }
  ];
  
  duplicateChecks.forEach(check => {
    if (check.regex) {
      const matches = content.match(check.regex);
      if (matches && matches.length > 1) {
        console.log(`⚠️  ${check.name} - Found ${matches.length} occurrences`);
      } else {
        console.log(`✅ ${check.name} - OK`);
      }
    } else if (check.count !== undefined) {
      if (check.count === 0) {
        console.log(`✅ ${check.name} - Balanced`);
      } else {
        console.log(`⚠️  ${check.name} - Unbalanced (difference: ${check.count})`);
      }
    }
  });
  
  console.log('\n📊 Dashboard Analysis Summary:');
  console.log(`- File size: ${(content.length / 1024).toFixed(2)} KB`);
  console.log(`- Lines of code: ${content.split('\n').length}`);
  console.log(`- Contains TypeScript: ${content.includes('interface') ? 'Yes' : 'No'}`);
  console.log(`- Uses Next.js: ${content.includes('next/navigation') ? 'Yes' : 'No'}`);
  
} else {
  console.log('❌ Dashboard file not found:', dashboardPath);
}

// Verificar estructura del proyecto
const projectStructure = [
  'src/app/dashboard/page.tsx',
  'src/app/login/page.tsx',
  'src/stores/auth.ts',
  'src/lib/services.ts',
  'src/lib/token-utils.ts',
  'package.json'
];

console.log('\n🗂️  Project Structure Check:');
projectStructure.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

console.log('\n🚀 Next Steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Navigate to http://localhost:3001/login');
console.log('3. Login with valid credentials');
console.log('4. Access the dashboard at http://localhost:3001/dashboard');
console.log('5. Verify that the dashboard loads without 500 errors');

console.log('\n📋 Debug Commands:');
console.log('- Check server logs: npm run dev');
console.log('- Check browser console for errors');
console.log('- Verify localStorage contains auth-storage');
console.log('- Test with /test-dashboard page if needed');
