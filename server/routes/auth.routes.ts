import { Router, Request, Response } from 'express';
import { db } from '../db/connection';

export const authRouter = Router();

// GET /api/auth/users
authRouter.get('/users', (req: Request, res: Response) => {
  try {
    const users = db.prepare('SELECT id, email, name, role, avatar_url as avatarUrl, organization, created_at as createdAt FROM users').all();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, role, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user: any;
    if (role) {
      user = db.prepare(`
        SELECT id, email, name, role, avatar_url as avatarUrl, organization, created_at as createdAt 
        FROM users WHERE email = ? AND role = ?
      `).get(email, role);
    } else {
      user = db.prepare(`
        SELECT id, email, name, role, avatar_url as avatarUrl, organization, created_at as createdAt 
        FROM users WHERE email = ?
      `).get(email);
    }

    if (!user) {
      // If persona was requested by demo or email, look up by role or create demo user
      if (role) {
        user = db.prepare(`
          SELECT id, email, name, role, avatar_url as avatarUrl, organization, created_at as createdAt 
          FROM users WHERE role = ? LIMIT 1
        `).get(role);
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials or user not found' });
    }

    res.json({
      success: true,
      user,
      token: `token_${user.id}_${Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup
authRouter.post('/signup', (req: Request, res: Response) => {
  try {
    const { name, email, role = 'customer', organization = 'Acme Technologies Inc.', password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const userId = `usr_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();
    const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;

    db.prepare(`
      INSERT INTO users (id, email, name, role, avatar_url, organization, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, email, name, role, avatarUrl, organization, password || 'P@ssword123!', createdAt);

    const newUser = {
      id: userId,
      email,
      name,
      role,
      avatarUrl,
      organization,
      createdAt,
    };

    res.status(201).json({
      success: true,
      user: newUser,
      token: `token_${userId}_${Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/switch-role
authRouter.post('/switch-role', (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'staff', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Valid role (admin, staff, customer) is required' });
    }

    const user = db.prepare(`
      SELECT id, email, name, role, avatar_url as avatarUrl, organization, created_at as createdAt 
      FROM users WHERE role = ? LIMIT 1
    `).get(role);

    if (!user) {
      return res.status(404).json({ error: `No persona found for role ${role}` });
    }

    res.json({
      success: true,
      user,
      token: `token_${(user as any).id}_${Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const token = `rst_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const id = `req_${Date.now()}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    db.prepare(`
      INSERT INTO password_resets (id, email, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email, token, expiresAt, createdAt);

    res.json({
      success: true,
      message: `Password recovery token issued for ${email}`,
      previewToken: token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/reset-requests
authRouter.get('/reset-requests', (req: Request, res: Response) => {
  try {
    const requests = db.prepare(`
      SELECT id, email, token as previewToken, expires_at as expiresAt, created_at as timestamp 
      FROM password_resets ORDER BY created_at DESC LIMIT 20
    `).all();
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
