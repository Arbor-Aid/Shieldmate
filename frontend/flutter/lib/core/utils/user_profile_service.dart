import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import 'user_profile.dart';

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

  Future<UserProfile> ensureProfile({AppRole defaultRole = AppRole.client}) async {
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

  Future<AppRole> resolveRole(User user, {UserProfile? profile}) async {
    try {
      final token = await user.getIdTokenResult();
      final claims = token.claims;
      String? claimRole;
      if (claims != null) {
        final rolesClaim = claims['roles'];
        if (rolesClaim is List) {
          final firstRole = rolesClaim.whereType<String>().cast<String?>().firstWhere(
                (value) => value != null && value.isNotEmpty,
                orElse: () => null,
              );
          claimRole = firstRole;
        }
        if ((claimRole == null || claimRole.isEmpty) && claims['orgRoles'] is Map) {
          final orgRoles = claims['orgRoles'] as Map<dynamic, dynamic>;
          for (final value in orgRoles.values) {
            if (value is List) {
              final firstRole = value.whereType<String>().cast<String?>().firstWhere(
                    (role) => role != null && role.isNotEmpty,
                    orElse: () => null,
                  );
              if (firstRole != null && firstRole.isNotEmpty) {
                claimRole = firstRole;
                break;
              }
            }
          }
        }
        claimRole ??= claims['role'] as String?;
      }
      if (claimRole != null && claimRole.isNotEmpty) {
        return AppRoleMapper.fromString(claimRole);
      }
    } on Exception {
      // Ignore token errors; fall back to profile role.
    }

    if (profile != null) {
      return profile.role;
    }
    return AppRole.client;
  }
}
