import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-goon-key';

export class AuthManager {
  public async register(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          cashBalance: 1000.0, // Starting balance
        }
      });
      const token = this.generateToken(user.id);
      return { user, token };
    } catch (e) {
      return { error: 'Username already exists' };
    }
  }

  public async login(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) return { error: 'Invalid username or password' };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { error: 'Invalid username or password' };

    const token = this.generateToken(user.id);
    return { user, token };
  }

  private generateToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  public verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (e) {
      return null;
    }
  }
}
