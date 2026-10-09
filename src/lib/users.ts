import bcrypt from 'bcryptjs';
import { Collection } from 'mongodb';
import { getDb } from './mongodb';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

let usersInit = false;

async function usersCollection(): Promise<Collection<User>> {
  const database = await getDb();
  const col = database.collection<User>('users');
  if (!usersInit) {
    await col.createIndex({ email: 1 }, { unique: true });
    usersInit = true;
  }
  return col;
}

export async function ensureDefaultAdminUser(): Promise<SafeUser> {
  const col = await usersCollection();
  const targetEmail = 'admin@googlereviewer.com';
  const plainPassword = 'googlereviewer!123!!admin';

  const existing = await col.findOne({ email: targetEmail.toLowerCase() });
  if (existing) {
    const { passwordHash, ...safe } = existing;
    return safe;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(plainPassword, salt);

  const newUser: User = {
    id: `usr-${Date.now()}`,
    email: targetEmail.toLowerCase(),
    passwordHash,
    name: 'Admin Google Reviewer',
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  await col.insertOne(newUser);
  const { passwordHash: _, ...safe } = newUser;
  return safe;
}

export async function authenticateUser(email: string, password: string): Promise<SafeUser | null> {
  // Ensure default admin user is seeded
  await ensureDefaultAdminUser();

  const col = await usersCollection();
  const user = await col.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return null;
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const { passwordHash, ...safe } = user;
  return safe;
}
