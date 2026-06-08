import db from '../db/database';

// Şifre hash fonksiyonu (basit - production'da bcrypt kullanın)
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Kullanıcı oluştur
export const createUser = async (username, password, email, fullName, role = 'admin') => {
  username = (username || '').trim();
  if (!username) throw new Error('Kullanıcı adı gerekli');
  if (!password || password.length < 4) throw new Error('Şifre en az 4 karakter olmalı');

  const existingUser = await db.users.where('username').equals(username).first();
  if (existingUser) {
    throw new Error('Bu kullanıcı adı zaten kullanılıyor');
  }

  const hashedPassword = await hashPassword(password);

  const userId = await db.users.add({
    username,
    password: hashedPassword,
    email: email || '',
    fullName: fullName || username,
    role,
    createdAt: new Date().toISOString(),
    lastLogin: null
  });

  return userId;
};

// Kullanıcıları listele (şifre hariç)
export const listUsers = async () => {
  const users = await db.users.toArray();
  return users.map(({ password, ...rest }) => rest);
};

// Kullanıcı sil (son admin silinemez)
export const deleteUser = async (id) => {
  const users = await db.users.toArray();
  const target = users.find(u => u.id === id);
  if (!target) return;
  const adminCount = users.filter(u => u.role === 'admin').length;
  if (target.role === 'admin' && adminCount <= 1) {
    throw new Error('Son yönetici hesabı silinemez');
  }
  await db.users.delete(id);
};

// Şifre değiştir
export const updatePassword = async (id, newPassword) => {
  if (!newPassword || newPassword.length < 4) throw new Error('Şifre en az 4 karakter olmalı');
  const hashedPassword = await hashPassword(newPassword);
  await db.users.update(id, { password: hashedPassword });
};

// Giriş yap
export const login = async (username, password) => {
  const user = await db.users.where('username').equals(username).first();
  
  if (!user) {
    throw new Error('Kullanıcı adı veya şifre hatalı');
  }

  const hashedPassword = await hashPassword(password);
  
  if (user.password !== hashedPassword) {
    throw new Error('Kullanıcı adı veya şifre hatalı');
  }

  // Son giriş zamanını güncelle
  await db.users.update(user.id, {
    lastLogin: new Date().toISOString()
  });

  // Kullanıcı bilgilerini localStorage'a kaydet
  const userSession = {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role
  };
  
  localStorage.setItem('user', JSON.stringify(userSession));
  
  return userSession;
};

// Çıkış yap
export const logout = () => {
  localStorage.removeItem('user');
};

// Oturum kontrolü
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Oturum var mı?
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// İlk kullanıcı var mı kontrol et
export const hasUsers = async () => {
  const count = await db.users.count();
  return count > 0;
};

// Varsayılan admin kullanıcısı oluştur
export const createDefaultAdmin = async () => {
  const hasUser = await hasUsers();
  if (!hasUser) {
    await createUser('admin', 'admin123', 'admin@optikpro.com', 'Yönetici');
    return true;
  }
  return false;
};
