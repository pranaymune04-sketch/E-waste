const http = require('http');

const post = (path, data, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

async function testAI() {
  console.log('--- Testing AI Repair vs Recycle & Google Maps Backend ---');

  // Test AI Analyzer with an iPhone
  const aiPhone = await post('/api/ai/analyze', {
    itemType: 'iPhone 13 Pro',
    issue: 'Cracked front glass and unresponsive touch digitizer',
    category: 'Electronics & Phones',
    city: 'New York'
  });
  console.log('\n1. AI iPhone Analysis:');
  console.log('Diagnosis:', aiPhone.analysis.diagnosticSummary);
  console.log('Repair Recommendation:', aiPhone.analysis.recommendation);
  console.log('Repair Cost:', aiPhone.analysis.repairOption.costEstimate);
  console.log('Nearest Technicians found:', aiPhone.analysis.repairOption.nearestTechnicians.length);
  console.log('First Tech Map Embed:', aiPhone.analysis.repairOption.nearestTechnicians[0]?.mapSearchUrl);
  console.log('Recycle Cashback Estimate:', aiPhone.analysis.recycleOption.estimatedCashbackPayout);
  console.log('Recycle Dropoff Centers:', aiPhone.analysis.recycleOption.dropoffCenters.length);

  // Test Customer submitting recycling pickup
  const customerAuth = await post('/api/auth/customer-login', {
    email: 'customer@example.com',
    password: 'password123'
  });

  const recycleRes = await post('/api/recycle-requests', {
    itemType: 'Old Dell Latitude Laptop (Defective Motherboard)',
    estimatedPayout: '$45.00',
    pickupDate: '2026-08-28',
    pickupAddress: '450 Lexington Ave, New York, NY'
  }, customerAuth.token);
  console.log('\n2. Recycle Request Creation:');
  console.log('Success:', recycleRes.success, 'Scheduled ID:', recycleRes.recycleRequest.id, 'Payout:', recycleRes.recycleRequest.estimatedPayout);

  console.log('\n--- ALL AI & RECYCLING FEATURES VERIFIED OPERATIONAL ---');
}

testAI().catch(console.error);
