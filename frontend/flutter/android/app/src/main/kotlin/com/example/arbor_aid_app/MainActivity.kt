<<<<<<< HEAD
package arbor_aid_app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppUI() // This calls your main composable function from Dart
        }
    }
}
=======
package com.example.arbor_aid_app

import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
}
>>>>>>> 27a9723a0e12c4c078243042e84a5a4b3a137bf8
