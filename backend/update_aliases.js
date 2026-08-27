const db = require('./db');

function generateAlias(bookName) {
  let standard = '';
  const stdMatch = bookName.match(/^(\d+)/);
  if (stdMatch) {
    standard = stdMatch[1];
  }

  let subject = '';
  const lowerName = bookName.toLowerCase();
  
  if (lowerName.includes('சமூக') || lowerName.includes('social') || lowerName.includes('வரைபட')) {
    subject = 'SS';
  } else if (lowerName.includes('அறிவியல்') || lowerName.includes('science')) {
    subject = 'S';
  } else if (lowerName.includes('கணிதம்') || lowerName.includes('math')) {
    subject = 'M';
  } else if (lowerName.includes('physics')) {
    subject = 'PHY';
  } else if (lowerName.includes('chemistry')) {
    subject = 'CHE';
  } else if (lowerName.includes('biology')) {
    subject = 'BIO';
  } else if (lowerName.includes('botany')) {
    subject = 'BOT';
  } else if (lowerName.includes('zoology')) {
    subject = 'ZOO';
  } else if (lowerName.includes('commerce')) {
    subject = 'COM';
  } else if (lowerName.includes('accountancy')) {
    subject = 'ACC';
  } else if (lowerName.includes('economics')) {
    subject = 'ECO';
  } else if (lowerName.includes('history')) {
    subject = 'HIS';
  } else if (lowerName.includes('geography')) {
    subject = 'GEO';
  } else if (lowerName.includes('computer')) {
    subject = 'CS';
  } else if (lowerName.includes('english') || lowerName.includes('ஆங்கிலம்')) {
    subject = 'E';
  } else if (lowerName.includes('தமிழ்') || lowerName.includes('tamil')) {
    subject = 'T';
  }

  let alias = `${standard}${subject}`;
  return alias;
}

async function run() {
  try {
    const [books] = await db.query('SELECT id, book_name FROM books');
    console.log(`Found ${books.length} books. Generating aliases...`);
    
    const aliasCounts = {};

    for (const book of books) {
      let baseAlias = generateAlias(book.book_name);
      
      if (!baseAlias || baseAlias === '') {
         baseAlias = book.book_name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
      }

      let alias = baseAlias;
      
      if (aliasCounts[baseAlias]) {
        aliasCounts[baseAlias]++;
        alias = `${baseAlias}${aliasCounts[baseAlias]}`;
      } else {
        aliasCounts[baseAlias] = 1;
      }

      console.log(`ID: ${book.id} | Name: ${book.book_name} | New Alias: ${alias}`);
      
      await db.query('UPDATE books SET alias_name = ? WHERE id = ?', [alias, book.id]);
    }
    
    console.log('Update complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
