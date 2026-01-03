/**
 * Test Frontend Structure
 * Verifies frontend files are correctly created
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Testing Frontend Structure ===\n');

// Test 1: Check admin round management page
console.log('Test 1: Checking admin round management page...');
const roundsPagePath = path.join(__dirname, 'app', 'admin', 'rounds', 'page.js');
if (fs.existsSync(roundsPagePath)) {
  console.log('✓ admin/rounds/page.js exists');
  const content = fs.readFileSync(roundsPagePath, 'utf8');
  const hasStartRound = content.includes('startRound') || content.includes('handleStartRound');
  const hasCrashRound = content.includes('crashRound') || content.includes('handleCrashRound');
  const hasGetCurrentRound = content.includes('getCurrentRound') || content.includes('fetchCurrentRound');
  const hasAdminAPI = content.includes('adminAPI');
  console.log(`  - Has start round functionality: ${hasStartRound ? '✓' : '✗'}`);
  console.log(`  - Has crash round functionality: ${hasCrashRound ? '✓' : '✗'}`);
  console.log(`  - Has get current round: ${hasGetCurrentRound ? '✓' : '✗'}`);
  console.log(`  - Uses adminAPI: ${hasAdminAPI ? '✓' : '✗'}`);
} else {
  console.log('✗ admin/rounds/page.js not found');
}

// Test 2: Check admin API
console.log('\nTest 2: Checking admin API...');
const adminAPIPath = path.join(__dirname, 'lib', 'api', 'admin.api.js');
if (fs.existsSync(adminAPIPath)) {
  console.log('✓ admin.api.js exists');
  const content = fs.readFileSync(adminAPIPath, 'utf8');
  const hasGetGameRounds = content.includes('getGameRounds');
  const hasStartRound = content.includes('startRound');
  const hasCrashRound = content.includes('crashRound');
  const hasGetCurrentRound = content.includes('getCurrentRound');
  console.log(`  - Has getGameRounds: ${hasGetGameRounds ? '✓' : '✗'}`);
  console.log(`  - Has startRound: ${hasStartRound ? '✓' : '✗'}`);
  console.log(`  - Has crashRound: ${hasCrashRound ? '✓' : '✗'}`);
  console.log(`  - Has getCurrentRound: ${hasGetCurrentRound ? '✓' : '✗'}`);
} else {
  console.log('✗ admin.api.js not found');
}

// Test 3: Check public API
console.log('\nTest 3: Checking public API...');
const publicAPIPath = path.join(__dirname, 'lib', 'api', 'public.api.js');
if (fs.existsSync(publicAPIPath)) {
  console.log('✓ public.api.js exists');
  const content = fs.readFileSync(publicAPIPath, 'utf8');
  const hasGetActiveIbans = content.includes('getActiveIbans');
  const hasPublicRoute = content.includes('/public/ibans');
  console.log(`  - Has getActiveIbans: ${hasGetActiveIbans ? '✓' : '✗'}`);
  console.log(`  - Uses /public/ibans route: ${hasPublicRoute ? '✓' : '✗'}`);
} else {
  console.log('✗ public.api.js not found');
}

// Test 4: Check deposit page
console.log('\nTest 4: Checking deposit page...');
const depositPagePath = path.join(__dirname, 'app', 'deposit', 'page.js');
if (fs.existsSync(depositPagePath)) {
  console.log('✓ deposit/page.js exists');
  const content = fs.readFileSync(depositPagePath, 'utf8');
  const hasPublicAPI = content.includes('publicAPI');
  const hasGetActiveIbans = content.includes('getActiveIbans');
  const hasIbansState = content.includes('ibans') || content.includes('setIbans');
  const hasIbanDisplay = content.includes('ibanNumber') || content.includes('bankName');
  console.log(`  - Uses publicAPI: ${hasPublicAPI ? '✓' : '✗'}`);
  console.log(`  - Calls getActiveIbans: ${hasGetActiveIbans ? '✓' : '✗'}`);
  console.log(`  - Has IBANs state: ${hasIbansState ? '✓' : '✗'}`);
  console.log(`  - Displays IBAN info: ${hasIbanDisplay ? '✓' : '✗'}`);
} else {
  console.log('✗ deposit/page.js not found');
}

// Test 5: Check API exports
console.log('\nTest 5: Checking API exports...');
const apiIndexPath = path.join(__dirname, 'lib', 'api.js');
if (fs.existsSync(apiIndexPath)) {
  console.log('✓ api.js exists');
  const content = fs.readFileSync(apiIndexPath, 'utf8');
  const hasPublicAPI = content.includes('public.api');
  console.log(`  - Exports publicAPI: ${hasPublicAPI ? '✓' : '✗'}`);
} else {
  console.log('✗ api.js not found');
}

console.log('\n=== Frontend Structure Test Complete ===\n');


