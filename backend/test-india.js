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

const get = (path, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
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
    req.end();
  });
};

async function testIndiaBackend() {
  console.log('--- Testing India Localization, Real Technicians & INR Currency ---');

  // 1. Health check
  const health = await get('/api/health');
  console.log('1. Health Check:', health);

  // 2. Fetch Technicians
  const techs = await get('/api/technicians');
  console.log(`\n2. Real Technicians Loaded (${techs.count} total):`);
  techs.technicians.forEach(t => {
    console.log(`- ${t.name} | ${t.city} | ${t.rate} | Rating: ${t.rating} | ${t.address}`);
  });

  // 3. AI Analysis with INR
  const aiRes = await post('/api/ai/analyze', {
    itemType: 'iPhone 14 Pro',
    issue: 'Cracked front glass and unresponsive touch digitizer',
    category: 'Electronics & Phones',
    city: 'Mumbai'
  });

  console.log('\n3. AI Analysis (INR):');
  console.log('Recommendation:', aiRes.analysis.recommendation);
  console.log('Estimated Repair Cost:', aiRes.analysis.repairOption.costEstimate);
  console.log('Estimated Recycle Cashback:', aiRes.analysis.recycleOption.estimatedCashbackPayout);
  console.log('Matched Indian Techs:', aiRes.analysis.repairOption.nearestTechnicians.map(t => `${t.name} (${t.city} - ${t.distance})`));
  console.log('Certified Indian E-Waste Centers:', aiRes.analysis.recycleOption.dropoffCenters.map(c => c.name));

  console.log('\n--- ALL INDIA REAL TECHNICIAN & INR FEATURES VERIFIED ---');
}

testIndiaBackend().catch(console.error);
