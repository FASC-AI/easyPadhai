import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get baseTheme {
    return ThemeData(
      fontFamily: 'Roboto',
      primaryColor: AppColors.backGroundColor,
      primarySwatch: Colors.blue,
      scaffoldBackgroundColor: AppColors.white,
      progressIndicatorTheme: const ProgressIndicatorThemeData(
          circularTrackColor: AppColors.backGroundColor,
          color: AppColors.backGroundColor),
      tabBarTheme: const TabBarTheme(
        labelStyle: TextStyle(
          color: AppColors.backGroundColor,
        ),
        unselectedLabelColor: AppColors.backGroundColor,
        indicator: UnderlineTabIndicator(
          borderSide: BorderSide(color: AppColors.darkBlue, width: 5),
        ),
      ),
      colorScheme: ColorScheme.fromSwatch().copyWith(
        secondary: AppColors.backGroundColor,
        onSecondary: AppColors.backGroundColor,
        onPrimary: AppColors.backGroundColor,
        primary: AppColors.backGroundColor,
      ),
    );
  }
}
