import 'package:cloud_firestore/cloud_firestore.dart';

enum AppRole { client, partner, admin }

class UserProfile {
  const UserProfile({
    required this.uid,
    required this.role,
    required this.rawRole,
    this.displayName,
    this.email,
    this.orgId,
  });

  final String uid;
  final AppRole role;
  final String rawRole;
  final String? displayName;
  final String? email;
  final String? orgId;

  static UserProfile? fromDocument(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data();
    if (data == null) return null;
    final rawRole = (data['role'] as String?)?.trim().toLowerCase() ?? 'client';
    return UserProfile(
      uid: doc.id,
      role: AppRoleMapper.fromString(rawRole),
      rawRole: rawRole,
      displayName: data['displayName'] as String?,
      email: data['email'] as String?,
      orgId: data['orgId'] as String?,
    );
  }
}

class AppRoleMapper {
  static AppRole fromString(String? value) {
    switch ((value ?? '').trim()) {
      case 'super_admin':
      case 'admin':
        return AppRole.admin;
      case 'org_admin':
      case 'staff':
      case 'case_worker':
      case 'organization':
      case 'partner':
        return AppRole.partner;
      case 'client':
      default:
        return AppRole.client;
    }
  }

  static String toStringValue(AppRole role) {
    switch (role) {
      case AppRole.admin:
        return 'admin';
      case AppRole.partner:
        return 'organization';
      case AppRole.client:
        return 'client';
    }
  }
}
