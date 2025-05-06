import 'package:easy_padhai/auth/forgot_pin.dart';
import 'package:easy_padhai/auth/forgot_pin_email.dart';
import 'package:easy_padhai/auth/institution_registration.dart';
import 'package:easy_padhai/auth/select_class.dart';
import 'package:easy_padhai/auth/select_institution.dart';
import 'package:easy_padhai/auth/select_section.dart';
import 'package:easy_padhai/auth/verify_mpin.dart';
import 'package:easy_padhai/auth/login_screen.dart';
import 'package:easy_padhai/auth/set_mpin.dart';
import 'package:easy_padhai/auth/select_subject.dart';
import 'package:easy_padhai/auth/sign_in.dart';
import 'package:easy_padhai/auth/splash_screen.dart';
import 'package:easy_padhai/common/no_internet.dart';
import 'package:easy_padhai/common/no_service.dart';
import 'package:easy_padhai/dashboard/batch_list.dart';
import 'package:easy_padhai/dashboard/leaderboard_screen.dart';
import 'package:easy_padhai/dashboard/profile.dart';
import 'package:easy_padhai/dashboard/profile_edit.dart';
import 'package:easy_padhai/dashboard/student_detail.dart';
import 'package:easy_padhai/dashboard/student_home.dart';
import 'package:easy_padhai/dashboard/teacher_home.dart';
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
      case RouteName.noInternet:
        return NoInternet();
      case RouteName.noService:
        return const NoService();
      case RouteName.login:
        return const Login();
      case RouteName.verifyMpin:
        return const VerifyMpin();
      case RouteName.email:
        return const Email();
      case RouteName.setMPin:
        return const SetMPin();
      case RouteName.forgotPin:
        return const ForgotPIN();
      case RouteName.forgotPinEmail:
        return const ForgotPinEmail();
      case RouteName.subjectSelect:
        return SelectSubject();
      case RouteName.classSelect:
        return SelectClass();
      case RouteName.sectionSelect:
        return SelectSection();
      case RouteName.teacherHome:
        return TeacherHome();
      case RouteName.selectInstitution:
        return const SelectInstitution();
      case RouteName.registerInstitution:
        return const InstitutionRegistration();
      case RouteName.studentHome:
        return StudentHome();

      case RouteName.profile:
        return Profile();
      case RouteName.profileEdit:
        return const ProfileEdit();
      case RouteName.leaderboard:
        return const LeaderboardScreen();
      case RouteName.batchlist:
        return const BatchListScreen();

      case RouteName.subdet:
        final argumentMap = args as Map<String, dynamic>?;
        final title = argumentMap?['title'] ?? 'No Title';
        return SubjectDetailScreen(title: title);
    }
    return const SplashScreen();
  }
}
