import 'package:easy_padhai/dashboard/batch_req.dart';
// import 'package:firebase_core/firebase_core.dart';  // Temporarily disabled
import 'package:flutter/material.dart';
import 'dart:async';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:easy_padhai/services/local_storage_service.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // await Firebase.initializeApp();  // Temporarily disabled
  await GetStorage.init();
  Get.lazyPut(() => AuthController());
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Request Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SplashScreen(),
    );
  }
}






class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  final LocalStorageService localStorageService = LocalStorageService();
  LocalStorageService localStorageServiceUser = LocalStorageService();
  bool showFirstImage = true;
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _brightnessAnimation;
  late Animation<double> _sizeAnimation;
  AuthController authController = Get.find();
  dynamic directLogin;
  dynamic onboardingDone;
  dynamic loginData;
  bool isloading = false;
  String? data;

  @override
  void initState() {
    super.initState();

    // Initialize Animation Controller
    _controller = AnimationController(
      duration:
          const Duration(milliseconds: 500), // Smooth transition duration
      vsync: this,
    );

    // Fade Animation
    _fadeAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    // Start animation loop
    Timer.periodic(const Duration(seconds: 3), (Timer timer) {
      setState(() {
        showFirstImage = !showFirstImage;
      });
      _controller.forward().then((_) => _controller.reverse());
    });
    startTimeiOS();
  }

  startTimeiOS() async {
    var duration = const Duration(seconds: 4);
    return Timer(duration, navigationPage);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> navigationPage() async {
    print("user name: ${token()}");
    token() != null && token() != ''
        ? {
            Get.lazyPut(() => AuthController()),
            Get.lazyPut(() => DashboardController()),
            Get.toNamed(RouteName.verifyMpin)
          }
        : Get.offNamed(RouteName.login);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Stack(
          children: [
            // Background Image
            SizedBox(
              width: MediaQuery.of(context).size.width,
              height: MediaQuery.of(context).size.height,
              child: Image.asset(
                'assets/bg.png',
                fit: BoxFit.fill,
              ),
            ),
            // Animated Logos
            Center(
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  return AnimatedCrossFade(
                    duration: const Duration(milliseconds: 500),
                    firstChild: Opacity(
                      opacity: _fadeAnimation.value,
                      child: Image.asset(
                        'assets/logos.png', // Light logo
                        width: 180, // 👈 Smaller Size
                        height: 180,
                      ),
                    ),
                    secondChild: Opacity(
                      opacity: (_fadeAnimation.value + 0.2).clamp(0.0, 1.0),
                      child: Image.asset(
                        'assets/logoss.png', // Bold logo
                        width: 250, // 👈 Larger Size
                        height: 250,
                      ),
                    ),
                    crossFadeState: showFirstImage
                        ? CrossFadeState.showFirst
                        : CrossFadeState.showSecond,
                    firstCurve: Curves.easeInOut,
                    secondCurve: Curves.easeInOut,
                    sizeCurve: Curves.easeInOut,
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
