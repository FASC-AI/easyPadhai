import 'package:easy_padhai/common/app_theme.dart';
import 'package:easy_padhai/common/bindings.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/route/custom_route.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:easy_padhai/services/connectivity_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_statusbarcolor_ns/flutter_statusbarcolor_ns.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    FlutterStatusbarcolor.setStatusBarColor(AppColors.theme);

    return ChangeNotifierProvider(
      create: (context) => ConnectivityProvider(),
      child: GetMaterialApp(
        debugShowCheckedModeBanner: false,
        title: "UPSRTC",
        theme: AppTheme.baseTheme,
        onGenerateRoute: CustomRoute.allRoutes,
        initialRoute: RouteName.splash,
        initialBinding: RootBinding(),
      ),
    );
  }
}
