import 'package:easy_padhai/services/local_storage_repository.dart';
import 'package:flutter/material.dart';

class ManuPageService {
  final LocalStorageRepository _localStorageRepository =
      LocalStorageRepository("selectedLanguage");
  final LocalStorageRepository _localStorage =
      LocalStorageRepository("selectedAuth");

  Future<Locale> setLocale(String languageCode) async {
    await _localStorageRepository.setValue(LAGUAGE_CODE, languageCode);
    return _locale(languageCode);
  }

  Future<Locale> getLocale() async {
    String languageCode =
        await _localStorageRepository.getValue(LAGUAGE_CODE) ?? "en";

    return _locale(languageCode);
  }

  Future<void> setAuthentication(bool isAuthentication) async {
    await _localStorage.setValue("selectedAuth", isAuthentication);
  }

  Future<bool> getAuthentication() async {
    var authValue = await _localStorage.getValue("selectedAuth") ?? false;
    return authValue;
  }

  Locale _locale(String languageCode) {
    switch (languageCode) {
      case ENGLISH:
        return const Locale(ENGLISH, 'US');
      case HINDI:
        return const Locale(HINDI, "IN");
      default:
        return const Locale(ENGLISH, 'US');
    }
  }
}

// ignore: constant_identifier_names
const String ENGLISH = 'en';
// ignore: constant_identifier_names
const String HINDI = 'hi';
// ignore: constant_identifier_names
const String CHINESE = 'zh';
// ignore: constant_identifier_names
const String SPANISH = 'es';
// ignore: constant_identifier_names
const String ARABIC = 'ar';
// ignore: constant_identifier_names
const String RUSSIAN = 'ru';
// ignore: constant_identifier_names
const String JAPANESE = 'ja';
// ignore: constant_identifier_names
const String DEUTSCH = 'de';

// ignore: constant_identifier_names
const String LAGUAGE_CODE = 'languageCode';
