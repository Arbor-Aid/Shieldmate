import 'package:flutter_test/flutter_test.dart';

import 'package:arbor_aid_app/core/utils/user_profile.dart';
import 'package:arbor_aid_app/core/utils/user_profile_service.dart';

void main() {
  test('global super_admin resolves to admin', () {
    expect(
      resolveAppRoleFromClaims({
        'roles': ['super_admin'],
      }),
      AppRole.admin,
    );
  });

  test('requested token org resolves its scoped role', () {
    expect(
      resolveAppRoleFromClaims({
        'orgId': 'org-b',
        'orgRoles': {
          'org-a': ['client'],
          'org-b': ['org_admin'],
        },
      }),
      AppRole.partner,
    );
  });

  test('ambiguous org context fails closed', () {
    expect(
      resolveAppRoleFromClaims({
        'orgRoles': {
          'org-a': ['org_admin'],
          'org-b': ['client'],
        },
      }),
      AppRole.client,
    );
  });

  test('super_admin inside orgRoles is not global authority', () {
    expect(
      resolveAppRoleFromClaims({
        'orgRoles': {
          'org-a': ['super_admin'],
        },
      }),
      AppRole.client,
    );
  });

  test('missing token claims fail closed to client', () {
    expect(resolveAppRoleFromClaims(null), AppRole.client);
  });
}
