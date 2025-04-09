import 'dart:convert';
import 'dart:io';
import 'package:easy_padhai/common/api_urls.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

class ApiHelper {
  Future<dynamic> get(
      String url, Map<String, dynamic>? queryParameters, String tokenId) async {
    dynamic responseJson;
    try {
      final response = await http
          .get(Uri.https(ApiUrls.apiBaseUrl, url, queryParameters), headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $tokenId",
        "Device-Platform": Platform.isAndroid ? "Android" : "iOS",
      });
      responseJson = _returnResponse(response);
      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  Future<dynamic> gets(String url, dynamic queryParameters) async {
    dynamic responseJson;
    try {
      final response = await http
          .get(Uri.https(ApiUrls.apiBaseUrl, url, queryParameters), headers: {
        "Content-Type": "application/json",
      });
      responseJson = _returnResponse(response);
      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  Future<dynamic> put(
      String url, Map<String, dynamic>? data, String tokenId) async {
    dynamic responseJson;
    try {
      final response = await http.put(Uri.https(ApiUrls.apiBaseUrl, url),
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer $tokenId",
            "Device-Platform": Platform.isAndroid ? "Android" : "iOS",
          },
          body: jsonEncode(data));
      responseJson = _returnResponse(response);
      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  Future<dynamic> putObject(String url, Map<String, dynamic>? data,
      String tokenId, Map<String, String>? queryParams) async {
    dynamic responseJson;
    try {
      final uri = Uri.https(ApiUrls.apiBaseUrl, url, queryParams);
      final response = await http.put(uri,
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer $tokenId",
            "Device-Platform": Platform.isAndroid ? "Android" : "iOS",
          },
          body: jsonEncode(data));
      responseJson = _returnResponse(response);
      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  Future<dynamic> patch(
      String url, Map<String, dynamic>? data, String tokenId) async {
    dynamic responseJson;
    try {
      final response = await http.patch(Uri.https(ApiUrls.apiBaseUrl, url),
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer $tokenId",
            "Device-Platform": Platform.isAndroid ? "Android" : "iOS",
          },
          body: jsonEncode(data));
      responseJson = _returnResponse(response);
      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  Future<dynamic> putWithOutToken(
      String url, Map<String, dynamic>? data) async {
    dynamic responseJson;
    try {
      final response = await http.put(Uri.https(ApiUrls.apiBaseUrl, url),
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonEncode(data));
      responseJson = _returnResponse(response);
      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  Future<dynamic> delete(
      String url, Map<String, dynamic>? data, String tokenId) async {
    dynamic responseJson;
    try {
      final response = await http.delete(
          //ToDo - get the url based on the enviornment setup
          Uri.https(ApiUrls.apiBaseUrl, url),
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer $tokenId",
            "Device-Platform": Platform.isAndroid ? "Android" : "iOS",
          },
          body: jsonEncode(data));
      responseJson = _returnResponse(response);
      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  Future<dynamic> post(String url, dynamic data, String tokenId) async {
    dynamic responseJson;
    try {
      final response = await http.post(
          //ToDo - get the url based on the enviornment setup
          Uri.https(ApiUrls.apiBaseUrl, url),
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer $tokenId",
            "Device-Platform": Platform.isAndroid ? "Android" : "iOS",
          },
          body: jsonEncode(data));
      responseJson = _returnResponse(response);

      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  Future<dynamic> postwithoutToken(String url, dynamic data) async {
    dynamic responseJson;
    try {
      final response = await http.post(
          //ToDo - get the url based on the enviornment setup
          Uri.https(ApiUrls.apiBaseUrl, url),
          headers: {"Content-Type": "application/json"},
          body: jsonEncode(data));
      responseJson = _returnResponse(response);
      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  Future<dynamic> posts(String url, String tokenId) async {
    dynamic responseJson;
    try {
      final response = await http.post(
        //ToDo - get the url based on the enviornment setup
        Uri.https(ApiUrls.apiBaseUrl, url),
        headers: {
          "Content-Type": "application/json",
          "Authorization": tokenId,
          "Device-Platform": Platform.isAndroid ? "Android" : "iOS",
        },
      );
      responseJson = _returnResponse(response);
      if (response.statusCode == 503) {
        Get.offAllNamed(RouteName.noService);
      }
    } on SocketException {
      Get.offAllNamed(RouteName.noInternet);
    }
    return responseJson;
  }

  dynamic _returnResponse(http.Response response) {
    switch (response.statusCode) {
      case 200:
        var responseJson =
            response.body.isEmpty ? null : jsonDecode(response.body);
        return responseJson;
      case 201:
        var responseJson =
            response.body.isEmpty ? null : jsonDecode(response.body);
        return responseJson;
      case 400:
        var responseJson =
            response.body.isEmpty ? null : jsonDecode(response.body);
        return responseJson;
      case 401:
        var responseJson =
            response.body.isEmpty ? null : jsonDecode(response.body);
        return responseJson;
      case 403:
        var responseJson =
            response.body.isEmpty ? null : jsonDecode(response.body);
        return responseJson;
      case 404:
        var responseJson =
            response.body.isEmpty ? null : jsonDecode(response.body);
        return responseJson;
      default:
        var responseJson = response.body.isEmpty ? null : null;
        return responseJson;
    }
  }
}
