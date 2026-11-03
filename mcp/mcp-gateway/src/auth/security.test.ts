import assert from 'node:assert/strict';
import test from 'node:test';

import { authorizeClaimsForOrg } from './requireRole';
import { verifyFirebaseToken } from './verifyFirebaseToken';

const ALLOWED_ROLES = ['org_admin', 'staff', 'case_worker'];

test('rejects the development token without invoking Firebase verification', async () => {
  let verifierCalled = false;

  await assert.rejects(
    verifyFirebaseToken('Bearer dev-token', async () => {
      verifierCalled = true;
      return { uid: 'unexpected' };
    }),
    /Development tokens are not accepted/
  );
  assert.equal(verifierCalled, false);
});

test('keeps canonical global roles separate from organization role maps', async () => {
  const claims = await verifyFirebaseToken('Bearer valid-firebase-token', async () => ({
    uid: 'user-1',
    roles: ['staff'],
    orgId: 'org-a',
    orgRoles: { 'org-b': ['org_admin'] },
  }));

  assert.deepEqual(claims.roles, ['staff']);
  assert.deepEqual(claims.orgRoles, { 'org-b': ['org_admin'] });
});

test('does not authorize an organization with roles from another organization', () => {
  assert.throws(
    () => authorizeClaimsForOrg(
      {
        uid: 'user-1',
        roles: ['staff'],
        orgId: 'org-a',
        orgRoles: { 'org-b': ['org_admin'] },
      },
      ['org_admin'],
      'org-a'
    ),
    /Insufficient role for organization/
  );
});

test('authorizes a valid role only inside its organization context', () => {
  const mappedAuthorization = authorizeClaimsForOrg(
    {
      uid: 'user-2',
      orgRoles: { 'org-a': ['staff'], 'org-b': ['case_worker'] },
    },
    ['staff'],
    'org-a'
  );

  assert.equal(mappedAuthorization.org, 'org-a');
  assert.equal(mappedAuthorization.claims.uid, 'user-2');

  const primaryAuthorization = authorizeClaimsForOrg(
    { uid: 'user-3', orgId: 'org-a', roles: ['staff'] },
    ['staff'],
    'org-a'
  );
  assert.equal(primaryAuthorization.org, 'org-a');
});

test('rejects missing, ambiguous, and mismatched organization context', () => {
  assert.throws(
    () => authorizeClaimsForOrg({ uid: 'missing-org', roles: ['staff'] }, ALLOWED_ROLES),
    /Missing org claim/
  );
  assert.throws(
    () => authorizeClaimsForOrg(
      { uid: 'ambiguous-org', orgRoles: { 'org-a': ['staff'], 'org-b': ['staff'] } },
      ALLOWED_ROLES
    ),
    /Organization context is required/
  );
  assert.throws(
    () => authorizeClaimsForOrg(
      { uid: 'wrong-org', orgId: 'org-a', roles: ['staff'] },
      ALLOWED_ROLES,
      'org-b'
    ),
    /Org mismatch/
  );
});

test('allows an explicit canonical global super_admin for a requested organization', () => {
  const authorization = authorizeClaimsForOrg(
    { uid: 'global-admin', roles: ['super_admin'] },
    ALLOWED_ROLES,
    'org-any'
  );

  assert.equal(authorization.org, 'org-any');
});

test('rejects malformed or unauthorized role claims', () => {
  assert.throws(
    () => authorizeClaimsForOrg(
      { uid: 'malformed', orgId: 'org-a', roles: 'staff' as unknown as string[] },
      ALLOWED_ROLES,
      'org-a'
    ),
    /Missing role claim for organization/
  );
  assert.throws(
    () => authorizeClaimsForOrg(
      { uid: 'unauthorized', orgId: 'org-a', roles: ['client'] },
      ALLOWED_ROLES,
      'org-a'
    ),
    /Insufficient role for organization/
  );
});
