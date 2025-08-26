// server.js  — CommonJS 版本
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Neon serverless driver
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 5000;

// 静态托管（如果你是 CRA：client/build；若是 Vite，请改为 ../client/dist）
app.use(express.static(path.join(__dirname, '../client/build')));

// 常用中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --- 测试数据库连通 ---
app.get('/api/health', async (_req, res) => {
  try {
    const r = await sql`select now()`;
    res.json({ ok: true, time: r[0].now });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
});

// （可选）检查表
// 先在 Neon 跑一次：
// create table if not exists items (id serial primary key, text text not null);
app.get('/api/ping-db', async (_req, res) => {
  try {
    const rows = await sql`select count(*)::int as count from items`;
    res.json({ ok: true, count: rows[0].count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Query failed' });
  }
});

// SPA fallback（如使用 React Router）
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
