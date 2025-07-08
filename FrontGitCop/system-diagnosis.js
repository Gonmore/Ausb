#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA\n');

// Verificar archivos importantes
const checkFiles = [
  'src/app/dashboard/page.tsx',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json'
];

console.log('📁 Verificando archivos importantes:');
checkFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Verificar contenido del dashboard
console.log('\n📋 Verificando dashboard actual:');
const dashboardPath = 'src/app/dashboard/page.tsx';
if (fs.existsSync(dashboardPath)) {
  const content = fs.readFileSync(dashboardPath, 'utf8');
  console.log(`✅ Tamaño: ${(content.length / 1024).toFixed(2)} KB`);
  console.log(`✅ Líneas: ${content.split('\n').length}`);
  console.log(`✅ Contiene export default: ${content.includes('export default') ? 'Sí' : 'No'}`);
  console.log(`✅ Es componente React: ${content.includes('function') || content.includes('=>') ? 'Sí' : 'No'}`);
  console.log(`✅ Usa 'use client': ${content.includes("'use client'") ? 'Sí' : 'No'}`);
}

// Verificar package.json
console.log('\n📦 Verificando package.json:');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Nombre: ${packageJson.name}`);
  console.log(`✅ Next.js: ${packageJson.dependencies?.next || 'No instalado'}`);
  console.log(`✅ React: ${packageJson.dependencies?.react || 'No instalado'}`);
  console.log(`✅ TypeScript: ${packageJson.devDependencies?.typescript || 'No instalado'}`);
  console.log(`✅ Scripts disponibles: ${Object.keys(packageJson.scripts || {}).join(', ')}`);
}

// Verificar configuración de Next.js
console.log('\n⚙️ Verificando next.config.js:');
if (fs.existsSync('next.config.js')) {
  const config = fs.readFileSync('next.config.js', 'utf8');
  console.log(`✅ Configuración experimental: ${config.includes('experimental') ? 'Sí' : 'No'}`);
  console.log(`✅ TypedRoutes: ${config.includes('typedRoutes') ? 'Configurado' : 'No'}`);
}

// Verificar puertos
console.log('\n🌐 Verificando puertos:');
exec('netstat -an | findstr :3001', (error, stdout, stderr) => {
  if (stdout) {
    console.log('✅ Puerto 3001:');
    console.log(stdout.trim());
  } else {
    console.log('❌ Puerto 3001 no está en uso');
  }
});

exec('netstat -an | findstr :3000', (error, stdout, stderr) => {
  if (stdout) {
    console.log('✅ Puerto 3000:');
    console.log(stdout.trim());
  } else {
    console.log('❌ Puerto 3000 no está en uso');
  }
});

// Verificar procesos Node.js
console.log('\n🔄 Verificando procesos Node.js:');
exec('tasklist | findstr node', (error, stdout, stderr) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    console.log(`✅ Procesos Node.js activos: ${lines.length}`);
    lines.forEach(line => {
      if (line.includes('node.exe')) {
        console.log(`  ${line.trim()}`);
      }
    });
  } else {
    console.log('❌ No hay procesos Node.js activos');
  }
});

// Verificar directorio .next
console.log('\n🏗️ Verificando build:');
const nextExists = fs.existsSync('.next');
console.log(`${nextExists ? '✅' : '❌'} Directorio .next existe: ${nextExists}`);

if (nextExists) {
  const nextStats = fs.statSync('.next');
  console.log(`✅ Última modificación: ${nextStats.mtime.toLocaleString()}`);
}

// Verificar node_modules
console.log('\n📚 Verificando node_modules:');
const nodeModulesExists = fs.existsSync('node_modules');
console.log(`${nodeModulesExists ? '✅' : '❌'} node_modules existe: ${nodeModulesExists}`);

if (nodeModulesExists) {
  const nextModule = fs.existsSync('node_modules/next');
  const reactModule = fs.existsSync('node_modules/react');
  const lucideModule = fs.existsSync('node_modules/lucide-react');
  
  console.log(`${nextModule ? '✅' : '❌'} Next.js instalado: ${nextModule}`);
  console.log(`${reactModule ? '✅' : '❌'} React instalado: ${reactModule}`);
  console.log(`${lucideModule ? '✅' : '❌'} Lucide React instalado: ${lucideModule}`);
}

console.log('\n🔧 Recomendaciones:');
console.log('1. Si no hay procesos Node.js activos, el servidor no está corriendo');
console.log('2. Si el directorio .next no existe, el build no se ha creado');
console.log('3. Si hay problemas con dependencias, ejecuta: npm install');
console.log('4. Para limpiar completamente: rm -rf .next node_modules && npm install');
console.log('5. Para iniciar el servidor: npm run dev');

console.log('\n📋 Comandos útiles:');
console.log('npm run dev          - Iniciar servidor de desarrollo');
console.log('npm run build        - Construir para producción');
console.log('npm install          - Instalar dependencias');
console.log('taskkill /f /im node.exe - Matar todos los procesos Node.js');

setTimeout(() => {
  console.log('\n✅ Diagnóstico completo terminado');
}, 3000);
