
import 'package:easy_padhai/services/local_storage_repository.dart';

class LocalStorageService {
  LocalStorageRepository? _localrepository;
  LocalStorageRepository? _localrepositorytoken;
  LocalStorageRepository? _localrepositoryuser;

  LocalStorageService() {
    _localrepository = LocalStorageRepository('authData');
    _localrepositorytoken = LocalStorageRepository('authToken');
    _localrepositoryuser = LocalStorageRepository('authUser');
  }

  Future<void> setLocalAuthData(var data) async {
    await _localrepository!.setValue("authData", data);
  }

  Future<dynamic> getLocalAuthData() async {
    return _localrepository!.getValue("authData");
  }

  Future<void> setLocalAuthToken(var data) async {
    await _localrepositorytoken!.setValue("authToken", data);
  }

  Future<dynamic> getLocalAuthToken() async {
    return _localrepositorytoken!.getValue("authToken");
  }

  Future<void> setLocalAuthUser(var data) async {
    await _localrepositoryuser!.setValue("authUser", data);
  }

  Future<dynamic> getLocalAuthUser() async {
    return _localrepositoryuser!.getValue("authUser");
  }
}
