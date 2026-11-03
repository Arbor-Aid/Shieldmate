import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import 'user_profile.dart';

Iterable<String> _stringRoles(dynamic value) sync* {
  if (value is! List) return;

  for (final role in value.whereType<String>()) {
    final normalized = role.trim().toLowerCase();
    if (normalized.isNotEmpty) yield normalized;
  }
}

AppRole _highestRole(Iterable<String> roles) {
  final normalized = roles.map((role) => role.trim().toLowerCase()).toSet();

  if (normalized.contains('super_admin') || normalized.contains('admin')) {
    return AppRole.admin;
  }

  if (normalized.any(
    {
      'org_admin',
      'staff',
      'case_worker',
      'organization',
      'partner',
    }.contains,
  )) {
    return AppRole.partner;
  }

  return AppRole.client;
}

AppRole resolveAppRoleFromClaims(Map<String, dynamic>? claims) {
  if (claims == null) return AppRole.client;

  final canonicalRoles = _stringRoles(claims['roles']).toList();
  if (canonicalRoles.contains('super_admin')) {
    return AppRole.admin;
  }

  final activeOrgId =
      (claims['orgId'] is String && (claims['orgId'] as String).isNotEmpty)
          ? claims['orgId'] as String
          : (claims['org'] is String && (claims['org'] as String).isNotEmpty)
              ? claims['org'] as String
              : null;

  final scopedRoles = <String>[];
  if (activeOrgId != null) {
    scopedRoles.addAll(
      canonicalRoles.where((role) => role != 'super_admin'),
    );
  }

  final rawOrgRoles = claims['orgRoles'];
  if (rawOrgRoles is Map) {
    if (activeOrgId != null) {
      scopedRoles.addAll(
        _stringRoles(rawOrgRoles[activeOrgId])
            .where((role) => role != 'super_admin'),
      );
    } else {
      final memberships = <List<String>>[];

      for (final entry in rawOrgRoles.entries) {
        if (entry.key is! String || (entry.key as String).isEmpty) continue;

        final roles = _stringRoles(entry.value)
            .where((role) => role != 'super_admin')
            .toList();

        if (roles.isNotEmpty) memberships.add(roles);
      }

      if (memberships.length != 1) {
        return AppRole.client;
      }

      scopedRoles.addAll(memberships.single);
    }
  }

  if (activeOrgId != null && claims['role'] is String) {
    final legacyRole = (claims['role'] as String).trim().toLowerCase();

    if (legacyRole.isNotEmpty && legacyRole != 'super_admin') {
      scopedRoles.add(legacyRole);
    }
  }

  return _highestRole(scopedRoles);
}

class UserProfileService {
  UserProfileService({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  Future<UserProfile?> fetchProfile(String uid) async {
    final doc = await _firestore.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return UserProfile.fromDocument(doc);
  }

  Future<UserProfile> ensureProfile({
    AppRole defaultRole = AppRole.client,
  }) async {
    final user = _auth.currentUser;
    if (user == null) {
      throw StateError('No authenticated user.');
    }

    final ref = _firestore.collection('users').doc(user.uid);
    final snapshot = await ref.get();
    if (snapshot.exists) {
      final profile = UserProfile.fromDocument(snapshot);
      if (profile != null) return profile;
    }

    final roleValue = AppRoleMapper.toStringValue(defaultRole);
    await ref.set({
      'uid': user.uid,
      'email': user.email,
      'displayName': user.displayName,
      'role': roleValue,
      'createdAt': FieldValue.serverTimestamp(),
      'lastLogin': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));

    final updated = await ref.get();
    return UserProfile.fromDocument(updated) ??
        UserProfile(
          uid: user.uid,
          role: defaultRole,
          rawRole: roleValue,
          displayName: user.displayName,
          email: user.email,
        );
  }

  Future<void> updateProfile({
    String? displayName,
    String? email,
    String? orgId,
  }) async {
    final user = _auth.currentUser;
    if (user == null) {
      throw StateError('No authenticated user.');
    }

    final ref = _firestore.collection('users').doc(user.uid);
    final updates = <String, dynamic>{
      if (displayName != null) 'displayName': displayName,
      if (email != null) 'email': email,
      if (orgId != null) 'orgId': orgId,
      'updatedAt': FieldValue.serverTimestamp(),
    };

    await ref.set(updates, SetOptions(merge: true));

    if (displayName != null && displayName.isNotEmpty) {
      await user.updateDisplayName(displayName);
    }
  }

  Future<AppRole> resolveRole(User user) async {
    try {
      final token = await user.getIdTokenResult();
      return resolveAppRoleFromClaims(token.claims);
    } on Exception {
      return AppRole.client;
    }
  }
}
