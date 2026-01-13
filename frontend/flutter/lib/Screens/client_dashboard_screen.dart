import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:arbor_aid_app/widgets/shieldmate_app_bar.dart';
import 'package:arbor_aid_app/widgets/animated_card_grid.dart';

class ClientDashboardScreen extends StatelessWidget {
  const ClientDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final quickLinks = [
      _QuickLink(
        title: 'My Questionnaire',
        subtitle: 'Refresh your support needs so your team stays synced.',
        icon: Icons.assignment,
        onTap: () => Navigator.of(context).pushNamed('/questionnaire'),
      ),
      _QuickLink(
        title: 'Upcoming Appointments',
        subtitle: 'Review mission critical engagements at a glance.',
        icon: Icons.event,
        onTap: () {},
      ),
      _QuickLink(
        title: 'Support Messages',
        subtitle: 'Check in with your support squad and counselors.',
        icon: Icons.message,
        onTap: () => Navigator.of(context).pushNamed('/conversations'),
      ),
      _QuickLink(
        title: 'Resource Library',
        subtitle: 'Explore verified benefits, guides, and toolkits.',
        icon: Icons.menu_book,
        onTap: () => Navigator.of(context).pushNamed('/resources/benefits'),
      ),
    ];
    final isCompact = MediaQuery.of(context).size.width < 720;
    final crossAxisCount = isCompact ? 1 : 2;
    const avatarUrl = 'https://ui-avatars.com/api/?name=Marine&background=0D47A1&color=fff';

    return Scaffold(
      appBar: const ShieldmateAppBar(title: 'Marine Dashboard'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: ListTile(
                leading: CircleAvatar(
                  radius: 28,
                  backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
                  backgroundImage: CachedNetworkImageProvider(avatarUrl),
                ),
                title: const Text('Mission Ready'),
                subtitle: const Text('Stay on top of your goals and support connections.'),
              ),
            ),
            const SizedBox(height: 16),
            AnimatedCardGrid(
              items: quickLinks
                  .map(
                    (link) => AnimatedCardItem(
                      title: link.title,
                      subtitle: link.subtitle,
                      icon: link.icon,
                      onTap: link.onTap,
                      trailing: const Icon(Icons.arrow_forward),
                    ),
                  )
                  .toList(),
              crossAxisCount: crossAxisCount,
              aspectRatio: crossAxisCount == 1 ? 1.5 : 1.25,
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Latest Updates',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12),
                    ListTile(
                      leading: Icon(Icons.check_circle_outline),
                      title: Text('Career readiness workshop confirmed'),
                      subtitle: Text('October 4 - 0900 - Virtual'),
                    ),
                    Divider(),
                    ListTile(
                      leading: Icon(Icons.local_hospital),
                      title: Text('Resilience training cohort forming'),
                      subtitle: Text('Apply by September 30'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickLink {
  const _QuickLink({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;
}
