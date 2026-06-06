import express from "express";
import pool from "./ConnectionPool.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

const router = express.Router();

const SANDBOX_BOOTSTRAP_SQL = `
  CREATE TEMP TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age INTEGER,
    country VARCHAR(100)
  );

  INSERT INTO customers (customer_id, first_name, last_name, age, country) VALUES
    (1, 'John', 'Doe', 31, 'USA'),
    (2, 'Robert', 'Luna', 22, 'USA'),
    (3, 'David', 'Robinson', 22, 'UK'),
    (4, 'John', 'Reinhardt', 25, 'UK'),
    (5, 'Betty', 'Doe', 28, 'UAE');

  CREATE TEMP TABLE orders (
    order_id INTEGER PRIMARY KEY,
    item VARCHAR(100),
    amount INTEGER,
    customer_id INTEGER REFERENCES customers(customer_id)
  );

  INSERT INTO orders (order_id, item, amount, customer_id) VALUES
    (1, 'Keyboard', 400, 4),
    (2, 'Mouse', 300, 4),
    (3, 'Monitor', 12000, 3),
    (4, 'Keyboard', 400, 1),
    (5, 'Mousepad', 250, 2);

  CREATE TEMP TABLE shippings (
    shipping_id INTEGER PRIMARY KEY,
    status INTEGER,
    customer INTEGER REFERENCES customers(customer_id)
  );

  INSERT INTO shippings (shipping_id, status, customer) VALUES
    (1, 0, 2),
    (2, 0, 4),
    (3, 1, 3),
    (4, 0, 5),
    (5, 1, 1);
  `;

const normalizePgResult = (rawResult) => {
    const result = Array.isArray(rawResult)
      ? rawResult[rawResult.length - 1]
      : rawResult;

    const rows = Array.isArray(result?.rows) ? result.rows : [];
    const fields = Array.isArray(result?.fields)
      ? result.fields.map((field) => field.name)
      : [];

    return {
      rows,
      fields,
      rowCount: typeof result?.rowCount === "number" ? result.rowCount : rows.length,
    };
};

const runSandboxQuery = async (query) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL statement_timeout = 10000");
      await client.query(SANDBOX_BOOTSTRAP_SQL);
      const rawResult = await client.query(query);
      await client.query("ROLLBACK");
      return normalizePgResult(rawResult);
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Ignore rollback errors; original error is propagated.
      }
      throw error;
    } finally {
      client.release();
    }
};

const getSandboxPreview = async () => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL statement_timeout = 10000");
      await client.query(SANDBOX_BOOTSTRAP_SQL);

      const customers = await client.query(
        "SELECT customer_id, first_name, last_name, age, country FROM customers ORDER BY customer_id"
      );
      const orders = await client.query(
        "SELECT order_id, item, amount, customer_id FROM orders ORDER BY order_id"
      );
      const shippings = await client.query(
        "SELECT shipping_id, status, customer FROM shippings ORDER BY shipping_id"
      );

      await client.query("ROLLBACK");

      return {
        tables: {
          customers: customers.rows,
          orders: orders.rows,
          shippings: shippings.rows,
        },
      };
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Ignore rollback errors; original error is propagated.
      }
      throw error;
    } finally {
      client.release();
    }
};

router.post("/", catchAsync(async (req, res) => {
    const { query } = req.body;

    if (!query || !query.trim()) {
        throw new AppError("Empty query", 400);
    }

    const rawResult = await pool.query(query);
    res.json(normalizePgResult(rawResult));
}));

router.get("/sandbox/preview", catchAsync(async (req, res) => {
    const preview = await getSandboxPreview();
    res.json(preview);
}));

router.post("/sandbox", catchAsync(async (req, res) => {
    const { query } = req.body;

    if (!query || !query.trim()) {
      throw new AppError("Query cannot be empty", 400);
    }

    const result = await runSandboxQuery(query);
    res.json(result);
}));

export default router;
