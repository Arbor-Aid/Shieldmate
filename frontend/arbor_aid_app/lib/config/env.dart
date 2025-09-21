import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Strongly typed environment configuration with safe fallbacks for MCP URLs.
class EnvConfig {
  EnvConfig._();

  static const _placeholderHost = 'placeholder.mcp.shieldmate';

  static bool get _initialized => dotenv.isInitialized;

  static String _raw(String key) {
    if (!_initialized) {
      return '';
    }
    return dotenv.env[key]?.trim() ?? '';
  }

  static bool _has(String key) => _raw(key).isNotEmpty;

  static bool _hasAny(List<String> keys) => keys.any(_has);

  static String _url(String key) {
    final value = _raw(key);
    if (value.isNotEmpty) {
      return value;
    }
    final safeKey = key.toLowerCase().replaceAll('_', '-');
    return 'https://$_placeholderHost/$safeKey';
  }

  static String _urlForKeys(List<String> keys) {
    for (final key in keys) {
      if (_has(key)) {
        return _url(key);
      }
    }
    return _url(keys.first);
  }

  static Uri _uriForKeys(List<String> keys) => Uri.parse(_urlForKeys(keys));

  static String? _optional(String key) {
    final value = _raw(key);
    return value.isEmpty ? null : value;
  }

  // === Secrets / API Keys ===
  static String? get openAiApiKey => _optional('OPENAI_API_KEY');
  static String? get slackKey => _optional('SLACK_KEY');
  static String? get notionToken => _optional('NOTION_TOKEN');
  static String? get githubToken => _optional('GITHUB_TOKEN');
  static String? get firebaseApiKey => _optional('FIREBASE_API_KEY');

  // === Core Shieldmate MCP endpoints ===
  static Uri get referralMcp => _uriForKeys(['REFERRAL_MCP_URL']);
  static bool get hasReferralMcp => _hasAny(['REFERRAL_MCP_URL']);

  static Uri get resumeMcp => _uriForKeys(['RESUME_MCP_URL']);
  static bool get hasResumeMcp => _hasAny(['RESUME_MCP_URL']);

  static Uri get analyticsMcp => _uriForKeys(['ANALYTICS_MCP_URL']);
  static bool get hasAnalyticsMcp => _hasAny(['ANALYTICS_MCP_URL']);

  static Uri get webscrapingMcp => _uriForKeys(['WEBSCRAPING_MCP_URL']);
  static bool get hasWebscrapingMcp => _hasAny(['WEBSCRAPING_MCP_URL']);

  static Uri get housingMcp => _uriForKeys(['HOUSING_MCP_URL']);
  static bool get hasHousingMcp => _hasAny(['HOUSING_MCP_URL']);

  static Uri get employmentMcp => _uriForKeys(['EMPLOYMENT_MCP_URL']);
  static bool get hasEmploymentMcp => _hasAny(['EMPLOYMENT_MCP_URL']);

  static Uri get healthMcp => _uriForKeys(['HEALTH_MCP_URL']);
  static bool get hasHealthMcp => _hasAny(['HEALTH_MCP_URL']);

  static Uri get benefitsMcp => _uriForKeys(['BENEFITS_MCP_URL']);
  static bool get hasBenefitsMcp => _hasAny(['BENEFITS_MCP_URL']);

  static Uri get conversationsMcp => _uriForKeys(['CONVERSATIONS_MCP_URL']);
  static bool get hasConversationsMcp => _hasAny(['CONVERSATIONS_MCP_URL']);

  static Uri get robinhoodMcp => _uriForKeys(['ROBINHOOD_MCP_URL']);
  static bool get hasRobinhoodMcp => _hasAny(['ROBINHOOD_MCP_URL']);

  // === Financial automations (aliases handle legacy key names) ===
  static Uri get aiBudgetPlannerUri =>
      _uriForKeys(['AI_BUDGET_PLANNER_MCP_URL', 'AI_BUDGET_PLANNER_URL']);
  static bool get hasAiBudgetPlannerMcp =>
      _hasAny(['AI_BUDGET_PLANNER_MCP_URL', 'AI_BUDGET_PLANNER_URL']);

  static Uri get expenseManagerUri =>
      _uriForKeys(['EXPENSE_MANAGER_MCP_URL', 'AI_EXPENSE_MANAGER_URL']);
  static bool get hasExpenseManagerMcp =>
      _hasAny(['EXPENSE_MANAGER_MCP_URL', 'AI_EXPENSE_MANAGER_URL']);

  static Uri get financialAnalystUri => _uriForKeys([
        'FINANCIAL_ANALYST_MCP_URL',
        'AI_FINANCIAL_ANALYST_URL',
      ]);
  static bool get hasFinancialAnalystMcp => _hasAny([
        'FINANCIAL_ANALYST_MCP_URL',
        'AI_FINANCIAL_ANALYST_URL',
      ]);

  static Uri get reportingDashboardUri => _uriForKeys([
        'REPORTING_DASHBOARD_MCP_URL',
        'ANALYTICS_MCP_URL',
        'REPORTING_DASHBOARD_AI_URL',
      ]);
  static bool get hasReportingDashboardUri => _hasAny([
        'REPORTING_DASHBOARD_MCP_URL',
        'REPORTING_DASHBOARD_AI_URL',
        'ANALYTICS_MCP_URL',
      ]);

  static String get robinhoodBroker => _raw('ROBINHOOD_BROKER_URL');
  static String get googleMapsApiKey => _raw('GOOGLE_MAPS_API_KEY');
  static bool get allowFakeLogin =>
      (_raw('ALLOW_FAKE_LOGIN').isEmpty ? 'true' : _raw('ALLOW_FAKE_LOGIN')).toLowerCase() ==
      'true';
  static bool get appleEnabled =>
      (_raw('APPLE_SIGN_IN_ENABLED').isEmpty ? 'true' : _raw('APPLE_SIGN_IN_ENABLED'))
          .toLowerCase() ==
      'true';
  static String? get appleServiceId => _optional('APPLE_SERVICE_ID');
  static String? get appleRedirectUri => _optional('APPLE_REDIRECT_URI');
  static String? get appleClientId => _optional('APPLE_CLIENT_ID');

  static Uri get resumeBuilderUri => resumeMcp;
  static bool get hasResumeBuilderUri => hasResumeMcp;
}
