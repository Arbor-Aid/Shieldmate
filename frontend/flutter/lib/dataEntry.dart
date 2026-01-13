import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: DataEntryPage(),
    );
  }
}

class DataEntryPage extends StatefulWidget {
  const DataEntryPage({super.key});

  @override
  _DataEntryPageState createState() => _DataEntryPageState();
}

class _DataEntryPageState extends State<DataEntryPage> {
  // Define a TextEditingController for each field
  final TextEditingController organizationNameController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController servicesController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  final TextEditingController phoneNumberController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController websiteUrlController = TextEditingController();
  final TextEditingController whoIsThisForController = TextEditingController();

  bool isAppointmentRequired = false;
  List<bool> isSelected = List.generate(7, (_) => false); // For the days of the week

  @override
  void dispose() {
    // Dispose the controllers when the state is disposed
    organizationNameController.dispose();
    descriptionController.dispose();
    servicesController.dispose();
    addressController.dispose();
    phoneNumberController.dispose();
    emailController.dispose();
    websiteUrlController.dispose();
    whoIsThisForController.dispose();
    super.dispose();
  }

  void handleSubmit() {
    // Here you can handle the data submission, for example:
    final String organizationName = organizationNameController.text;
    final String description = descriptionController.text;
    final String services = servicesController.text;
    final String address = addressController.text;
    final String phoneNumber = phoneNumberController.text;
    final String email = emailController.text;
    final String websiteUrl = websiteUrlController.text;
    final String whoIsThisFor = whoIsThisForController.text;

    // For demonstration purposes, we just print the values to the console
    print('Organization Name: $organizationName');
    print('Description: $description');
    print('Services: $services');
    print('Address: $address');
    print('Phone Number: $phoneNumber');
    print('Email: $email');
    print('Website URL: $websiteUrl');
    print('Appointment Required: $isAppointmentRequired');
    print('Who is this for: $whoIsThisFor');
    print(
        'Days selected: ${isSelected.asMap().entries.where((entry) => entry.value).map((entry) => entry.key).toList()}');

    // Here you can add your logic to send this data to a server or save it locally...
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: GradientAppBar(
        title: 'Data Entry',
        gradientColors: [Colors.white, Colors.grey.shade900],
      ),
      // The rest of your Scaffold body
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _buildTextField('Organization Name'),
            const SizedBox(height: 10),
            _buildTextField('Description', maxLines: 3),
            const SizedBox(height: 10),
            _buildTextField('Services'),
            const SizedBox(height: 10),
            _buildTextField('Address'),
            const SizedBox(height: 10),
            _buildTextField('Phone Number'),
            const SizedBox(height: 10),
            _buildTextField('Email'),
            const SizedBox(height: 10),
            _buildTextField('Website URL'),
            const SizedBox(height: 20),
            const Text('Appointment Required? (Check for yes)'),
            Checkbox(
              value: isAppointmentRequired,
              onChanged: (bool? newValue) {
                setState(() {
                  isAppointmentRequired = newValue!;
                });
              },
            ),
            _buildTextField('Who is this for?'),
            const SizedBox(height: 20),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: ToggleButtons(
                borderColor: Colors.transparent,
                fillColor: Theme.of(context).colorScheme.surface,
                selectedBorderColor: Theme.of(context).colorScheme.primary,
                selectedColor: Colors.black,
                borderRadius: BorderRadius.circular(30),
                onPressed: (int index) {
                  setState(() {
                    isSelected[index] = !isSelected[index];
                  });
                },
                isSelected: isSelected,
                children: const <Widget>[
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Mon'),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Tue'),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Wed'),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Thu'),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Fri'),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Sat'),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Sun'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: handleSubmit,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(
                    double.infinity, 50), // double.infinity is the width and 50 is the height
              ),
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(String label, {int maxLines = 1}) {
    return TextField(
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white), // Adjust label color if needed
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(30.0),
        ),
        // Remove filled and fillColor properties if you don't want a white background
      ),
      style: const TextStyle(color: Colors.white), // Adjust text color if needed
      maxLines: maxLines,
    );
  }
}

class GradientAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Color> gradientColors;
  final double barHeight = 56.0;

  const GradientAppBar({super.key, required this.title, required this.gradientColors});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title),
      flexibleSpace: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter, // Starts from the top
            end: Alignment.bottomCenter, // Ends at the bottom
            colors: gradientColors,
          ),
        ),
      ),
      iconTheme: const IconThemeData(color: Colors.white),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(barHeight);
}
