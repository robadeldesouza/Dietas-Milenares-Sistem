import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import fs from "fs";
import multer from "multer";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONFIG = {
  host:     process.env.DB_HOST || "127.0.0.1",
  port:     parseInt(process.env.DB_PORT || "3306"),
  user:     process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "dieta_milenar",
  waitForConnections: true,
  connectionLimit: 10,
};

const JWT_SECRET = process.env.JWT_SECRET || "dieta_milenar_secret_2024";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_4eC39HqLyjWDarjtT1zdp7dc");

// Multer config para upload de e-books
const ebooksDir = path.join(__dirname, "public", "e-books");
if (!fs.existsSync(ebooksDir)) fs.mkdirSync(ebooksDir, { recursive: true });

const ebookStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ebooksDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const withExt = safe.endsWith('.pdf') ? safe : `${safe}.pdf`;
    cb(null, `${Date.now()}_${withExt}`);
  },
});
const uploadEbook = multer({ storage: ebookStorage, limits: { fileSize: 100 * 1024 * 1024 } });

let pool: mysql.Pool;

async function initDB() {
  pool = mysql.createPool(DB_CONFIG);
  const conn = await pool.getConnection();
  console.log("[MySQL] Conectado:", DB_CONFIG.host, DB_CONFIG.database);
  conn.release();
}

const signToken = (p: object) => jwt.sign(p, JWT_SECRET, { expiresIn: "7d" });
const verifyToken = (t: string) => jwt.verify(t, JWT_SECRET) as any;

function auth(req: any, res: any, next: any) {
  const h = req.headers["authorization"];
  if (!h) return res.status(401).json({ error: "Token ausente" });
  try { req.user = verifyToken(h.replace("Bearer ", "")); next(); }
  catch { res.status(401).json({ error: "Token inválido" }); }
}

function adminOnly(req: any, res: any, next: any) {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Acesso negado" });
  next();
}

async function startServer() {
  await initDB();
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");
  app.use(express.json({ limit: "10mb" }));

  // AUTH
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const [rows]: any = await pool.query("SELECT * FROM users WHERE email=? LIMIT 1", [email]);
    const user = rows[0];
    if (!user || user.password_hash !== password)
      return res.status(401).json({ error: "Credenciais inválidas" });
    if (user.status === "blocked")
      return res.status(403).json({ error: "BLOCKED" });
    const { password_hash, ...safe } = user;
    res.json({ token: signToken({ id: user.id, email: user.email, role: user.role }), user: safe });
  });

  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, referral_code } = req.body;
    const [ex]: any = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (ex.length) return res.status(409).json({ error: "E-mail já cadastrado" });
    const hash = password;
    const id = randomUUID();
    let referredBy = null;
    if (referral_code) {
      const [ref]: any = await pool.query("SELECT id FROM users WHERE referral_code=?", [referral_code]);
      referredBy = ref[0]?.id || null;
    }
    await pool.query("INSERT INTO users (id,name,email,password_hash,role,referred_by) VALUES (?,?,?,?,?,?)",
      [id, name, email, hash, "VISITANTE", referredBy]);
    res.status(201).json({ token: signToken({ id, email, role: "VISITANTE" }), user: { id, name, email, role: "VISITANTE" } });
  });

  app.get("/api/auth/me", auth, async (req: any, res) => {
    const [rows]: any = await pool.query(
      "SELECT id,name,email,role,status,referral_code,referred_by,wallet_balance,pix_key,pix_key_type,created_at FROM users WHERE id=?",
      [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "Não encontrado" });
    res.json(rows[0]);
  });

  // USERS
  app.get("/api/users", auth, adminOnly, async (_r, res) => {
    const [rows]: any = await pool.query("SELECT id,name,email,role,status,referral_code,wallet_balance,pix_key,pix_key_type,created_at FROM users ORDER BY created_at DESC");
    res.json(rows);
  });
  app.patch("/api/users/:id/role", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE users SET role=? WHERE id=?", [req.body.role, req.params.id]);
    res.json({ ok: true });
  });
  app.patch("/api/users/:id/status", auth, adminOnly, async (req, res) => {
    const [r]: any = await pool.query("SELECT status FROM users WHERE id=?", [req.params.id]);
    const next = r[0]?.status === "active" ? "blocked" : "active";
    await pool.query("UPDATE users SET status=? WHERE id=?", [next, req.params.id]);
    res.json({ status: next });
  });

  app.patch("/api/users/:id/reset-password", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE users SET password_hash=? WHERE id=?", ["123456", req.params.id]);
    res.json({ ok: true });
  });

  app.delete("/api/users/:id", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.patch("/api/users/:id/pix", auth, async (req: any, res) => {
    if (req.user.id !== req.params.id && req.user.role !== "ADMIN") return res.status(403).json({ error: "Negado" });
    await pool.query("UPDATE users SET pix_key=?,pix_key_type=? WHERE id=?", [req.body.pix_key, req.body.pix_key_type, req.params.id]);
    res.json({ ok: true });
  });

  // SETTINGS
  app.get("/api/settings", async (_r, res) => {
    const [rows]: any = await pool.query("SELECT * FROM global_settings WHERE id=1");
    res.json(rows[0] || {});
  });
  app.put("/api/settings", auth, adminOnly, async (req, res) => {
    const f = req.body;
    const sets = Object.keys(f).map(k => `${k}=?`).join(",");
    await pool.query(`UPDATE global_settings SET ${sets} WHERE id=1`, Object.values(f));
    res.json({ ok: true });
  });

  // PLANS
  app.get("/api/plans", async (_r, res) => {
    const [rows]: any = await pool.query("SELECT * FROM plans WHERE active=1 ORDER BY price");
    res.json(rows.map((r: any) => ({ ...r, features: typeof r.features === "string" ? JSON.parse(r.features) : r.features })));
  });
  app.post("/api/plans", auth, adminOnly, async (req, res) => {
    const { name, price, old_price, period, is_popular, active, features } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO plans (id,name,price,old_price,period,is_popular,active,features) VALUES (?,?,?,?,?,?,?,?)",
      [id, name, price, old_price, period, is_popular ?? 0, active ?? 1, JSON.stringify(features || [])]);
    res.status(201).json({ id });
  });
  app.put("/api/plans/:id", auth, adminOnly, async (req, res) => {
    const { name, price, old_price, period, is_popular, active, features } = req.body;
    await pool.query("UPDATE plans SET name=?,price=?,old_price=?,period=?,is_popular=?,active=?,features=? WHERE id=?",
      [name, price, old_price, period, is_popular, active, JSON.stringify(features || []), req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/plans/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE plans SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // ORDERS
  app.post("/api/orders", auth, async (req: any, res) => {
    const { product_id, plan_name, total_amount, affiliate_id, payment_gateway_id, status } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO orders (id,user_id,product_id,affiliate_id,plan_name,total_amount,payment_gateway_id,status) VALUES (?,?,?,?,?,?,?,?)",
      [id, req.user.id, product_id || null, affiliate_id || null, plan_name, total_amount, payment_gateway_id || null, status || "pending"]);
    if (status === "paid") {
      await pool.query("UPDATE users SET role='MEMBRO' WHERE id=? AND role='VISITANTE'", [req.user.id]);
      if (affiliate_id) {
        const [sr]: any = await pool.query("SELECT commission_rate FROM global_settings WHERE id=1");
        const rate = sr[0]?.commission_rate || 0.5;
        const comm = total_amount * rate;
        await pool.query("INSERT INTO commissions (id,affiliate_id,order_id,amount,status,release_date) VALUES (?,?,?,?,?,?)",
          [randomUUID(), affiliate_id, id, comm, "pending", new Date(Date.now() + 7 * 86400000)]);
        await pool.query("UPDATE users SET wallet_balance=wallet_balance+? WHERE id=?", [comm, affiliate_id]);
      }
    }
    res.status(201).json({ id });
  });
  app.get("/api/orders", auth, async (req: any, res) => {
    if (req.user.role === "ADMIN") {
      const [rows]: any = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
      return res.json(rows);
    }
    const [rows]: any = await pool.query("SELECT * FROM orders WHERE user_id=? OR affiliate_id=? ORDER BY created_at DESC", [req.user.id, req.user.id]);
    res.json(rows);
  });
  app.patch("/api/orders/:id/status", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE orders SET status=? WHERE id=?", [req.body.status, req.params.id]);
    if (req.body.status === "paid") {
      const [r]: any = await pool.query("SELECT user_id FROM orders WHERE id=?", [req.params.id]);
      if (r[0]?.user_id) await pool.query("UPDATE users SET role='MEMBRO' WHERE id=? AND role='VISITANTE'", [r[0].user_id]);
    }
    res.json({ ok: true });
  });

  // COMMISSIONS
  app.get("/api/commissions", auth, async (req: any, res) => {
    if (req.user.role === "ADMIN") {
      const [rows]: any = await pool.query("SELECT * FROM commissions ORDER BY created_at DESC");
      return res.json(rows);
    }
    const [rows]: any = await pool.query("SELECT * FROM commissions WHERE affiliate_id=? ORDER BY created_at DESC", [req.user.id]);
    res.json(rows);
  });

  // WITHDRAWALS
  app.post("/api/withdrawals", auth, async (req: any, res) => {
    const { amount } = req.body;
    const [ur]: any = await pool.query("SELECT * FROM users WHERE id=?", [req.user.id]);
    const u = ur[0];
    if (!u || u.wallet_balance < amount) return res.status(400).json({ error: "Saldo insuficiente" });
    if (!u.pix_key) return res.status(400).json({ error: "Cadastre Pix antes" });
    const id = randomUUID();
    await pool.query("INSERT INTO withdrawals (id,user_id,amount,pix_key,status) VALUES (?,?,?,?,?)", [id, req.user.id, amount, u.pix_key, "requested"]);
    await pool.query("UPDATE users SET wallet_balance=wallet_balance-? WHERE id=?", [amount, req.user.id]);
    res.status(201).json({ id });
  });
  app.get("/api/withdrawals", auth, async (req: any, res) => {
    if (req.user.role === "ADMIN") {
      const [rows]: any = await pool.query("SELECT w.*,u.name user_name FROM withdrawals w LEFT JOIN users u ON u.id=w.user_id ORDER BY w.requested_at DESC");
      return res.json(rows);
    }
    const [rows]: any = await pool.query("SELECT * FROM withdrawals WHERE user_id=? ORDER BY requested_at DESC", [req.user.id]);
    res.json(rows);
  });
  app.patch("/api/withdrawals/:id", auth, adminOnly, async (req, res) => {
    const { status } = req.body;
    const [wr]: any = await pool.query("SELECT * FROM withdrawals WHERE id=?", [req.params.id]);
    const w = wr[0];
    if (status === "rejected" && w?.status === "requested")
      await pool.query("UPDATE users SET wallet_balance=wallet_balance+? WHERE id=?", [w.amount, w.user_id]);
    await pool.query("UPDATE withdrawals SET status=?,resolved_at=NOW() WHERE id=?", [status, req.params.id]);
    res.json({ ok: true });
  });

  // NOTIFICATIONS
  app.get("/api/notifications", auth, async (req: any, res) => {
    const [rows]: any = await pool.query("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC", [req.user.id]);
    res.json(rows);
  });

  // PRODUCTS
  app.get("/api/products", async (_r, res) => {
    const [products]: any = await pool.query("SELECT * FROM products");
    const [mods]: any = await pool.query("SELECT * FROM product_modules ORDER BY sort_order");
    const [chaps]: any = await pool.query("SELECT * FROM product_chapters ORDER BY sort_order");
    res.json(products.map((p: any) => ({
      ...p,
      modules: mods.filter((m: any) => m.product_id === p.id).map((m: any) => ({
        ...m, chapters: chaps.filter((c: any) => c.module_id === m.id)
      }))
    })));
  });
  app.post("/api/products", auth, adminOnly, async (req, res) => {
    const { name, slug, description, price, offer_price, cover_image, active, drip_enabled, payment_link, pix_key, pix_key_type } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO products (id,name,slug,description,price,offer_price,cover_image,active,drip_enabled,payment_link,pix_key,pix_key_type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      [id, name, slug, description, price, offer_price ?? null, cover_image, active ?? 1, drip_enabled ?? 0, payment_link ?? null, pix_key ?? null, pix_key_type ?? null]);
    res.status(201).json({ id });
  });
  app.put("/api/products/:id", auth, adminOnly, async (req, res) => {
    const { name, slug, description, price, offer_price, cover_image, active, drip_enabled, payment_link, pix_key, pix_key_type } = req.body;
    await pool.query("UPDATE products SET name=?,slug=?,description=?,price=?,offer_price=?,cover_image=?,active=?,drip_enabled=?,payment_link=?,pix_key=?,pix_key_type=? WHERE id=?",
      [name, slug, description, price, offer_price ?? null, cover_image, active, drip_enabled ?? 0, payment_link ?? null, pix_key ?? null, pix_key_type ?? null, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/products/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE products SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // BONUSES
  app.get("/api/bonuses", auth, async (req: any, res) => {
    if (req.user.role === "ADMIN") {
      const [r]: any = await pool.query("SELECT * FROM bonuses ORDER BY created_at DESC");
      return res.json(r);
    }
    const [r]: any = await pool.query("SELECT * FROM bonuses WHERE active=1 AND target_audience=?", [req.user.role]);
    res.json(r);
  });
  app.post("/api/bonuses", auth, adminOnly, async (req, res) => {
    const { title, description, cover_image, download_url, content, target_audience, active } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO bonuses (id,title,description,cover_image,download_url,content,target_audience,active) VALUES (?,?,?,?,?,?,?,?)",
      [id, title, description, cover_image, download_url, content, target_audience || "MEMBRO", active ?? 1]);
    res.status(201).json({ id });
  });
  app.put("/api/bonuses/:id", auth, adminOnly, async (req, res) => {
    const { title, description, cover_image, download_url, content, target_audience, active } = req.body;
    await pool.query("UPDATE bonuses SET title=?,description=?,cover_image=?,download_url=?,content=?,target_audience=?,active=? WHERE id=?",
      [title, description, cover_image, download_url, content, target_audience, active, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonuses/:id", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM bonuses WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // ── Bonus Categories ──────────────────────────────────────
  app.get("/api/bonus-categories/inactive", auth, adminOnly, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bonus_categories WHERE active=0 ORDER BY sort_order");
    res.json(r);
  });
  app.get("/api/bonus-categories", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bonus_categories WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/bonus-categories", auth, adminOnly, async (req, res) => {
    const { id, name, description, sort_order, is_mandatory, drip_days } = req.body;
    await pool.query("INSERT INTO bonus_categories (id,name,description,sort_order,is_mandatory,drip_days) VALUES (?,?,?,?,?,?)",
      [id || null, name, description, sort_order ?? 0, is_mandatory ?? 0, drip_days ?? 0]);
    res.json({ ok: true });
  });
  app.put("/api/bonus-categories/:id", auth, adminOnly, async (req, res) => {
    const { name, description, sort_order, is_mandatory, drip_days, active } = req.body;
    await pool.query("UPDATE bonus_categories SET name=?,description=?,sort_order=?,is_mandatory=?,drip_days=?,active=? WHERE id=?",
      [name, description, sort_order ?? 0, is_mandatory ?? 0, drip_days ?? 0, active ?? 1, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonus-categories/:id/permanent", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM bonus_categories WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonus-categories/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE bonus_categories SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // ── Bonus Items ───────────────────────────────────────────
  app.get("/api/bonus-items/inactive", auth, adminOnly, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bonus_items WHERE active=0 ORDER BY sort_order");
    res.json(r);
  });
  app.get("/api/bonus-items", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bonus_items WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/bonus-items", auth, adminOnly, async (req, res) => {
    const { id, bonus_category_id, title, description, cover_image, content, download_url, sort_order, drip_days } = req.body;
    await pool.query("INSERT INTO bonus_items (id,bonus_category_id,title,description,cover_image,content,download_url,sort_order,drip_days) VALUES (?,?,?,?,?,?,?,?,?)",
      [id || null, bonus_category_id, title, description, cover_image, content, download_url, sort_order ?? 0, drip_days ?? 0]);
    res.json({ ok: true });
  });
  app.put("/api/bonus-items/:id", auth, adminOnly, async (req, res) => {
    const { title, description, cover_image, content, download_url, sort_order, drip_days, active } = req.body;
    await pool.query("UPDATE bonus_items SET title=?,description=?,cover_image=?,content=?,download_url=?,sort_order=?,drip_days=?,active=? WHERE id=?",
      [title, description, cover_image, content, download_url, sort_order ?? 0, drip_days ?? 0, active ?? 1, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonus-items/:id/permanent", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM bonus_items WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/bonus-items/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE bonus_items SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  // LIBRARY
  app.get("/api/images", (_r, res) => {
    try {
      const imgDir = path.join(__dirname, "public", "img");
      if (!fs.existsSync(imgDir)) return res.json([]);
      const files = fs.readdirSync(imgDir);
      const images = files.filter(file => /\.(png|jpe?g|gif|svg|webp)$/i.test(file));
      res.json(images.map(img => `/img/${img}`));
    } catch { res.status(500).json({ error: "Falha ao listar imagens" }); }
  });

  // Upload de e-book para public/e-books
  app.post("/api/upload/ebook", auth, adminOnly, uploadEbook.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
    const url = `/e-books/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  });

  // Listar arquivos em public/e-books
  app.get("/api/ebooks-files", auth, (_r, res) => {
    try {
      if (!fs.existsSync(ebooksDir)) return res.json([]);
      const files = fs.readdirSync(ebooksDir);
      const pdfs = files.filter(f => /\.(pdf|PDF)$/.test(f));
      res.json(pdfs.map(f => ({ name: f, url: `/e-books/${f}` })));
    } catch { res.status(500).json({ error: "Falha ao listar e-books" }); }
  });

  // Deletar arquivo de e-book
  app.delete("/api/ebooks-files/:filename", auth, adminOnly, (req, res) => {
    try {
      const filepath = path.join(ebooksDir, req.params.filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      res.json({ ok: true });
    } catch { res.status(500).json({ error: "Falha ao deletar arquivo" }); }
  });

  app.get("/api/categories/inactive", auth, adminOnly, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM categories WHERE active=0 ORDER BY sort_order");
    res.json(r);
  });

  app.get("/api/categories", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM categories WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/categories", auth, adminOnly, async (req, res) => {
    const { id: rid, name, description, sort_order, is_mandatory, drip_days } = req.body;
    const id = rid || randomUUID();
    await pool.query("INSERT INTO categories (id,name,description,sort_order,is_mandatory,drip_days,active) VALUES (?,?,?,?,?,?,1)",
      [id, name, description, sort_order || 0, is_mandatory || 0, drip_days || 0]);
    res.status(201).json({ id });
  });
  app.put("/api/categories/:id", auth, adminOnly, async (req, res) => {
    const { name, description, sort_order, is_mandatory, drip_days, active } = req.body;
    await pool.query("UPDATE categories SET name=?,description=?,sort_order=?,is_mandatory=?,drip_days=?,active=? WHERE id=?",
      [name, description, sort_order, is_mandatory, drip_days, active, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/categories/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE categories SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  app.get("/api/subcategories", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM subcategories WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/subcategories", auth, adminOnly, async (req, res) => {
    const { id: rid, category_id, name, description, sort_order, drip_days } = req.body;
    const id = rid || randomUUID();
    await pool.query("INSERT INTO subcategories (id,category_id,name,description,sort_order,drip_days,active) VALUES (?,?,?,?,?,?,1)",
      [id, category_id, name, description, sort_order || 0, drip_days || 0]);
    res.status(201).json({ id });
  });
  app.put("/api/subcategories/:id", auth, adminOnly, async (req, res) => {
    const { category_id, name, description, sort_order, drip_days, active } = req.body;
    await pool.query("UPDATE subcategories SET category_id=?,name=?,description=?,sort_order=?,drip_days=?,active=? WHERE id=?",
      [category_id, name, description, sort_order, drip_days, active, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/subcategories/:id", auth, adminOnly, async (req, res) => {
    await pool.query("DELETE FROM subcategories WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });

  app.get("/api/ebooks", auth, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM ebooks WHERE active=1 ORDER BY sort_order");
    res.json(r);
  });
  app.post("/api/ebooks", auth, adminOnly, async (req, res) => {
    const { id: rid, category_id, subcategory_id, title, description, cover_image, content, download_url, sort_order, drip_days } = req.body;
    const id = rid || randomUUID();
    await pool.query("INSERT INTO ebooks (id,category_id,subcategory_id,title,description,cover_image,content,download_url,sort_order,drip_days,active) VALUES (?,?,?,?,?,?,?,?,?,?,1)",
      [id, category_id, subcategory_id || null, title, description, cover_image, content, download_url, sort_order || 0, drip_days || 0]);
    res.status(201).json({ id });
  });
  app.get("/api/ebooks/inactive", auth, adminOnly, async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM ebooks WHERE active=0 ORDER BY sort_order");
    res.json(r);
  });

  app.put("/api/ebooks/:id", auth, adminOnly, async (req, res) => {
    const { title, description, cover_image, content, download_url, sort_order, drip_days, active } = req.body;
    await pool.query("UPDATE ebooks SET title=?,description=?,cover_image=?,content=?,download_url=?,sort_order=?,drip_days=?,active=? WHERE id=?",
      [title, description, cover_image, content, download_url, sort_order, drip_days, active, req.params.id]);
    res.json({ ok: true });
  });
  app.delete("/api/ebooks/:id", auth, adminOnly, async (req, res) => {
    await pool.query("UPDATE ebooks SET active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  });


  // BOTS & TIMELINES
  app.get("/api/bots", async (_r, res) => {
    const [r]: any = await pool.query("SELECT * FROM bots ORDER BY name");
    res.json(r);
  });
  app.post("/api/bots", auth, adminOnly, async (req, res) => {
    const { name, avatar, persona, region, is_active, role, is_online } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO bots (id,name,avatar,persona,region,is_active,role,is_online) VALUES (?,?,?,?,?,?,?,?)",
      [id, name, avatar, persona, region, is_active ?? 1, role, is_online ?? 0]);
    res.status(201).json({ id });
  });
  app.get("/api/timelines", async (_r, res) => {
    const [timelines]: any = await pool.query("SELECT * FROM timelines");
    const [blocks]: any = await pool.query("SELECT * FROM timeline_blocks ORDER BY sort_order");
    res.json(timelines.map((t: any) => ({
      ...t,
      blocks: blocks.filter((b: any) => b.timeline_id === t.id)
    })));
  });
  app.post("/api/timelines", auth, adminOnly, async (req, res) => {
    const { name, bot_id, is_active, page_route, trigger_type, blocks } = req.body;
    const id = randomUUID();
    await pool.query("INSERT INTO timelines (id,name,bot_id,is_active,page_route,trigger_type) VALUES (?,?,?,?,?,?)",
      [id, name, bot_id, is_active ?? 0, page_route, trigger_type || "manual"]);
    if (Array.isArray(blocks)) {
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        await pool.query("INSERT INTO timeline_blocks (id,timeline_id,bot_id,category,script,delay_ms,typing_time_ms,condition_type,sort_order) VALUES (?,?,?,?,?,?,?,?,?)",
          [randomUUID(), id, b.botId || b.bot_id, b.category, b.script, b.delayMs || 1000, b.typingTimeMs || 2000, b.conditionType || "time", i]);
      }
    }
    res.status(201).json({ id });
  });
  app.patch("/api/timelines/:id/toggle", auth, adminOnly, async (req, res) => {
    const [r]: any = await pool.query("SELECT is_active FROM timelines WHERE id=?", [req.params.id]);
    const cur = r[0]?.is_active;
    await pool.query("UPDATE timelines SET is_active=? WHERE id=?", [cur ? 0 : 1, req.params.id]);
    res.json({ is_active: !cur });
  });

  // STRIPE
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const pi = await stripe.paymentIntents.create({
        amount: Math.round(req.body.amount * 100),
        currency: req.body.currency || "brl",
        automatic_payment_methods: { enabled: true },
      });
      res.json({ clientSecret: pi.client_secret });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // SOCIAL MEMBERS
  app.get("/api/social-members", (_r, res) => {
    try {
      const dir = path.join(__dirname, "socialmembers");
      res.json({
        abbreviations: fs.readFileSync(path.join(dir, "500 abreviações.txt"), "utf-8").split("\n").filter(Boolean),
        names: fs.readFileSync(path.join(dir, "500 nomes próprios.txt"), "utf-8").split("\n").filter(Boolean),
        surnames: fs.readFileSync(path.join(dir, "500 sobrenomes.txt"), "utf-8").split("\n").filter(Boolean),
      });
    } catch { res.status(500).json({ error: "Falha" }); }
  });

  // TRACK CLICK
  app.post("/api/track-click", async (req, res) => {
    await pool.query("INSERT INTO affiliate_clicks (id,affiliate_id,ip,user_agent,landing_page) VALUES (?,?,?,?,?)",
      [randomUUID(), req.body.affiliateId, req.ip, req.headers["user-agent"], req.body.landingPage]);
    res.json({ ok: true });
  });

  // VITE / static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_r, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`[Server] http://localhost:${PORT}`));
}

startServer();
