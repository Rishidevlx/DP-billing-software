const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database Tables
const initDB = async () => {
  try {
    // 1. Roles Table
    const createRolesTable = `
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description VARCHAR(255)
      );
    `;
    await pool.query(createRolesTable);

    // Insert default roles if they don't exist
    const [roles] = await pool.query('SELECT * FROM roles');
    if (roles.length === 0) {
      await pool.query("INSERT INTO roles (name, description) VALUES ('Admin', 'Full access to all modules')");
      await pool.query("INSERT INTO roles (name, description) VALUES ('Standard User', 'Limited access')");
    }

    // 2. Permissions Table
    const createPermissionsTable = `
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        module VARCHAR(100) NOT NULL,
        can_view BOOLEAN DEFAULT false,
        can_create BOOLEAN DEFAULT false,
        can_edit BOOLEAN DEFAULT false,
        can_delete BOOLEAN DEFAULT false,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY role_module_unique (role_id, module)
      );
    `;
    await pool.query(createPermissionsTable);

    // Setup Admin Permissions (Full Access to all modules)
    const [adminRole] = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");
    if (adminRole.length > 0) {
      const adminId = adminRole[0].id;
      const modules = ['Dashboard', 'Bills', 'Returns', 'Books', 'Clients', 'Stocks', 'Reports', 'Settings', 'Users', 'Roles'];
      for (const mod of modules) {
        await pool.query(`
          INSERT IGNORE INTO permissions (role_id, module, can_view, can_create, can_edit, can_delete) 
          VALUES (?, ?, true, true, true, true)
        `, [adminId, mod]);
      }
    }

    // 3. Update Users Table
    // Try to add role_id if it doesn't exist
    try {
      await pool.query('ALTER TABLE users ADD COLUMN role_id INT');
      await pool.query('ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id)');
    } catch (e) {
      // Column already exists, ignore
    }

    // Map existing string roles to role_id
    try {
      await pool.query("UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Admin') WHERE role = 'admin' AND role_id IS NULL");
      await pool.query("UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Standard User') WHERE role = 'user' AND role_id IS NULL");
    } catch (e) {
      // Column 'role' likely already dropped, ignore
    }

    // Try to drop the old role column if role_id is fully populated
    try {
      await pool.query('ALTER TABLE users DROP COLUMN role');
    } catch (e) {
      // Ignore if it's already dropped or fails
    }

    // Ensure default admin exists
    const [rows] = await pool.query("SELECT * FROM users WHERE email = 'admin@dp.com'");
    if (rows.length === 0) {
      const [adminRole2] = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");
      if(adminRole2.length > 0) {
         await pool.query("INSERT INTO users (name, email, password, role_id) VALUES ('Admin User', 'admin@dp.com', 'admin', ?)", [adminRole2[0].id]);
      }
    }
    

    // 4. Books Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        book_name VARCHAR(255) NOT NULL,
        std VARCHAR(50),
        subject VARCHAR(100),
        medium VARCHAR(50),
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        stock INT NOT NULL DEFAULT 0,
        alias_name VARCHAR(100)
      );
    `);

    // 5. Clients Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        school VARCHAR(255),
        mobile VARCHAR(20),
        address1 VARCHAR(255),
        address2 VARCHAR(255),
        town VARCHAR(100),
        district VARCHAR(100),
        state VARCHAR(100)
      );
    `);

    // 6. Bills Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_no VARCHAR(50) NOT NULL UNIQUE,
        date VARCHAR(20),
        customer_id INT,
        transport VARCHAR(100),
        destination VARCHAR(100),
        lr_no VARCHAR(50),
        lr_date VARCHAR(20),
        bundles VARCHAR(50),
        gross_amount DECIMAL(10,2),
        discount_percent DECIMAL(5,2),
        discount_amount DECIMAL(10,2),
        freight DECIMAL(10,2),
        round_off DECIMAL(10,2),
        net_amount DECIMAL(10,2),
        created_by VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'ACTIVE'
      );
    `);
    try { await pool.query('ALTER TABLE bills ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP'); } catch(e) {}


    // 7. Bill Items Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_id INT,
        book_id INT,
        qty INT,
        rate DECIMAL(10,2),
        amount DECIMAL(10,2),
        teachers_copy INT,
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
      );
    `);

    // 8. Returns Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS returns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        return_no VARCHAR(50) NOT NULL UNIQUE,
        date VARCHAR(20),
        customer_id INT,
        transport VARCHAR(100),
        lr_no VARCHAR(50),
        lr_date VARCHAR(20),
        bundles VARCHAR(50),
        gross_amount DECIMAL(10,2),
        discount_percent DECIMAL(5,2),
        discount_amount DECIMAL(10,2),
        freight DECIMAL(10,2),
        round_off DECIMAL(10,2),
        net_amount DECIMAL(10,2),
        created_by VARCHAR(100),
        status VARCHAR(20) DEFAULT 'ACTIVE'
      );
    `);

    // 9. Return Items Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS return_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        return_id INT,
        book_id INT,
        qty INT,
        rate DECIMAL(10,2),
        amount DECIMAL(10,2),
        teachers_copy INT,
        FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE
      );
    `);

    // 10. Receipts Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        receipt_no VARCHAR(50) NOT NULL UNIQUE,
        date VARCHAR(20),
        customer_id INT,
        amount DECIMAL(10,2),
        payment_mode VARCHAR(50),
        reference_no VARCHAR(100),
        remarks TEXT,
        created_by VARCHAR(100)
      );
    `);

    // 11. Stock Entries Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date VARCHAR(20),
        book_id INT,
        qty INT,
        type VARCHAR(20),
        remarks TEXT,
        created_by VARCHAR(100)
      );
    `);

    
    // 12. Transports Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        destination VARCHAR(255)
      );
    `);

    // 13. Banks Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    // 14. Settings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT
      );
    `);

    
    // 15. Recycle Bin Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recycle_bin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recycle_type VARCHAR(50) NOT NULL,
        deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        item_data JSON
      );
    `);

    console.log('Database tables initialized successfully');

  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
};

initDB();

// --- Users API ---

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.id, u.name, u.email, u.created_at, u.role_id, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a user
app.post('/api/users', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    await pool.query('INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)', [name, email, password, role]);
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'User with this email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update a user
app.put('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  const { name, password, role } = req.body;
  try {
    await pool.query('UPDATE users SET name = ?, password = ?, role_id = ? WHERE email = ?', [name, password, role, email]);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user
app.delete('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  if (email === 'admin@dp.com') {
    return res.status(403).json({ error: 'Cannot delete primary admin' });
  }
  try {
    await pool.query('DELETE FROM users WHERE email = ?', [email]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT u.id, u.name, u.email, u.role_id, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ? AND u.password = ?', 
      [email, password]
    );
    if (rows.length > 0) {
      const user = rows[0];
      // Fetch permissions if they have a role
      if (user.role_id) {
        const [perms] = await pool.query('SELECT * FROM permissions WHERE role_id = ?', [user.role_id]);
        
        // Convert array to the object format expected by the frontend
        const permissionsObject = {};
        for (const p of perms) {
          permissionsObject[p.module] = {
            can_view: Boolean(p.can_view),
            can_create: Boolean(p.can_create),
            can_edit: Boolean(p.can_edit),
            can_delete: Boolean(p.can_delete)
          };
        }
        user.permissions = permissionsObject;
      } else {
        user.permissions = {};
      }
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- Roles API ---
app.get('/api/roles', async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles');
    // For each role, fetch permissions
    for (let role of roles) {
      const [perms] = await pool.query('SELECT * FROM permissions WHERE role_id = ?', [role.id]);
      role.permissions = perms;
    }
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/roles', async (req, res) => {
  const { name, description, permissions } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO roles (name, description) VALUES (?, ?)', [name, description]);
    const roleId = result.insertId;
    
    if (permissions && permissions.length > 0) {
      for (const p of permissions) {
        await pool.query(
          'INSERT INTO permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
          [roleId, p.module, p.can_view, p.can_create, p.can_edit, p.can_delete]
        );
      }
    }
    res.status(201).json({ message: 'Role created', id: roleId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/roles/:id', async (req, res) => {
  const roleId = req.params.id;
  const { name, description, permissions } = req.body;
  try {
    if (name === 'Admin') return res.status(403).json({ error: 'Cannot modify core Admin role' });
    
    await pool.query('UPDATE roles SET name = ?, description = ? WHERE id = ?', [name, description, roleId]);
    
    if (permissions) {
      // Clear old permissions
      await pool.query('DELETE FROM permissions WHERE role_id = ?', [roleId]);
      // Insert new
      for (const p of permissions) {
        await pool.query(
          'INSERT INTO permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
          [roleId, p.module, p.can_view, p.can_create, p.can_edit, p.can_delete]
        );
      }
    }
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/roles/:id', async (req, res) => {
  const roleId = req.params.id;
  try {
    // Check if role is used by users
    const [users] = await pool.query('SELECT id FROM users WHERE role_id = ?', [roleId]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Cannot delete role assigned to active users' });
    }
    await pool.query('DELETE FROM roles WHERE id = ? AND name != \'Admin\'', [roleId]);
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ==========================================
// BOOKS API
// ==========================================
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  const { book_name, std, subject, medium, price, stock, alias_name } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO books (book_name, std, subject, medium, price, stock, alias_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [book_name, std, subject, medium, price, stock, alias_name]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const { book_name, std, subject, medium, price, stock, alias_name } = req.body;
  try {
    await pool.query(
      'UPDATE books SET book_name=?, std=?, subject=?, medium=?, price=?, stock=?, alias_name=? WHERE id=?',
      [book_name, std, subject, medium, price, stock, alias_name, id]
    );
    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM books WHERE id=?', [id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed API to bulk insert books
app.post('/api/books/seed', async (req, res) => {
  const books = req.body; // Array of books
  try {
    // Check if table is empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM books');
    if (rows[0].count > 0) {
      return res.status(400).json({ message: 'Books already seeded' });
    }
    for (const b of books) {
      await pool.query(
        'INSERT INTO books (book_name, std, subject, medium, price, stock, alias_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [b.bookName || b.book_name, b.std, b.subject, b.medium, b.price, b.stock || 0, b.aliasName || b.alias_name]
      );
    }
    res.status(201).json({ message: 'Books seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CLIENTS API
// ==========================================
app.get('/api/clients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clients');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, school, mobile, address1, address2, town, district, state } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO clients (name, school, mobile, address1, address2, town, district, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, school, mobile, address1, address2, town, district, state]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, school, mobile, address1, address2, town, district, state } = req.body;
  try {
    await pool.query(
      'UPDATE clients SET name=?, school=?, mobile=?, address1=?, address2=?, town=?, district=?, state=? WHERE id=?',
      [name, school, mobile, address1, address2, town, district, state, id]
    );
    res.json({ message: 'Client updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM clients WHERE id=?', [id]);
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// BILLS API
// ==========================================
app.get('/api/bills', async (req, res) => {
  try {
    const [bills] = await pool.query('SELECT * FROM bills');
    for (const bill of bills) {
      const [items] = await pool.query('SELECT * FROM bill_items WHERE bill_id=?', [bill.id]);
      bill.items = items;
    }
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bills/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [bills] = await pool.query('SELECT * FROM bills WHERE id=?', [id]);
    if (bills.length === 0) return res.status(404).json({ error: 'Bill not found' });
    const bill = bills[0];
    const [items] = await pool.query('SELECT * FROM bill_items WHERE bill_id=?', [id]);
    bill.items = items;
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bills', async (req, res) => {
  const { bill_no, date, customer_id, transport, destination, lr_no, lr_date, bundles, gross_amount, discount_percent, discount_amount, freight, round_off, net_amount, created_by, items } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO bills (bill_no, date, customer_id, transport, destination, lr_no, lr_date, bundles, gross_amount, discount_percent, discount_amount, freight, round_off, net_amount, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [bill_no, date, customer_id, transport, destination, lr_no, lr_date, bundles, gross_amount, discount_percent, discount_amount, freight, round_off, net_amount, created_by]
    );
    const billId = result.insertId;
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(
          'INSERT INTO bill_items (bill_id, book_id, qty, rate, amount, teachers_copy) VALUES (?, ?, ?, ?, ?, ?)',
          [billId, item.book_id, item.qty, item.rate, item.amount, item.teachers_copy || 0]
        );
        // Decrease stock
        await pool.query('UPDATE books SET stock = stock - ? WHERE id = ?', [item.qty, item.book_id]);
      }
    }
    res.status(201).json({ id: billId, bill_no });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Note: Add DELETE and PUT for bills if needed

// ==========================================
// RETURNS API
// ==========================================
app.get('/api/returns', async (req, res) => {
  try {
    const [returns] = await pool.query('SELECT * FROM returns');
    for (const r of returns) {
      const [items] = await pool.query('SELECT * FROM return_items WHERE return_id=?', [r.id]);
      r.items = items;
    }
    res.json(returns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/returns', async (req, res) => {
  const { return_no, date, customer_id, transport, lr_no, lr_date, bundles, gross_amount, discount_percent, discount_amount, freight, round_off, net_amount, created_by, items } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO returns (return_no, date, customer_id, transport, lr_no, lr_date, bundles, gross_amount, discount_percent, discount_amount, freight, round_off, net_amount, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [return_no, date, customer_id, transport, lr_no, lr_date, bundles, gross_amount, discount_percent, discount_amount, freight, round_off, net_amount, created_by]
    );
    const returnId = result.insertId;
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(
          'INSERT INTO return_items (return_id, book_id, qty, rate, amount, teachers_copy) VALUES (?, ?, ?, ?, ?, ?)',
          [returnId, item.book_id, item.qty, item.rate, item.amount, item.teachers_copy || 0]
        );
        // Increase stock
        await pool.query('UPDATE books SET stock = stock + ? WHERE id = ?', [item.qty, item.book_id]);
      }
    }
    res.status(201).json({ id: returnId, return_no });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// RECEIPTS API
// ==========================================
app.get('/api/receipts', async (req, res) => {
  try {
    const [receipts] = await pool.query('SELECT * FROM receipts');
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/receipts', async (req, res) => {
  const { receipt_no, date, customer_id, amount, payment_mode, reference_no, remarks, created_by } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO receipts (receipt_no, date, customer_id, amount, payment_mode, reference_no, remarks, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [receipt_no, date, customer_id, amount, payment_mode, reference_no, remarks, created_by]
    );
    res.status(201).json({ id: result.insertId, receipt_no });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// STOCK ENTRIES API
// ==========================================
app.get('/api/stock_entries', async (req, res) => {
  try {
    const [entries] = await pool.query('SELECT * FROM stock_entries');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stock_entries', async (req, res) => {
  const { date, book_id, qty, type, remarks, created_by } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO stock_entries (date, book_id, qty, type, remarks, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [date, book_id, qty, type, remarks, created_by]
    );
    // Update stock in books table
    if (type === 'ADD') {
        await pool.query('UPDATE books SET stock = stock + ? WHERE id = ?', [qty, book_id]);
    } else if (type === 'DEDUCT') {
        await pool.query('UPDATE books SET stock = stock - ? WHERE id = ?', [qty, book_id]);
    }
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ==========================================
// SETTINGS / MASTER DATA API
// ==========================================

// Transports
app.get('/api/transports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transports');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transports', async (req, res) => {
  const { name, destination } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO transports (name, destination) VALUES (?, ?)', [name, destination]);
    res.status(201).json({ id: result.insertId, name, destination });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transports/:name', async (req, res) => {
  try {
    await pool.query('DELETE FROM transports WHERE name = ?', [req.params.name]);
    res.json({ message: 'Transport deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Banks
app.get('/api/banks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banks');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/banks', async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO banks (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/banks/:name', async (req, res) => {
  try {
    await pool.query('DELETE FROM banks WHERE name = ?', [req.params.name]);
    res.json({ message: 'Bank deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings (Key-Value)
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const { key, value } = req.body;
  try {
    await pool.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, value, value]);
    res.json({ message: 'Setting saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/settings/:key', async (req, res) => {
  try {
    await pool.query('DELETE FROM settings WHERE setting_key = ?', [req.params.key]);
    res.json({ message: 'Setting deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// RECYCLE BIN API
// ==========================================

app.get('/api/recycle_bin', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recycle_bin ORDER BY deleted_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recycle_bin', async (req, res) => {
  const { type, item_data } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO recycle_bin (recycle_type, item_data) VALUES (?, ?)', [type, JSON.stringify(item_data)]);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recycle_bin/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM recycle_bin WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recycle_bin', async (req, res) => {
  try {
    await pool.query('DELETE FROM recycle_bin');
    res.json({ message: 'Recycle bin emptied' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
