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
  // static const String apiBaseUrl = 'staging.sugamyatra.up.in';
  // static const String prodApiBaseUrl = 'https://staging.sugamyatra.up.in/';

  static const String apiBaseUrl = 'erp.sugamyatra.up.in';
  static const String prodApiBaseUrl = 'https://erp.sugamyatra.up.in/';

  // Api End Point
  // Auth
  static const String loginUserVerify = 'api/v1/adminusers/mobilelogin';
  static const String userVerifyOTP = 'api/v1/adminusers/verifyotp';
  static const String userSetmPin = 'api/v1/adminusers/setmpin';
  static const String userVerifymPin = 'api/v1/adminusers/verifympin';
  static const String userResendOTP = 'api/v1/adminusers/resendotp';

  static const String appVersion = 'api/v1/adminusers/version';
  static const String userProfile = 'api/v1/adminusers/userProfile';
  static const String countryList = 'api/v1/adminusers/getAllCountries';
  static const String stateList = 'api/v1/adminusers/getAllStates';
  static const String districtList = 'api/v1/adminusers/search';
  static const String contractorList = 'api/v1/adminusers/getAllContractors';
  static const String profileImageUpload =
      'api/v1/adminusers/mobileImageUpload';
  static const String deleteGovtImage = 'api/v1/adminusers/mobileImageUpload/';

  static const String updateUserProfile = 'api/v1/adminusers/userProfile';

  static const String getTimetable = 'api/v1/time-table/dispatch';
  static const String putCheckin = 'api/v1/time-table/dispatch/in-out-time/';
  static const String getVehicleNo = 'api/v2/vehicle/all-vehicle-numbers';

  static const String getIssueCat = 'api/v2/masters/search/issueCategory';
  static const String getIssueSubCat = 'api/v2/masters/search/issueSubCategory';
  static const String getIssuePriority = 'api/v2/masters/search/priority';
  static const String getIssuePriorityById = '/api/v2/issue/priority';
  static const String getIssueUser = 'api/v1/adminusers/getAllUserNameAndId';

  static const String postAddIssue = 'api/v2/issue';
  static const String getIssueList = 'api/v2/issue';

  static const String postFeedbackIssue = 'api/v2/issue/feedback/';

  static const String patchEvent1 = 'api/v1/time-table/dispatch/';
  static const String patchEvent6ActualTrip = 'api/v1/time-table/sugam-slip/';
  static const String getEvent2Form =
      'api/v2/inspection/66de9dd2a6ed57a7ad13bd3d';
  static const String getEvent3Form =
      'api/v2/inspection/66f669cc32eebe76b334100a';
  static const String getEvent3APIData = 'api/v1/time-table/dispatch/';

  static const String postEvent2 = 'api/V2/startInspection';
  static const String getEvent2Data = 'api/v2/startInspection/event/';

  static const String getEvent3Data =
      'api/v2/startInspection/dispatcher/event/';

  static const String getEvent9Data = 'api/v2/fuelCharging/dispatch/';

  static const String postUploadImage = '/api/v2/s3/multiple';
  static const String postLocation = '/api/v1/time-table/location';
  static const String getCheckLocation =
      '/api/v1/time-table/location/checkInfo';
  static const String getfuelinspection = '/api/v1/time-table/fuelinspection';

  static const String postFuelCalculation =
      '/api/v1/time-table/fuel/calculation-preview';

  static const String postFuelData = '/api/v1/time-table/fuel/save';
  static const String getAllVehicleSearch =
      '/api/v1/time-table/getallVehicleSearch';

  static const String postAllFuelData = '/api/v1/time-table/fuel/single-save';

  static const String getSingleFuelCalculation =
      '/api/v1/time-table/fuel/single-calculation-preview';

  static const String getFuelCrew = '/api/v1/time-table/getCrew';

  static const String getFuelList = 'api/v2/fuelCharging/fuel-list';
}
