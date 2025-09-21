import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:animations/animations.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:arbor_aid_app/Screens/admin_dashboard.dart';
import 'package:arbor_aid_app/Screens/analytics_dashboard_screen.dart';
import 'package:arbor_aid_app/Screens/benefits_screen.dart';
import 'package:arbor_aid_app/Screens/client_dashboard_screen.dart';
import 'package:arbor_aid_app/Screens/employment_screen.dart';
import 'package:arbor_aid_app/Screens/health_screen.dart';
import 'package:arbor_aid_app/Screens/housing_screen.dart';
import 'package:arbor_aid_app/Screens/login_screen.dart';
import 'package:arbor_aid_app/Screens/my_conversations_screen.dart';
import 'package:arbor_aid_app/Screens/not_found_screen.dart';
import 'package:arbor_aid_app/Screens/organization_dashboard_screen.dart';
import 'package:arbor_aid_app/Screens/profile_screen.dart';
import 'package:arbor_aid_app/Screens/questionnaire_screen.dart';
import 'package:arbor_aid_app/Screens/resources_hub_screen.dart';
import 'package:arbor_aid_app/Screens/service_locator_screen.dart';
import 'package:arbor_aid_app/Screens/locator_screen.dart';
import 'firebase_options.dart';

import 'package:arbor_aid_app/dataEntry.dart';
import 'widgets/animated_card_grid.dart';
import 'widgets/header_bar.dart';
import 'widgets/connectivity_banner.dart';
import 'services/robinhood_broker_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await dotenv.load(fileName: ".env");
  runApp(const MyApp());
}

class AppRoutes {
  static const home = '/';
  static const dataEntry = '/dataEntry';
  static const login = '/login';
  static const adminDashboard = '/admin';
  static const analyticsDashboard = '/analytics';
  static const organizationDashboard = '/organization';
  static const clientDashboard = '/client';
  static const profile = '/profile';
  static const questionnaire = '/questionnaire';
  static const conversations = '/conversations';
  static const resourcesHub = '/resources';
  static const benefits = '/resources/benefits';
  static const employment = '/resources/employment';
  static const health = '/resources/health';
  static const housing = '/resources/housing';
  static const serviceLocator = '/service-locator';
  static const locator = '/locator';
}

Route<dynamic> _onGenerateRoute(RouteSettings settings) {
  final Widget page;
  switch (settings.name) {
    case AppRoutes.home:
      page = const MyHomePage();
      break;
    case AppRoutes.login:
      page = const LoginScreen();
      break;
    case AppRoutes.adminDashboard:
      page = const AdminDashboard();
      break;
    case AppRoutes.analyticsDashboard:
      page = const AnalyticsDashboardScreen();
      break;
    case AppRoutes.organizationDashboard:
      page = const OrganizationDashboardScreen();
      break;
    case AppRoutes.clientDashboard:
      page = const ClientDashboardScreen();
      break;
    case AppRoutes.profile:
      page = const ProfileScreen();
      break;
    case AppRoutes.questionnaire:
      page = const QuestionnaireScreen();
      break;
    case AppRoutes.conversations:
      page = const MyConversationsScreen();
      break;
    case AppRoutes.resourcesHub:
      page = const ResourcesHubScreen();
      break;
    case AppRoutes.benefits:
      page = const BenefitsScreen();
      break;
    case AppRoutes.employment:
      page = const EmploymentScreen();
      break;
    case AppRoutes.health:
      page = const HealthScreen();
      break;
    case AppRoutes.housing:
      page = const HousingScreen();
      break;
    case AppRoutes.serviceLocator:
      page = const ServiceLocatorScreen();
      break;
    case AppRoutes.locator:
      page = const LocatorScreen();
      break;
    case AppRoutes.dataEntry:
      page = const DataEntryPage();
      break;
    default:
      page = const NotFoundScreen();
  }

  return PageRouteBuilder(
    settings: settings,
    transitionDuration: const Duration(milliseconds: 300),
    reverseTransitionDuration: const Duration(milliseconds: 250),
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(parent: animation, curve: Curves.easeInOut);
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween<Offset>(begin: const Offset(0, 0.04), end: Offset.zero).animate(curved),
          child: child,
        ),
      );
    },
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  ThemeData _buildShieldmateTheme() {
    const primary = Color(0xFF1A237E);
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primary,
      brightness: Brightness.light,
    );

    return ThemeData(
      colorScheme: colorScheme,
      scaffoldBackgroundColor: const Color(0xFFF5F7FF),
      fontFamily: 'Montserrat',
      useMaterial3: true,
      appBarTheme: AppBarTheme(
        backgroundColor: colorScheme.primary,
        foregroundColor: Colors.white,
        elevation: 4,
        shadowColor: Colors.black.withValues(alpha: 0.2),
        centerTitle: false,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: colorScheme.primary,
        contentTextStyle: const TextStyle(color: Colors.white),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: colorScheme.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: colorScheme.primary,
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: colorScheme.primary,
        unselectedItemColor: colorScheme.onSurface.withValues(alpha: 0.6),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: '2Marines App',
      theme: _buildShieldmateTheme(),
      initialRoute: AppRoutes.home,
      onGenerateRoute: _onGenerateRoute,
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _selectedIndex = 0;
  int _previousIndex = 0;

  void _onItemTapped(int index) {
    if (index == _selectedIndex) {
      return;
    }
    setState(() {
      _previousIndex = _selectedIndex;
      _selectedIndex = index;
    });
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return const HomeScreen(key: ValueKey('home'));
      case 1:
        return const MyConversationsScreen(key: ValueKey('conversations'), embedded: true);
      case 2:
        return const ResourcesHubScreen(key: ValueKey('resources'), embedded: true);
      case 3:
        return const ProfileScreen(key: ValueKey('profile'), embedded: true);
      default:
        return const HomeScreen(key: ValueKey('home-default'));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: HeaderBar(
        title: 'Shieldmate Command Center',
        actions: [
          IconButton(
            icon: Icon(Icons.dashboard_customize),
            onPressed: () => Navigator.of(context).pushNamed(AppRoutes.clientDashboard),
          ),
        ],
      ),
      body: Column(
        children: [
          const ConnectivityBanner(),
          Expanded(
            child: PageTransitionSwitcher(
              duration: const Duration(milliseconds: 400),
              reverse: _selectedIndex < _previousIndex,
              transitionBuilder: (child, animation, secondaryAnimation) {
                return SharedAxisTransition(
                  animation: animation,
                  secondaryAnimation: secondaryAnimation,
                  transitionType: SharedAxisTransitionType.horizontal,
                  child: child,
                );
              },
              child: KeyedSubtree(
                key: ValueKey(_selectedIndex),
                child: _buildBody(),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.forum), label: 'Conversations'),
          BottomNavigationBarItem(icon: Icon(Icons.folder_special), label: 'Resources'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
        onTap: _onItemTapped,
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static const JsonEncoder _prettyJson = JsonEncoder.withIndent('  ');

  Future<void> _handleRobinhoodPositions(BuildContext context) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      final result = await RobinhoodBrokerService().getPositions();
      if (!context.mounted) {
        return;
      }
      await _showRobinhoodSheet(
        context,
        title: 'Robinhood Positions',
        data: result,
      );
    } catch (error) {
      if (!context.mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(content: Text('Unable to load positions: $error')),
      );
    }
  }

  Future<void> _handleRobinhoodOrder(BuildContext context) async {
    final messenger = ScaffoldMessenger.of(context);
    const payload = {
      'symbol': 'AAPL',
      'side': 'buy',
      'quantity': 1,
      'orderType': 'market',
      'timeInForce': 'gtc',
    };
    try {
      final result = await RobinhoodBrokerService().placeOrder(payload);
      if (!context.mounted) {
        return;
      }
      await _showRobinhoodSheet(
        context,
        title: 'Paper Order Placed',
        data: result,
      );
    } catch (error) {
      if (!context.mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(content: Text('Order request failed: $error')),
      );
    }
  }

  Future<void> _showRobinhoodSheet(
    BuildContext context, {
    required String title,
    required Map<String, dynamic> data,
  }) async {
    final pretty = _prettyJson.convert(data);
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) {
        final theme = Theme.of(sheetContext);
        final bottomPadding = MediaQuery.of(sheetContext).viewInsets.bottom;
        return FractionallySizedBox(
          heightFactor: 0.7,
          child: Padding(
            padding: EdgeInsets.fromLTRB(24, 24, 24, bottomPadding + 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: SingleChildScrollView(
                        child: SelectableText(
                          pretty,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontFamily: 'Courier',
                            height: 1.4,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final missionActions = <_HomeAction>[
      _HomeAction(
        title: 'Complete Questionnaire',
        description: 'Refresh your support needs so we can connect you to the right resources.',
        icon: Icons.assignment_turned_in,
        route: AppRoutes.questionnaire,
      ),
      _HomeAction(
        title: 'Connect with Support',
        description: 'Message your support team or request a new consultation.',
        icon: Icons.support_agent,
        route: AppRoutes.conversations,
      ),
      _HomeAction(
        title: 'Find Support Near Me',
        description: 'Locate nearby resources and launch directions.',
        icon: Icons.location_searching,
        route: AppRoutes.locator,
      ),
      _HomeAction(
        title: 'Marine Dashboard',
        description: 'Access upcoming appointments, tasks, and recent updates.',
        icon: Icons.dashboard,
        route: AppRoutes.clientDashboard,
      ),
      _HomeAction(
        title: 'View Analytics',
        description: 'See platform impact metrics and program performance.',
        icon: Icons.analytics,
        route: AppRoutes.analyticsDashboard,
      ),
      _HomeAction(
        title: 'View Positions',
        description: 'Check the latest paper portfolio snapshot from the Robinhood MCP.',
        icon: Icons.stacked_line_chart,
        onSelected: () => _handleRobinhoodPositions(context),
      ),
      _HomeAction(
        title: 'Place Paper Order',
        description: 'Send a sample market order to validate MCP connectivity.',
        icon: Icons.shopping_cart_checkout,
        onSelected: () => _handleRobinhoodOrder(context),
      ),
    ];

    final resourceLinks = <_HomeAction>[
      _HomeAction(
        title: 'Housing Assistance',
        description: 'Emergency placement, locator tools, and VA loan guidance.',
        icon: Icons.home_work_outlined,
        route: AppRoutes.housing,
      ),
      _HomeAction(
        title: 'Employment Support',
        description: 'SkillBridge, resume translation, and high-demand roles.',
        icon: Icons.work_outline,
        route: AppRoutes.employment,
      ),
      _HomeAction(
        title: 'Health & Wellness',
        description: 'Mental health, telehealth, and family resilience resources.',
        icon: Icons.health_and_safety,
        route: AppRoutes.health,
      ),
      _HomeAction(
        title: 'Benefits & Finance',
        description: 'GI Bill, compensation, and financial planning assistance.',
        icon: Icons.attach_money,
        route: AppRoutes.benefits,
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxis = constraints.maxWidth < 720 ? 1 : 2;
        final missionItems = missionActions
            .map((action) => AnimatedCardItem(
                  title: action.title,
                  subtitle: action.description,
                  icon: action.icon,
                  onTap: () {
                    if (action.onSelected != null) {
                      action.onSelected!.call();
                    } else if (action.route != null) {
                      Navigator.of(context).pushNamed(action.route!);
                    }
                  },
                  trailing: Icon(
                    Icons.arrow_forward,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ))
            .toList();

        final resourceItems = resourceLinks
            .map((action) => AnimatedCardItem(
                  title: action.title,
                  subtitle: action.description,
                  icon: action.icon,
                  onTap: () {
                    if (action.onSelected != null) {
                      action.onSelected!.call();
                    } else if (action.route != null) {
                      Navigator.of(context).pushNamed(action.route!);
                    }
                  },
                  trailing: Icon(
                    Icons.arrow_forward,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ))
            .toList();
        const twoMarinesLogoUrl = 'https://dummyimage.com/220x60/0D47A1/ffffff&text=2+Marines';

        return SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1A237E), Color(0xFF3949AB)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.18),
                        blurRadius: 28,
                        offset: const Offset(0, 14),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.asset(
                              'assets/images/shieldmate_logo.png',
                              height: 64,
                              width: 64,
                              fit: BoxFit.contain,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'Shieldmate Command Center',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                SizedBox(height: 6),
                                Text(
                                  'Stay mission ready with instant access to support, analytics, and MCP automations.',
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 14,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Opacity(
                            opacity: 0.45,
                            child: CachedNetworkImage(
                              imageUrl: twoMarinesLogoUrl,
                              width: 110,
                              height: 48,
                              fit: BoxFit.contain,
                              color: Colors.white,
                              colorBlendMode: BlendMode.modulate,
                              placeholder: (context, url) => const SizedBox(
                                width: 110,
                                height: 48,
                                child: Center(
                                  child: SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white70),
                                    ),
                                  ),
                                ),
                              ),
                              errorWidget: (context, url, error) => const SizedBox.shrink(),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      FilledButton.icon(
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF1A237E),
                        ),
                        onPressed: () => Navigator.of(context).pushNamed(AppRoutes.serviceLocator),
                        icon: const Icon(Icons.navigation),
                        label: const Text('Locate Support Services'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                const _SectionHeader(
                  title: 'Mission Priorities',
                  subtitle: 'Quick actions to keep you and your unit on trajectory.',
                ),
                AnimatedCardGrid(
                  items: missionItems,
                  crossAxisCount: crossAxis,
                  aspectRatio: crossAxis == 1 ? 1.6 : 1.4,
                ),
                const SizedBox(height: 32),
                const _SectionHeader(
                  title: 'Resource Highlights',
                  subtitle: 'Explore curated MCP workflows for Marines and families.',
                ),
                AnimatedCardGrid(
                  items: resourceItems,
                  crossAxisCount: crossAxis,
                  aspectRatio: crossAxis == 1 ? 1.6 : 1.4,
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
            title,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 4),
        Align(
          alignment: Alignment.centerLeft,
          child: Text(subtitle),
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}

class _HomeAction {
  const _HomeAction({
    required this.title,
    required this.description,
    required this.icon,
    this.route,
    this.onSelected,
  }) : assert(route != null || onSelected != null, 'Provide a navigation route or a callback.');

  final String title;
  final String description;
  final IconData icon;
  final String? route;
  final VoidCallback? onSelected;
}
