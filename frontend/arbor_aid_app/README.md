<<<<<<< HEAD
# Project Setup Instructions
=======
# 2Marines online

Welcome to the 2Marines online project. This guide will walk you through setting up your development environment for both the frontend and backend portions of our application.

## Getting Started
>>>>>>> 27a9723a0e12c4c078243042e84a5a4b3a137bf8

These instructions will help you set up your project locally for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Flutter**: For frontend development.
- **Python 3.10**: Required for the backend. Other versions may work but are not officially supported.
- **Git**: For version control.

### Backend Setup

The backend is built with Django and requires Python 3.10. Here's how to set it up:

1. **Install Python 3.10**:
<<<<<<< HEAD
   - Ensure Python 3.10 is installed and set as your active Python version. You may use `pyenv` for managing multiple Python versions.

2. **Clone the Repository** (if you haven't already):
   ```sh
   git clone https://github.com/Arbor-Aid/2Marines-online.git
   cd 2Marines-online
   ```

3. **Set Up a Virtual Environment**:

   ```bash
   python3 -m venv env
   source env/bin/activate  # On Windows use `env\Scripts\activate`
   ```

=======

   - Ensure Python 3.10 is installed and set as your active Python version. You may use `pyenv` for managing multiple Python versions.
2. **Clone the Repository** (if you haven't already):

   ```bash
   git clone https://github.com/your-username/Arbor-Aid.git
   cd Arbor-Aid/backend
   ```
3. **Set Up a Virtual Environment**:

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Use `venv\Scripts\activate` on Windows
   ```
>>>>>>> 27a9723a0e12c4c078243042e84a5a4b3a137bf8
4. **Install Dependencies**:

   ```bash
   pip install django requests python-dotenv djangorestframework
   ```
<<<<<<< HEAD

5. **Run Migrations**:

   ```bash
   6. **Run Migrations**:
   
      ```bash
      python manage.py migrate
      ```
   ```

=======
5. **Run Migrations**:

   ```bash
   python manage.py migrate
   ```
>>>>>>> 27a9723a0e12c4c078243042e84a5a4b3a137bf8
6. **Start the Django Development Server**:

   ```bash
   python manage.py runserver
   ```

### Frontend Setup

The frontend is developed with Flutter. Follow these steps to set it up:

1. **Install Flutter**:

   - Visit the [official Flutter installation guide](https://flutter.dev/docs/get-started/install) and follow the instructions for your operating system.
<<<<<<< HEAD

=======
>>>>>>> 27a9723a0e12c4c078243042e84a5a4b3a137bf8
2. **Navigate to the Frontend Directory**:

   ```bash
   cd path/to/frontend
   ```
<<<<<<< HEAD

=======
>>>>>>> 27a9723a0e12c4c078243042e84a5a4b3a137bf8
3. **Get Flutter Dependencies**:

   ```bash
   flutter pub get
   ```
<<<<<<< HEAD

=======
>>>>>>> 27a9723a0e12c4c078243042e84a5a4b3a137bf8
4. **Run the Flutter App**:

   - Ensure an emulator is running or a device is connected.

   ```bash
   flutter run
   ```

### Installing General Python Packages

For additional functionality, such as using Flask for microservices, install the required packages:

```bash
pip install flask
```

### Database Connections

The project uses SQLite by default. For PostgreSQL or MySQL, ensure you install the necessary adapters:

```bash
pip install psycopg2  # For PostgreSQL
pip install mysqlclient  # For MySQL
```

### Environment Variables

Ensure you create a `.env` file in the backend directory with the necessary environment variables, such as `GPT_API_KEY`.

### Development Tools

- **Pip**: Comes with Python for package management.
- **Venv**: Included with Python 3.3 and later for creating virtual environments.
