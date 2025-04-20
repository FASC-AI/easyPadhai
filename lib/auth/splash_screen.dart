import 'dart:async';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:easy_padhai/services/local_storage_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final LocalStorageService localStorageService = LocalStorageService();
  LocalStorageService localStorageServiceUser = LocalStorageService();

  AuthController authController = Get.find();
  dynamic directLogin;
  dynamic onboardingDone;
  dynamic loginData;

  bool isloading = false;
  bool showFirstImage = true;

  String? data;

  @override
  void initState() {
    super.initState();
    // Trigger the fade animation after 1 second
    Timer(const Duration(seconds: 1), () {
      setState(() {
        showFirstImage = false;
      });
    });

    startTimeiOS();
  }

  startTimeiOS() async {
    var duration = const Duration(seconds: 4);
    return Timer(duration, navigationPage);
  }

  Future<void> navigationPage() async {
    Get.offNamed(RouteName.login);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Stack(
          children: [
            SizedBox(
              width: MediaQuery.of(context).size.width,
              height: MediaQuery.of(context).size.height,
              child: Image.asset(
                'assets/bg.png',
                fit: BoxFit.fill,
              ),
            ),
            Center(
              child: AnimatedCrossFade(
                duration: const Duration(milliseconds: 2000),
                firstChild: Image.asset(
                  'assets/logos.png',
                  width: 200,
                  height: 200,
                ),
                secondChild: Image.asset(
                  'assets/logoss.png',
                  width: 200,
                  height: 200,
                ),
                crossFadeState: showFirstImage
                    ? CrossFadeState.showFirst
                    : CrossFadeState.showSecond,
                firstCurve: Curves.easeInOut,
                secondCurve: Curves.easeInOut,
                sizeCurve: Curves.easeInOut,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
