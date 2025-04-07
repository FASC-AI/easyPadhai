import 'dart:async';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:easy_padhai/services/local_storage_service.dart';
import 'package:flutter/material.dart';
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

  String? data;

  @override
  void initState() {
    super.initState();

    startTimeiOS();
  }

  startTimeiOS() async {
    var duration = const Duration(seconds: 4);
    return Timer(duration, navigationPage);
  }

  Future<void> navigationPage() async {
    // if (authController.version.value.isNotEmpty) {
    //   data = await localStorageServiceUser.getLocalAuthUser();
    //   if (data != null) {
    //     loginData = await localStorageService.getLocalAuthData();
    //     if (loginData != null) {
    //       Get.offAllNamed(RouteName.login);
    //     } else {
    //       Get.offNamed(RouteName.login);
    //     }
    //   } else {
    Get.offNamed(RouteName.login);
    //   }
    // }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Stack(children: [
          SizedBox(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height,
            child: Image.asset(
              'assets/splashbg.png',
              fit: BoxFit.fill,
            ),
          ),
        ]),
      ),
    );
  }
}
