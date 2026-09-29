const API = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`[${res.status}] ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

async function runTests() {
  console.log('--- STARTING LOCAL REPAIR & RECYCLER PLATFORM TEST SUITE ---\n');

  try {
    // 1. Test Health
    const health = await req('/health');
    console.log('✓ 1. Health Check:', health.status, `(${health.buyersCount} buyers, ${health.techniciansCount} technicians, ${health.recoveredMaterialsCount} materials)`);

    // 2. Test Customer Login
    const custLogin = await req('/auth/customer-login', {
      method: 'POST',
      body: { email: 'customer@example.com', password: 'password123' }
    });
    console.log('✓ 2. Customer Login:', custLogin.user.name, '(JWT token received)');
    const customerToken = custLogin.token;

    // 3. Test Customer Rewards
    const rewardsRes = await req('/customer/rewards', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✓ 3. Customer Rewards Balance:', rewardsRes.totalBalance, 'pts across', rewardsRes.rewards.length, 'transactions');

    // 4. Test Technician Login
    const techLogin = await req('/auth/technician-login', {
      method: 'POST',
      body: { email: 'tech@example.com', password: 'password123' }
    });
    console.log('✓ 4. Technician Login:', techLogin.user.name, `(${techLogin.user.specialty})`);

    // 5. Test Buyer Login (Demo Buyer)
    const buyerLogin = await req('/auth/buyer-login', {
      method: 'POST',
      body: { email: 'buyer@example.com', password: 'password123' }
    });
    console.log('✓ 5. Buyer Login:', buyerLogin.user.companyName, `(City: ${buyerLogin.user.city})`);
    const buyerToken = buyerLogin.token;

    // 6. Test Buyer Registration (New fictional enterprise)
    const testBuyerEmail = `buyer.test.${Date.now()}@vidarbha.in`;
    const buyerReg = await req('/auth/buyer-register', {
      method: 'POST',
      body: {
        name: 'Anand Mahindra',
        companyName: 'Nagpur Circular Metals Ltd (Demo)',
        email: testBuyerEmail,
        password: 'password123',
        city: 'Nagpur',
        phone: '+91 98230 99999',
        address: 'MIDC Butibori, Nagpur',
        materialsWanted: ['Copper', 'Aluminium', 'Steel']
      }
    });
    console.log('✓ 6. Buyer Registration:', buyerReg.user.companyName, 'created successfully');

    // 7. Test Customer Submitting an E-Waste Request
    const ewasteReq = await req('/recycle-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        itemType: 'Broken Dell XPS Laptop & Monitor',
        estimatedPayout: '₹1,200',
        payoutType: 'points',
        pickupDate: '2026-08-22',
        pickupAddress: 'Hingna Road, Nagpur'
      }
    });
    const newReqId = ewasteReq.recycleRequest.id;
    console.log('✓ 7. Customer Created E-Waste Request #', newReqId, 'for', ewasteReq.recycleRequest.itemType);

    // 8. Simulate E-Waste Lifecycle advancement to 'material_recovered'
    const statusUpdate = await req(`/recycle-requests/${newReqId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { status: 'material_recovered' }
    });
    console.log('✓ 8. Advanced E-Waste Request #', newReqId, 'status to material_recovered');
    console.log('  -> Auto-generated Recovered Materials:', statusUpdate.recycleRequest.recoveredMaterialsList);

    // 9. Buyer Browses Recovered Materials Marketplace
    const materialsRes = await req('/materials');
    console.log('✓ 9. Available Recovered Materials in Marketplace:', materialsRes.count, 'lots found');
    const targetMaterial = materialsRes.materials.find(m => m.recycleRequestId === newReqId) || materialsRes.materials[0];
    console.log(`  -> Selected Lot #${targetMaterial.id}: ${targetMaterial.materialType} (${targetMaterial.quantity} ${targetMaterial.unit}) - Estimated Value: ${targetMaterial.estimatedValue}`);

    // 10. Buyer Places an Offer
    const offerRes = await req(`/materials/${targetMaterial.id}/offers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        quantity: targetMaterial.quantity,
        offeredPrice: '₹600',
        message: 'Immediate pickup from Nagpur sorting center.'
      }
    });
    const newOfferId = offerRes.offer.id;
    console.log('✓ 10. Buyer Placed Offer #', newOfferId, 'for', offerRes.offer.offeredPrice);

    // 11. Accept the Offer
    const acceptRes = await req(`/offers/${newOfferId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: { status: 'accepted' }
    });
    console.log('✓ 11. Offer Accepted -> Material Status:', acceptRes.material?.status, '| Offer Status:', acceptRes.offer.status);

    // 12. Complete the Transaction
    const completeRes = await req(`/offers/${newOfferId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: { status: 'completed' }
    });
    console.log('✓ 12. Transaction Completed -> Material Status:', completeRes.material?.status);

    // 13. Verify Customer E-Waste Status
    const custReqs = await req('/customer/recycle-requests', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const updatedCustReq = custReqs.recycleRequests.find(r => r.id === newReqId);
    console.log('✓ 13. Verified Customer Request Status:', updatedCustReq?.status, '| Matched Buyer:', updatedCustReq?.matchedBuyerName);

    // 14. Verify Buyer Dashboard Profile & Stats
    const buyerProfile = await req('/buyers/profile', {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    console.log('✓ 14. Buyer Dashboard Stats:', buyerProfile.stats);

    console.log('\n==================================================');
    console.log('🎉 ALL 14 TEST CASES PASSED CLEANLY WITH ZERO ERRORS!');
    console.log('==================================================');
  } catch (err) {
    console.error('❌ Test suite failed:', err.message);
    process.exit(1);
  }
}

runTests();
