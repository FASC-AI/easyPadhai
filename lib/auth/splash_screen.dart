import 'dart:async';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:easy_padhai/services/local_storage_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

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
  Timer? _animationTimer;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _startAnimationLoop();
    startTimeiOS();
  }

  void _initializeAnimations() {
    _controller = AnimationController(
      duration: const Duration(milliseconds: 700),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  void _startAnimationLoop() {
    _animationTimer = Timer.periodic(const Duration(seconds: 3), (Timer timer) {
      if (!mounted) return;
      setState(() => showFirstImage = !showFirstImage);
      _controller.forward().then((_) => _controller.reverse());
    });
  }

  @override
  void dispose() {
    _animationTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  startTimeiOS() async {
    var duration = const Duration(seconds: 4);
    return Timer(duration, navigationPage);
  }

  Future<void> navigationPage() async {
    print("user name: ${token()}");
    token() != null && token() != ''
        ? {
            Get.lazyPut(() => AuthController()),
            Get.lazyPut(() => DashboardController()),
            Get.offNamed(RouteName.verifyMpin)
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
