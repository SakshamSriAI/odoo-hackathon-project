// Automated API Verification Suite
const BASE_URL = process.env.API_URL || 'http://localhost:5001/api';

async function runTests() {
  console.log('🧪 Starting API Verification Suite against', BASE_URL);

  const tests = [
    { name: 'Health check', url: `${BASE_URL}/health` },
    { name: 'Get products', url: `${BASE_URL}/products` },
    { name: 'Get brand markups', url: `${BASE_URL}/products/markups` },
    { name: 'Get subscription plans', url: `${BASE_URL}/plans` },
    { name: 'Get quotation templates', url: `${BASE_URL}/quotations/templates` },
    { name: 'Get subscriptions ledger', url: `${BASE_URL}/subscriptions` },
    { name: 'Get invoices list', url: `${BASE_URL}/invoices` },
    { name: 'Get discount rules', url: `${BASE_URL}/discounts` },
    { name: 'Get payment transactions', url: `${BASE_URL}/payments` },
    { name: 'Get finance summary KPIs', url: `${BASE_URL}/finance/kpis` },
    { name: 'Get cash flow data', url: `${BASE_URL}/finance/cash-flow` },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(t.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      console.log(`  ✓ ${t.name} -> OK (status: ${res.status}, items: ${Array.isArray(data) ? data.length : typeof data})`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${t.name} -> FAILED: ${err.message}`);
    }
  }

  // Test POST validation
  try {
    const promoRes = await fetch(`${BASE_URL}/discounts/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'ENT-VOL-15', quantity: 6, subtotal: 10000 }),
    });
    const promoData = await promoRes.json();
    if (promoData.valid) {
      console.log(`  ✓ Validate promo code ENT-VOL-15 -> OK (discount: -$${promoData.discountAmount})`);
      passed++;
    } else {
      throw new Error(promoData.message);
    }
  } catch (err) {
    console.error(`  ✗ Validate promo code -> FAILED: ${err.message}`);
  }

  console.log(`\n🎉 Verification Completed: ${passed}/${tests.length + 1} tests passed!`);
  if (passed === tests.length + 1) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
