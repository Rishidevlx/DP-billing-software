const mysql = require('mysql2/promise');
require('dotenv').config();

// Price list data extracted from the Dolphin Publications 2026-27 price list images
const priceData = [
  // 12th Standard
  { pattern: '12', subject: 'உன்னால் முடியும் - தமிழ்', mrp: 288.00, school_rate: 170.00 },
  { pattern: '12', subject: 'அமுதசுரபி - தமிழ்', mrp: 207.00, school_rate: 120.00 },
  { pattern: '12', subject: 'Step to Success - English', mrp: 288.00, school_rate: 170.00 },
  { pattern: '12', subject: 'Elite English', mrp: 207.00, school_rate: 120.00 },
  { pattern: '12', subject: 'English Exercise Book', mrp: 99.00, school_rate: 60.00 },

  // 11th Standard
  { pattern: '11', subject: 'உன்னால் முடியும் - தமிழ்', mrp: 288.00, school_rate: 170.00 },
  { pattern: '11', subject: 'அமுதசுரபி - தமிழ்', mrp: 207.00, school_rate: 120.00 },
  { pattern: '11', subject: 'Step to Success - English', mrp: 288.00, school_rate: 170.00 },
  { pattern: '11', subject: 'Elite English', mrp: 207.00, school_rate: 120.00 },
  { pattern: '11', subject: 'English Exercise Book', mrp: 99.00, school_rate: 60.00 },

  // 10th Standard
  { pattern: '10', subject: 'உன்னால் முடியும் - தமிழ்', mrp: 288.00, school_rate: 170.00 },
  { pattern: '10', subject: 'அமுதசுரபி - தமிழ்', mrp: 207.00, school_rate: 120.00 },
  { pattern: '10', subject: 'Step to Success - English', mrp: 288.00, school_rate: 170.00 },
  { pattern: '10', subject: 'Elite English', mrp: 207.00, school_rate: 120.00 },
  { pattern: '10', subject: 'English Exercise Book', mrp: 99.00, school_rate: 60.00 },
  { pattern: '10', subject: 'அறிவியல் - தமிழ்வழி', mrp: 207.00, school_rate: 120.00 },
  { pattern: '10', subject: 'Science English Medium', mrp: 207.00, school_rate: 120.00 },
  { pattern: '10', subject: 'சமூக அறிவியல் - தமிழ்வழி', mrp: 207.00, school_rate: 120.00 },
  { pattern: '10', subject: 'சமூக அறிவியல் வரைபட பயிற்சி ஏடு', mrp: 54.00, school_rate: 30.00 },
  { pattern: '10', subject: 'Social Science English Medium', mrp: 207.00, school_rate: 120.00 },
  { pattern: '10', subject: 'Map Drawing - Social EM', mrp: 54.00, school_rate: 30.00 },

  // 9th Standard
  { pattern: '9', subject: 'உன்னால் முடியும் - தமிழ்', mrp: 189.00, school_rate: 110.00 },
  { pattern: '9', subject: 'Step to Success - English', mrp: 189.00, school_rate: 110.00 },
  { pattern: '9', subject: 'English Exercise Book', mrp: 45.00, school_rate: 25.00 },
  { pattern: '9', subject: 'அறிவியல் - தமிழ்வழி', mrp: 189.00, school_rate: 110.00 },
  { pattern: '9', subject: 'Science English Medium', mrp: 189.00, school_rate: 110.00 },
  { pattern: '9', subject: 'சமூக அறிவியல் - தமிழ்வழி', mrp: 189.00, school_rate: 110.00 },
  { pattern: '9', subject: 'சமூக அறிவியல் வரைபட பயிற்சி ஏடு', mrp: 45.00, school_rate: 25.00 },
  { pattern: '9', subject: 'Social Science English Medium', mrp: 189.00, school_rate: 110.00 },
  { pattern: '9', subject: 'Map Drawing - Social EM', mrp: 45.00, school_rate: 25.00 },

  // 8th Standard
  { pattern: '8', subject: 'உன்னால் முடியும் - தமிழ்', mrp: 189.00, school_rate: 110.00 },
  { pattern: '8', subject: 'Step to Success - English', mrp: 189.00, school_rate: 110.00 },
  { pattern: '8', subject: 'அறிவியல் - தமிழ்வழி', mrp: 189.00, school_rate: 110.00 },
  { pattern: '8', subject: 'Science English Medium', mrp: 189.00, school_rate: 110.00 },
  { pattern: '8', subject: 'சமூக அறிவியல் - தமிழ்வழி', mrp: 189.00, school_rate: 110.00 },
  { pattern: '8', subject: 'சமூக அறிவியல் வரைபட பயிற்சி ஏடு', mrp: 36.00, school_rate: 20.00 },
  { pattern: '8', subject: 'Social Science English Medium', mrp: 189.00, school_rate: 110.00 },
  { pattern: '8', subject: 'Map Drawing - Social EM', mrp: 36.00, school_rate: 20.00 },

  // 7th Standard
  { pattern: '7', subject: 'உன்னால் முடியும் - தமிழ்', mrp: 171.00, school_rate: 100.00 },
  { pattern: '7', subject: 'Step to Success - English', mrp: 171.00, school_rate: 100.00 },
  { pattern: '7', subject: 'சமூக அறிவியல் - தமிழ்வழி', mrp: 171.00, school_rate: 100.00 },
  { pattern: '7', subject: 'சமூக அறிவியல் வரைபட பயிற்சி ஏடு', mrp: 36.00, school_rate: 20.00 },
  { pattern: '7', subject: 'Social Science English Medium', mrp: 171.00, school_rate: 100.00 },
  { pattern: '7', subject: 'Map Drawing - Social EM', mrp: 36.00, school_rate: 20.00 },

  // 6th Standard
  { pattern: '6', subject: 'உன்னால் முடியும் - தமிழ்', mrp: 171.00, school_rate: 100.00 },
  { pattern: '6', subject: 'Step to Success - English', mrp: 171.00, school_rate: 100.00 },
  { pattern: '6', subject: 'சமூக அறிவியல் - தமிழ்வழி', mrp: 171.00, school_rate: 100.00 },
  { pattern: '6', subject: 'சமூக அறிவியல் வரைபட பயிற்சி ஏடு', mrp: 36.00, school_rate: 20.00 },
  { pattern: '6', subject: 'Social Science English Medium', mrp: 171.00, school_rate: 100.00 },
  { pattern: '6', subject: 'Map Drawing - Social EM', mrp: 36.00, school_rate: 20.00 },
];

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: true } : undefined
  });

  console.log('Starting school rate migration...\n');

  // Step 1: Add columns if they don't exist
  const columns = ['mrp', 'school_rate', 'agent_rate', 'customer_rate'];
  for (const col of columns) {
    try {
      await pool.query(`ALTER TABLE books ADD COLUMN ${col} DECIMAL(10,2) DEFAULT 0.00`);
      console.log(`✅ Added column: ${col}`);
    } catch (e) {
      console.log(`ℹ️  Column ${col} already exists`);
    }
  }

  // Step 2: Fetch all books
  const [books] = await pool.query('SELECT id, book_name, price FROM books');
  console.log(`\nFound ${books.length} books in database.\n`);

  let updated = 0;
  let notFound = 0;

  // Step 3: Match and update each book
  for (const book of books) {
    const name = book.book_name || '';
    
    // Extract class number from book name (e.g., "12th", "12ம் வகுப்பு", "10th", etc.)
    const classMatch = name.match(/^(\d{1,2})(?:th|ம் வகுப்பு)/i);
    if (!classMatch) {
      console.log(`⚠️  Could not determine class for: ${name}`);
      notFound++;
      continue;
    }
    
    const classNum = classMatch[1];
    
    // Find matching price data
    const match = priceData.find(p => {
      if (p.pattern !== classNum) return false;
      // Check if the book name contains the subject
      return name.includes(p.subject);
    });

    if (match) {
      await pool.query(
        'UPDATE books SET mrp = ?, school_rate = ? WHERE id = ?',
        [match.mrp, match.school_rate, book.id]
      );
      console.log(`✅ Updated: ${name} → MRP: ${match.mrp}, School Rate: ${match.school_rate}`);
      updated++;
    } else {
      // If no match found, set mrp = price, school_rate = 0
      await pool.query(
        'UPDATE books SET mrp = ? WHERE id = ? AND (mrp IS NULL OR mrp = 0)',
        [book.price, book.id]
      );
      console.log(`⚠️  No price data match for: ${name} (set MRP = ${book.price})`);
      notFound++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Migration Complete!`);
  console.log(`✅ Updated: ${updated} books`);
  console.log(`⚠️  No match: ${notFound} books`);
  console.log(`========================================\n`);

  await pool.end();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
