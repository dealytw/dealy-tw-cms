// Run with: node ./scripts/smoke-lifecycle.mjs
import { createStrapi } from '@strapi/strapi';

const run = async () => {
  console.log('🔥 Starting lifecycle smoke test...');
  const app = await createStrapi().load();
  await app.start();
  
  try {
    const uid = 'api::merchant.merchant';

    // 1) Create
    console.log('🔥 Creating merchant...');
    const created = await strapi.documents(uid).create({
      data: { merchant_name: '測試商戶' },
      status: 'draft',
    });
    
    console.log('🔥 Created merchant:', created);
    if (created.page_title_h1 !== '測試商戶優惠碼') {
      throw new Error(`page_title_h1 not set on create. Expected: 測試商戶優惠碼, Got: ${created.page_title_h1}`);
    }
    console.log('✅ Create test passed');

    // 2) Update name -> should recompute
    console.log('🔥 Updating merchant name...');
    const updated = await strapi.documents(uid).update({
      documentId: created.documentId,
      data: { merchant_name: '新商戶' },
    });
    
    console.log('🔥 Updated merchant:', updated);
    if (updated.page_title_h1 !== '新商戶優惠碼') {
      throw new Error(`page_title_h1 not recomputed on update. Expected: 新商戶優惠碼, Got: ${updated.page_title_h1}`);
    }
    console.log('✅ Update test passed');

    console.log('✅ Lifecycle smoke test passed');
  } finally {
    await app.destroy();
  }
};

run().catch((e) => { 
  console.error('❌ Smoke test failed:', e); 
  process.exit(1); 
});
