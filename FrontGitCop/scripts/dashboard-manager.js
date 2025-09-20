#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, 'src', 'app', 'dashboard');
const versions = {
  'current': 'page.tsx',
  'minimal': 'page-minimal.tsx',
  'debug': 'page-debug.tsx',
  'clean': 'page-clean.tsx'
};

function switchDashboard(version) {
  const sourceFile = path.join(dashboardDir, versions[version]);
  const targetFile = path.join(dashboardDir, 'page.tsx');
  
  if (!fs.existsSync(sourceFile)) {
    console.log(`❌ Version ${version} not found: ${sourceFile}`);
    return false;
  }
  
  // Backup current version
  const backupFile = path.join(dashboardDir, `page-backup-${Date.now()}.tsx`);
  if (fs.existsSync(targetFile)) {
    fs.copyFileSync(targetFile, backupFile);
    console.log(`📋 Backup created: ${backupFile}`);
  }
  
  // Copy new version
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Switched to ${version} version`);
  return true;
}

function listVersions() {
  console.log('\n📋 Available Dashboard Versions:');
  Object.keys(versions).forEach(version => {
    const file = path.join(dashboardDir, versions[version]);
    const exists = fs.existsSync(file);
    console.log(`  ${version}: ${exists ? '✅' : '❌'} ${versions[version]}`);
  });
}

function testDashboard() {
  console.log('\n🧪 Testing Dashboard Versions...');
  
  Object.keys(versions).forEach(version => {
    const file = path.join(dashboardDir, versions[version]);
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const size = (content.length / 1024).toFixed(2);
      const lines = content.split('\n').length;
      
      console.log(`\n📊 ${version} version:`);
      console.log(`  Size: ${size} KB`);
      console.log(`  Lines: ${lines}`);
      console.log(`  Has useEffect: ${content.includes('useEffect') ? '✅' : '❌'}`);
      console.log(`  Has Lucide icons: ${content.includes('lucide-react') ? '✅' : '❌'}`);
      console.log(`  Has TypeScript: ${content.includes('interface') ? '✅' : '❌'}`);
    }
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const version = args[1];

console.log('🔧 Dashboard Version Manager\n');

switch (command) {
  case 'switch':
    if (!version || !versions[version]) {
      console.log('❌ Usage: node dashboard-manager.js switch <version>');
      console.log('Available versions:', Object.keys(versions).join(', '));
    } else {
      switchDashboard(version);
    }
    break;
    
  case 'list':
    listVersions();
    break;
    
  case 'test':
    testDashboard();
    break;
    
  case 'minimal':
    console.log('🔄 Switching to minimal dashboard for debugging...');
    switchDashboard('minimal');
    break;
    
  case 'restore':
    console.log('🔄 Restoring original dashboard...');
    switchDashboard('clean');
    break;
    
  default:
    console.log('Usage:');
    console.log('  node dashboard-manager.js switch <version>  - Switch to specific version');
    console.log('  node dashboard-manager.js list             - List available versions');
    console.log('  node dashboard-manager.js test             - Test all versions');
    console.log('  node dashboard-manager.js minimal          - Switch to minimal version');
    console.log('  node dashboard-manager.js restore          - Restore original version');
    console.log('');
    console.log('Available versions:', Object.keys(versions).join(', '));
}
