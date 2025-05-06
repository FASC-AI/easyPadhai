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
  static const String addIns = 'api/v1/institutes';
  static const String dictrictList = 'api/v1/district';
  static const String stateList = 'api/v1/state';
  static const String district = 'api/v1/district';
  static const String updateProfile = 'api/v1/user-profile/add-edit';
  static const String profile = 'api/v1/user-profile/user-info';
  static const String crbatch = 'api/v1/batch';
  static const String crins = '/api/v1/institutes';
  static const String bannerList = 'api/v1/banner/list';
  static const String batchlist = 'api/v1/batch';
  static const String noti = 'api/v1/notification/list';
  static const String binfo = 'api/v1/batch/info';
  static const String breq = 'api/v1/request';
  static const String breqget = 'api/v1/request/requestedbatch';
  static const String breqapprove = 'api/v1/request/';
}
