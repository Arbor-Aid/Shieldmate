import 'package:http/http.dart' as http; // Single import
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  Future<List<dynamic>> fetchServices(String zipCode) async {
    // Load .env file (ensure this is done early in your app)
    await dotenv.load();

    String apiKey = dotenv.env['API_KEY'] ?? '';

    if (apiKey.isEmpty) {
      throw Exception("API Key not found in .env file");
    }

    final response = await http.get(
      Uri.parse('https://api.example.com/services/$zipCode?api_key=$apiKey'),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load services');
    }
  }
}
