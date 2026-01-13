import 'package:flutter/material.dart';

class OrganizationDashboardScreen extends StatelessWidget {
  const OrganizationDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final actionCards = [
      _DashboardAction(
        title: 'Incoming Cases',
        description: 'Review new support requests and assign case leads.',
        icon: Icons.inbox,
      ),
      _DashboardAction(
        title: 'Active Conversations',
        description: 'Continue discussions and provide timely follow-ups.',
        icon: Icons.forum,
      ),
      _DashboardAction(
        title: 'Resource Library',
        description: 'Share documents and guides with clients instantly.',
        icon: Icons.folder_shared,
      ),
      _DashboardAction(
        title: 'Analytics & Reports',
        description: 'Monitor performance indicators for your organization.',
        icon: Icons.bar_chart,
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Organization Dashboard'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.apartment)),
                title: const Text('Welcome back, Valor Support Team'),
                subtitle: const Text('Here is a snapshot of today\'s priorities.'),
                trailing: FilledButton(
                  onPressed: () {},
                  child: const Text('View Schedule'),
                ),
              ),
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.1,
              ),
              itemCount: actionCards.length,
              itemBuilder: (context, index) => _ActionCard(data: actionCards[index]),
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Upcoming Appointments',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12),
                    ListTile(
                      leading: Icon(Icons.calendar_today),
                      title: Text('Transition support check-in'),
                      subtitle: Text('Sgt. Martinez • Tomorrow • 0900'),
                      trailing: Icon(Icons.chevron_right),
                    ),
                    Divider(),
                    ListTile(
                      leading: Icon(Icons.calendar_today),
                      title: Text('Housing application review'),
                      subtitle: Text('Cpl. Nguyen • Tomorrow • 1300'),
                      trailing: Icon(Icons.chevron_right),
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

class _DashboardAction {
  const _DashboardAction({
    required this.title,
    required this.description,
    required this.icon,
  });

  final String title;
  final String description;
  final IconData icon;
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({required this.data});

  final _DashboardAction data;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(data.icon, size: 32, color: Theme.of(context).colorScheme.secondary),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(data.description),
              ],
            ),
            Align(
              alignment: Alignment.bottomRight,
              child: TextButton(
                onPressed: () {},
                child: const Text('Open'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
