import admin from 'firebase-admin';

export type VerifiedTokenClaims = {
  uid: string;
  role?: string;
  org?: string;
  email?: string;
};

let appInitialized = false;

function initAdmin() {
  if (appInitialized) return;
  admin.initializeApp();
  appInitialized = true;
}

export async function verifyFirebaseToken(authHeader?: string): Promise<VerifiedTokenClaims> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization header');
  }
  initAdmin();
  const token = authHeader.slice('Bearer '.length);
  const decoded = await admin.auth().verifyIdToken(token, true);
  return {
    uid: decoded.uid,
    role: (decoded as { role?: string }).role,
    org: (decoded as { org?: string }).org,
    email: decoded.email,
  };
}
