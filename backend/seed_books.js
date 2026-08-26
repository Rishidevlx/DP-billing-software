const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:\\\\Dolphin- Software\\\\DP-billing-software\\\\backend\\\\.env' });
const fs = require('fs');

const content = fs.readFileSync('d:\\\\Dolphin- Software\\\\DP-billing-software\\\\src\\\\seedBooks.js', 'utf8');
const arrayText = content.match(/\[([\s\S]*?)\]/)[0];
const booksList = new Function('return ' + arrayText)();

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: true }
  });

  console.log('Seeding ' + booksList.length + ' books...');
  
  for (const b of booksList) {
    try {
      // Parse std from itemName (e.g. "12th Elite English" -> "12th")
      const stdMatch = b.itemName.match(/^(\d{1,2}(?:th|ம் வகுப்பு))/i);
      const std = stdMatch ? stdMatch[1] : '';
      
      const mediumMatch = b.itemName.match(/தமிழ்|English/i);
      const medium = mediumMatch ? mediumMatch[0] : '';
      
      await pool.query(
        'INSERT INTO books (book_name, std, subject, medium, price, stock, alias_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [b.itemName, std, b.group || '', medium, b.sellingPrice || b.mrp, 0, b.itemName]
      );
    } catch (e) {
      if (e.code !== 'ER_DUP_ENTRY') {
        console.error('Error inserting', b.itemName, e.message);
      }
    }
  }
  
  console.log('Done!');
  process.exit(0);
}

seed();
