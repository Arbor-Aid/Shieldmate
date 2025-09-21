import 'package:flutter/material.dart';

class ServiceLocatorScreen extends StatefulWidget {
  const ServiceLocatorScreen({super.key});

  @override
  State<ServiceLocatorScreen> createState() => _ServiceLocatorScreenState();
}

class _ServiceLocatorScreenState extends State<ServiceLocatorScreen> {
  final TextEditingController _zipCodeController = TextEditingController();
  List<Map<String, String>> services = const [];

  static const List<Map<String, String>> _mockDirectory = [
    {
      'name': 'Base Career Resource Center',
      'address': 'Camp Pendleton, CA',
      'zip': '92055',
    },
    {
      'name': 'Family Readiness Office',
      'address': 'MCB Quantico, VA',
      'zip': '22134',
    },
    {
      'name': '24/7 Crisis Support Line',
      'address': 'Virtual',
      'zip': '00000',
    },
  ];

  void _searchServices() {
    final query = _zipCodeController.text.trim();
    final results =
        _mockDirectory.where((service) => query.isEmpty || service['zip'] == query).toList();

    setState(() {
      services = results;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Service Locator'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _zipCodeController,
              decoration: const InputDecoration(
                labelText: 'Enter ZIP Code',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _searchServices,
              child: const Text('Search'),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: services.isEmpty
                  ? const Center(
                      child: Text(
                        'Enter a ZIP code to view nearby support centers.',
                        textAlign: TextAlign.center,
                      ),
                    )
                  : ListView.separated(
                      itemCount: services.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final service = services[index];
                        return Card(
                          child: ListTile(
                            leading: const Icon(Icons.place),
                            title: Text(service['name'] ?? ''),
                            subtitle: Text(service['address'] ?? ''),
                            trailing: Text(service['zip'] ?? ''),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
