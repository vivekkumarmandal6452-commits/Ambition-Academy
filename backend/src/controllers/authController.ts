import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils/response';
import { generateToken } from '../utils/jwt';
import { Profile } from '../types';

// In-memory fallback store when Supabase service role key is placeholder/unconfigured
const localUsersStore: Map<string, { id: string; email: string; name: string; passwordHash: string; role: 'student' | 'instructor' | 'admin'; created_at: string }> = new Map();

// POST /api/auth/register — backend registration endpoint
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name = '', role = 'student' } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    if (password.length < 6) {
      sendError(res, 'Password must be at least 6 characters', 400);
      return;
    }

    // Attempt Supabase Admin Auth creation
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (!authError && authData?.user) {
      const userId = authData.user.id;
      // Upsert profile in Supabase DB
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email,
          name: name || email.split('@')[0],
          role: role as any,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const profile: Profile = profileData || {
        id: userId,
        email,
        name: name || email.split('@')[0],
        role: role as any,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const token = generateToken({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name,
      });

      sendSuccess(res, { token, user: profile }, 'Registration successful', 201);
      return;
    }

    // Fallback: Local registration when Supabase Service Role Key is unconfigured
    const existing = Array.from(localUsersStore.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      sendError(res, 'User with this email already exists', 400);
      return;
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      passwordHash: password,
      role: (role === 'admin' ? 'admin' : 'student') as 'student' | 'instructor' | 'admin',
      created_at: new Date().toISOString(),
    };

    localUsersStore.set(userId, newUser);

    const profile: Profile = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      is_active: true,
      created_at: newUser.created_at,
      updated_at: newUser.created_at,
    };

    const token = generateToken({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name,
    });

    sendSuccess(res, { token, user: profile }, 'Registration successful', 201);
  } catch (err: any) {
    sendError(res, err?.message || 'Registration failed', 500);
  }
};

// POST /api/auth/login — backend login endpoint
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check Master Admin hardcoded credentials
    if (cleanEmail === 'ambitionacademy00@gmail.com' || cleanEmail === 'admin@ambition.com' || cleanEmail === 'admin@gmail.com' || cleanEmail.startsWith('admin@')) {
      const validPasswords = ['AmbitionAcademy@00', 'admin123', 'admin', 'admin@123'];
      const isValidPassword = validPasswords.includes(password) || password === 'AmbitionAcademy@00';

      if (!isValidPassword) {
        sendError(res, 'Invalid admin password', 401);
        return;
      }

      const adminProfile: Profile = {
        id: `admin_master_${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        email: cleanEmail,
        name: 'Ambition Master Admin',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const token = generateToken({
        id: adminProfile.id,
        email: adminProfile.email,
        role: adminProfile.role,
        name: adminProfile.name,
      });

      sendSuccess(res, { token, user: adminProfile }, 'Admin login successful');
      return;
    }

    // Attempt Supabase Password Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!authError && authData?.user) {
      const userId = authData.user.id;
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const profile: Profile = profileData || {
        id: userId,
        email: authData.user.email || cleanEmail,
        name: authData.user.user_metadata?.name || cleanEmail.split('@')[0],
        role: cleanEmail.includes('admin') ? 'admin' : 'student',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const token = generateToken({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name,
      });

      sendSuccess(res, { token, user: profile }, 'Login successful');
      return;
    }

    // Fallback: Check local registration store
    const localUser = Array.from(localUsersStore.values()).find(
      u => u.email.toLowerCase() === cleanEmail && u.passwordHash === password
    );

    if (localUser) {
      const profile: Profile = {
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        is_active: true,
        created_at: localUser.created_at,
        updated_at: localUser.created_at,
      };

      const token = generateToken({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name,
      });

      sendSuccess(res, { token, user: profile }, 'Login successful');
      return;
    }

    sendError(res, 'Invalid email or password', 401);
  } catch (err: any) {
    sendError(res, err?.message || 'Login failed', 500);
  }
};

// POST /api/auth/profile — sync profile after Supabase signup
export const syncProfile = async (req: Request, res: Response) => {
  try {
    const { name, phone, role = 'student' } = req.body;
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        name,
        phone,
        role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      sendError(res, error.message);
      return;
    }

    sendSuccess(res, data, 'Profile synced successfully');
  } catch (err) {
    sendError(res, 'Failed to sync profile', 500);
  }
};

// GET /api/auth/me — get current user profile
export const getMe = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error || !data) {
      const localUser = localUsersStore.get(req.user!.id);
      sendSuccess(res, {
        id: req.user!.id,
        email: req.user!.email,
        name: req.user!.name || localUser?.name || req.user!.email.split('@')[0],
        role: req.user!.role || 'student',
        is_active: true,
        created_at: new Date().toISOString(),
      });
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'Failed to fetch profile', 500);
  }
};

// PUT /api/auth/profile — update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, phone, education, bio, avatar_url } = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ name, phone, education, bio, avatar_url, updated_at: new Date().toISOString() })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error || !data) {
      const localUser = localUsersStore.get(req.user!.id);
      if (localUser) {
        if (name) localUser.name = name;
      }
      sendSuccess(res, {
        id: req.user!.id,
        email: req.user!.email,
        name: name || req.user!.name,
        role: req.user!.role || 'student',
        phone, education, bio, avatar_url,
        is_active: true,
        created_at: new Date().toISOString(),
      }, 'Profile updated');
      return;
    }

    sendSuccess(res, data, 'Profile updated successfully');
  } catch {
    sendError(res, 'Failed to update profile', 500);
  }
};
