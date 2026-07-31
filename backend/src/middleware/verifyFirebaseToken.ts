import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebase/firebase-admin';
import { prisma } from '../server';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyFirebaseToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("Incoming Request:", req.method, req.originalUrl);
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader ? "Present" : "Missing");
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1] ?? '';
    if (!idToken) {
      res.status(401).json({ error: 'Unauthorized: Empty token' });
      return;
    }
    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log("Token Verified. Decoded UID:", decodedToken.uid);
    const { uid, email, name, picture, firebase: { sign_in_provider } } = decodedToken;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find or create user in PostgreSQL
    let user = await prisma.user.findUnique({
      where: { firebase_uid: uid },
    });

    if (user) {
      // Update profile if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          photo_url: picture || user.photo_url,
          email_verified: decodedToken.email_verified || user.email_verified,
        },
      });
    } else {
      // Create user
      user = await prisma.user.create({
        data: {
          firebase_uid: uid,
          email: email,
          name: name || null,
          photo_url: picture || null,
          provider: sign_in_provider || 'email',
          email_verified: decodedToken.email_verified || false,
        },
      });
    }

    // Attach user to request
    req.user = user;
    console.log("User Found/Created:", user.id);
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }
};
