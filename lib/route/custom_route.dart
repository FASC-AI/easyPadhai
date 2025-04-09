import 'package:easy_padhai/auth/select_class.dart';
import 'package:easy_padhai/auth/verify_mpin.dart';
import 'package:easy_padhai/auth/login_screen.dart';
import 'package:easy_padhai/auth/set_mpin.dart';
import 'package:easy_padhai/auth/select_subject.dart';
import 'package:easy_padhai/auth/sign_in.dart';
import 'package:easy_padhai/auth/splash_screen.dart';
import 'package:easy_padhai/common/no_internet.dart';
import 'package:easy_padhai/common/no_service.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:easy_padhai/services/connectivity_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class CustomRoute {
  static Route<dynamic> allRoutes(RouteSettings settings) {
    return MaterialPageRoute(builder: (context) {
      final isOnline = Provider.of<ConnectivityProvider>(context).isOnline;

      if (!isOnline) {
        return NoInternet();
      }

      return otherRoutes(settings.name, settings.arguments);
    });
  }

  static dynamic otherRoutes(String? routeName, Object? args) {
    switch (routeName) {
      case RouteName.splash:
        return const SplashScreen();
      case RouteName.login:
        return const Login();
      case RouteName.verifyMpin:
        return const VerifyMpin();
      case RouteName.email:
        return const Email();
      case RouteName.setMPin:
        return const SetMPin();
      case RouteName.subjectSelect:
        return const SelectSubject();
      case RouteName.classSelect:
        return const SelectClass();
      case RouteName.noInternet:
        return NoInternet();
      case RouteName.noService:
        return const NoService();
    }
    return const SplashScreen();
  }
}
