import 'package:easy_padhai/services/i_repository.dart';
import 'package:localstorage/localstorage.dart';

class LocalStorageRepository implements ILocalStorageRepository {
  final LocalStorage _storage;

  LocalStorageRepository(String storageKey)
      : _storage = LocalStorage(storageKey);

  @override
  Future getValue(String key) async {
    await _storage.ready;

    return _storage.getItem(key);
  }

  @override
  Future<void> setValue(String key, dynamic value) async {
    await _storage.ready;

    return _storage.setItem(key, value);
  }
}
