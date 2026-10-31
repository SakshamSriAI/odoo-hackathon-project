import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'data/brightloop.db');

try {
  console.log(`\n📂 Connecting to SQLite Database at:\n   ${dbPath}\n`);
  const db = new DatabaseSync(dbPath);

  // 1. Products
  const products = db.prepare('SELECT id, name, type, sales_price, cost_price, status FROM products ORDER BY rowid DESC LIMIT 5').all();
  console.log('📦 Recent Products in SQLite Database:');
  console.table(products);

  // 2. Subscriptions
  const subscriptions = db.prepare('SELECT id, quotation_number, plan_name, status, grand_total FROM subscriptions ORDER BY rowid DESC LIMIT 5').all();
  console.log('\n📋 Recent Subscriptions in SQLite Database:');
  console.table(subscriptions);

  // 3. Invoices
  const invoices = db.prepare('SELECT id, subscription_id, status, grand_total, payment_terms FROM invoices ORDER BY rowid DESC LIMIT 5').all();
  console.log('\n🧾 Recent Invoices in SQLite Database:');
  console.table(invoices);

  // 4. Counts
  const pCount = db.prepare('SELECT count(*) as count FROM products').get().count;
  const sCount = db.prepare('SELECT count(*) as count FROM subscriptions').get().count;
  const iCount = db.prepare('SELECT count(*) as count FROM invoices').get().count;
  const tCount = db.prepare('SELECT count(*) as count FROM payment_transactions').get().count;

  console.log(`\n✅ Database Health: All tables verified.`);
  console.log(`   Products: ${pCount} | Subscriptions: ${sCount} | Invoices: ${iCount} | Payments: ${tCount}\n`);
} catch (err) {
  console.error('❌ Failed to inspect SQLite database:', err.message);
  process.exit(1);
}
