export type DecodedToken = {
  uid: string;
  role?: string;
  org?: string;
  [key: string]: unknown;
};

// Placeholder: verify Firebase ID token via Admin SDK.
export async function verifyFirebaseToken(
  _authHeader?: string
): Promise<DecodedToken> {
  throw new Error('verifyFirebaseToken not implemented');
}
