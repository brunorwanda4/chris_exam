require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smis_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT
// const authenticate = async (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ error: "Access denied" });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
//       decoded.id,
//     ]);
//     if (users.length === 0) throw new Error();

//     req.user = users[0];
//     next();
//   } catch (error) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// Routes
// User registration
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.status(201).json({ id: result.insertId, username });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// User login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (
      users.length === 0 ||
      !(await bcrypt.compare(password, users[0].password))
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: users[0].id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, username: users[0].username });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Spare Parts CRUD
app.get("/api/spare-parts", async (_, res) => {
  try {
    const [spareParts] = await pool.query("SELECT * FROM spare_parts");
    res.json(spareParts);
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error" });
  }
});

app.post("/api/spare-parts", async (req, res) => {
  try {
    const { name, category, quantity, unit_price } = req.body;
    const [result] = await pool.query(
      "INSERT INTO spare_parts (name, category, quantity, unit_price) VALUES (?, ?, ?, ?)",
      [name, category, quantity, unit_price]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Stock In
app.get("/api/stock-in", async (_, res) => {
  try {
    const query = `
            SELECT si.*, sp.name as spare_part_name 
            FROM stock_in si
            JOIN spare_parts sp ON si.spare_part_id = sp.id
        `;
    const [stockIn] = await pool.query(query);
    res.json(stockIn);
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error" });
  }
});

app.post("/api/stock-in", async (req, res) => {
  try {
    const { spare_part_id, quantity, date } = req.body;

    // Start transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Add stock in record
      const [stockInResult] = await conn.query(
        "INSERT INTO stock_in (spare_part_id, quantity, date) VALUES (?, ?, ?)",
        [spare_part_id, quantity, date]
      );

      // Update spare part quantity
      await conn.query(
        "UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?",
        [quantity, spare_part_id]
      );

      await conn.commit();
      res.status(201).json({ id: stockInResult.insertId });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Stock Out
app.get("/api/stock-out", async (_, res) => {
  try {
    const query = `
            SELECT so.*, sp.name as spare_part_name 
            FROM stock_out so
            JOIN spare_parts sp ON so.spare_part_id = sp.id
        `;
    const [stockOut] = await pool.query(query);
    res.json(stockOut);
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error" });
  }
});

app.post("/api/stock-out", async (req, res) => {
  try {
    const { spare_part_id, quantity, unit_price, date } = req.body;

    // Start transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Check available quantity
      const [spareParts] = await conn.query(
        "SELECT quantity FROM spare_parts WHERE id = ? FOR UPDATE",
        [spare_part_id]
      );

      if (spareParts.length === 0) {
        throw new Error("Spare part not found");
      }

      const availableQuantity = spareParts[0].quantity;
      if (availableQuantity < quantity) {
        throw new Error("Insufficient stock");
      }

      // Add stock out record
      const [stockOutResult] = await conn.query(
        "INSERT INTO stock_out (spare_part_id, quantity, unit_price, date) VALUES (?, ?, ?, ?)",
        [spare_part_id, quantity, unit_price, date]
      );

      // Update spare part quantity
      await conn.query(
        "UPDATE spare_parts SET quantity = quantity - ? WHERE id = ?",
        [quantity, spare_part_id]
      );

      await conn.commit();
      res.status(201).json({ id: stockOutResult.insertId });
    } catch (error) {
      await conn.rollback();
      res.status(400).json({ error: error.message });
    } finally {
      conn.release();
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update stock out
app.put("/api/stock-out/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { spare_part_id, quantity, unit_price, date } = req.body;

    // Start transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Get the original stock out record
      const [originalRecords] = await conn.query(
        "SELECT * FROM stock_out WHERE id = ? FOR UPDATE",
        [id]
      );

      if (originalRecords.length === 0) {
        throw new Error("Stock out record not found");
      }

      const originalRecord = originalRecords[0];

      // Update the stock out record
      await conn.query(
        "UPDATE stock_out SET spare_part_id = ?, quantity = ?, unit_price = ?, date = ? WHERE id = ?",
        [spare_part_id, quantity, unit_price, date, id]
      );

      // Calculate quantity difference
      const quantityDiff = originalRecord.quantity - quantity;

      if (
        quantityDiff !== 0 ||
        originalRecord.spare_part_id !== spare_part_id
      ) {
        // If quantity changed or part changed, update spare parts

        // First, revert the original transaction
        if (originalRecord.spare_part_id === spare_part_id) {
          // Same part, just adjust quantity
          await conn.query(
            "UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?",
            [quantityDiff, spare_part_id]
          );
        } else {
          // Different part - revert original and apply new
          await conn.query(
            "UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?",
            [originalRecord.quantity, originalRecord.spare_part_id]
          );
          await conn.query(
            "UPDATE spare_parts SET quantity = quantity - ? WHERE id = ?",
            [quantity, spare_part_id]
          );
        }
      }

      await conn.commit();
      res.json({ message: "Stock out updated successfully" });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete stock out
app.delete("/api/stock-out/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Start transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Get the stock out record
      const [records] = await conn.query(
        "SELECT * FROM stock_out WHERE id = ? FOR UPDATE",
        [id]
      );

      if (records.length === 0) {
        throw new Error("Stock out record not found");
      }

      const record = records[0];

      // Delete the record
      await conn.query("DELETE FROM stock_out WHERE id = ?", [id]);

      // Update spare parts quantity (add back the stock)
      await conn.query(
        "UPDATE spare_parts SET quantity = quantity + ? WHERE id = ?",
        [record.quantity, record.spare_part_id]
      );

      await conn.commit();
      res.json({ message: "Stock out deleted successfully" });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reports
app.get("/api/reports/daily-stock-out", async (req, res) => {
  try {
    const { date } = req.query;
    const query = `
            SELECT so.*, sp.name as spare_part_name 
            FROM stock_out so
            JOIN spare_parts sp ON so.spare_part_id = sp.id
            WHERE so.date = ?
        `;
    const [stockOut] = await pool.query(query, [date]);
    res.json(stockOut);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/reports/stock-status", async (_, res) => {
  try {
    const query = `
            SELECT 
                sp.id,
                sp.name,
                sp.category,
                sp.quantity as stored_quantity,
                COALESCE(SUM(si.quantity), 0) as total_in,
                COALESCE(SUM(so.quantity), 0) as total_out,
                sp.quantity as remaining_quantity,
                sp.unit_price,
                sp.total_price
            FROM spare_parts sp
            LEFT JOIN stock_in si ON sp.id = si.spare_part_id
            LEFT JOIN stock_out so ON sp.id = so.spare_part_id
            GROUP BY sp.id
        `;
    const [status] = await pool.query(query);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
