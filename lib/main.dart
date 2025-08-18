import 'package:easy_padhai/app.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    await GetStorage.init();
    runApp(const MyApp());
  } catch (e) {
    print('Error initializing Firebase: $e');
    // Fallback to run app without Firebase for web if needed
    await GetStorage.init();
    runApp(const MyApp());
  }
}
