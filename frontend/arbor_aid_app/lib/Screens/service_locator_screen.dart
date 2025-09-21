import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert'; // To decode JSON responses

class ServiceLocatorScreen extends StatefulWidget {
  const ServiceLocatorScreen({super.key});

  @override
  _ServiceLocatorScreenState createState() => _ServiceLocatorScreenState();
}

class _ServiceLocatorScreenState extends State<ServiceLocatorScreen> {
  final TextEditingController _zipCodeController = TextEditingController();
  List<dynamic> services = [];
  bool isLoading = false;

  // Function to search services based on the entered ZIP Code
  void _searchServices() async {
    setState(() {
      isLoading = true;
    });

    // Replace the URL below with your API URL and ensure it returns proper JSON data
    final String apiUrl = 'https://api.example.com/services?zip=${_zipCodeController.text}';
    final response = await http.get(Uri.parse(apiUrl));

    if (response.statusCode == 200) {
      final List<dynamic> serviceList = jsonDecode(response.body);
      setState(() {
        services = serviceList;
        isLoading = false;
      });
    } else {
      // Handle the error by showing a message or any other way you want
      setState(() {
        services = [];
        isLoading = false;
      });
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Error'),
          content: const Text('Failed to load services'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Service Locator'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Input field for ZIP code
            TextField(
              controller: _zipCodeController,
              decoration: const InputDecoration(
                labelText: 'Enter ZIP Code',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            // Search button
            ElevatedButton(
              onPressed: _searchServices,
              child: const Text('Search'),
            ),
            const SizedBox(height: 16),
            // Loading indicator while fetching services
            isLoading
                ? const CircularProgressIndicator()
                : Expanded(
              // Display list of services
              child: ListView.builder(
                itemCount: services.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text(services[index]['name']),
                    subtitle: Text(services[index]['address']),
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
