import 'package:flutter/material.dart';

class ApiUrls {
  //For Local Date
  static String localDate(TimeOfDay time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    var dateTime = '$hour:$minute';
    return dateTime;
  }

  static bool ongoingTime(String date) {
    var time = DateTime.parse(date).difference(DateTime.now()).inSeconds;
    if (time >= 2) {
      return true;
    } else {
      return false;
    }
  }

  // Base url

  static const String apiBaseUrl = 'codesuperb.com';
  static const String prodApiBaseUrl = 'https://codesuperb.com/';

  // Api End Point

  // Auth
  static const String googleLogin = 'api/v1/auth/google-login';
  static const String setverifyMpin = 'api/v1/auth/set-verify-mpin/';
  static const String classList = 'api/v1/class/list';
  static const String sectionList = 'api/v1/section/list';
  static const String subjectList = 'api/v1/subject/list';
  static const String institutionList = 'api/v1/institutes/list';
  static const String dictrictList = 'api/v1/district';
  static const String stateList = 'api/v1/state';
  static const String updateProfile = 'api/v1/profile';
}
