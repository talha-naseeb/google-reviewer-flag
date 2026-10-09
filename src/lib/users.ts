import bcrypt from 'bcryptjs';
import { Collection } from 'mongodb';
import { getDb } from './mongodb';
import { sendNewUserInvitationEmail } from './email';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
  resetCode?: string;
  resetExpires?: string;
}

export type SafeUser = Omit<User, 'passwordHash' | 'resetCode'>;

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
  const defaultUsers = [
    {
      email: 'admin@googlereviewer.com',
      password: 'googlereviewer!123!!admin',
      name: 'Admin Google Reviewer',
      role: 'admin' as const
    },
    {
      email: 'jafarkhanaj@gmail.com',
      password: 'googlereviewer!123!!admin',
      name: 'Jafar Khan',
      role: 'admin' as const
    },
    {
      email: 'laddanjafri842@gmail.com',
      password: 'googlereviewer!123!!admin',
      name: 'Laddan Jafri',
      role: 'admin' as const
    },
    {
      email: 'talhanaseeb27@gmail.com',
      password: 'GoogleMod#2026!',
      name: 'Talha Naseeb',
      role: 'admin' as const
    }
  ];

  for (const def of defaultUsers) {
    const existing = await col.findOne({ email: def.email.toLowerCase() });
    if (!existing) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(def.password, salt);

      const newUser: User = {
        id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        email: def.email.toLowerCase(),
        passwordHash,
        name: def.name,
        role: def.role,
        createdAt: new Date().toISOString()
      };

      await col.insertOne(newUser);
    }
  }

  const primary = await col.findOne({ email: 'admin@googlereviewer.com' });
  if (primary) {
    const { passwordHash, resetCode, ...safe } = primary;
    return safe;
  }

  return {
    id: 'usr-default',
    email: 'admin@googlereviewer.com',
    name: 'Admin Google Reviewer',
    role: 'admin',
    createdAt: new Date().toISOString()
  };
}

export async function createUser({
  email,
  password,
  name,
  role = 'admin'
}: {
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'user';
}): Promise<SafeUser> {
  const col = await usersCollection();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await col.findOne({ email: normalizedEmail });
  if (existing) {
    const { passwordHash, resetCode, ...safe } = existing;
    return safe;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    email: normalizedEmail,
    passwordHash,
    name: name || normalizedEmail.split('@')[0],
    role,
    createdAt: new Date().toISOString()
  };

  await col.insertOne(newUser);
  const { passwordHash: _, resetCode: __, ...safe } = newUser;
  return safe;
}

export async function authenticateUser(email: string, password: string): Promise<SafeUser | null> {
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

  const { passwordHash, resetCode, ...safe } = user;
  return safe;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await ensureDefaultAdminUser();
  const col = await usersCollection();
  return col.findOne({ email: email.trim().toLowerCase() });
}

export async function createPasswordResetCode(
  email: string
): Promise<{ resetCode: string; expiresAt: string; user: SafeUser } | null> {
  await ensureDefaultAdminUser();
  const col = await usersCollection();
  const normalizedEmail = email.trim().toLowerCase();

  const user = await col.findOne({ email: normalizedEmail });
  if (!user) {
    return null;
  }

  // Generate a secure 6-digit verification code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  await col.updateOne(
    { email: normalizedEmail },
    {
      $set: {
        resetCode,
        resetExpires: expiresAt,
        updatedAt: new Date().toISOString()
      }
    }
  );

  const { passwordHash, resetCode: _, ...safe } = user;
  return { resetCode, expiresAt, user: safe };
}

export async function resetPasswordWithCode(
  email: string,
  resetCode: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  await ensureDefaultAdminUser();
  const col = await usersCollection();
  const normalizedEmail = email.trim().toLowerCase();

  const user = await col.findOne({ email: normalizedEmail });
  if (!user) {
    return { success: false, error: 'No user account found with that email address.' };
  }

  if (!user.resetCode || !user.resetExpires) {
    return { success: false, error: 'No active reset request found. Please request a new code.' };
  }

  if (new Date() > new Date(user.resetExpires)) {
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (user.resetCode.trim() !== resetCode.trim()) {
    return { success: false, error: 'Invalid verification code. Please check and try again.' };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword.trim(), salt);

  await col.updateOne(
    { email: normalizedEmail },
    {
      $set: {
        passwordHash,
        updatedAt: new Date().toISOString()
      },
      $unset: {
        resetCode: '',
        resetExpires: ''
      }
    }
  );

  return { success: true };
}

export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  await ensureDefaultAdminUser();
  const col = await usersCollection();
  const normalizedEmail = email.trim().toLowerCase();

  const user = await col.findOne({ email: normalizedEmail });
  if (!user) {
    return { success: false, error: 'User account not found.' };
  }

  const isCurrentValid = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return { success: false, error: 'Current password does not match.' };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  if (currentPassword === newPassword.trim()) {
    return { success: false, error: 'New password cannot be identical to current password.' };
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword.trim(), salt);

  await col.updateOne(
    { email: normalizedEmail },
    {
      $set: {
        passwordHash,
        updatedAt: new Date().toISOString()
      }
    }
  );

  return { success: true };
}

export async function provisionUserWithTempPassword({
  email,
  name,
  role = 'admin',
  tempPassword
}: {
  email: string;
  name?: string;
  role?: 'admin' | 'user';
  tempPassword?: string;
}) {
  await ensureDefaultAdminUser();
  const col = await usersCollection();
  const normalizedEmail = email.trim().toLowerCase();
  const actualTempPassword = tempPassword || `GoogleMod#${Math.floor(1000 + Math.random() * 9000)}!`;
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(actualTempPassword, salt);

  const existing = await col.findOne({ email: normalizedEmail });
  if (existing) {
    await col.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          passwordHash,
          updatedAt: new Date().toISOString()
        }
      }
    );
  } else {
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: normalizedEmail,
      passwordHash,
      name: name || normalizedEmail.split('@')[0],
      role,
      createdAt: new Date().toISOString()
    };
    await col.insertOne(newUser);
  }

  // Attempt sending invitation email via Gmail SMTP
  const emailResult = await sendNewUserInvitationEmail({
    to: normalizedEmail,
    tempPassword: actualTempPassword,
    name: name || normalizedEmail.split('@')[0]
  });

  return {
    email: normalizedEmail,
    tempPassword: actualTempPassword,
    emailResult
  };
}
