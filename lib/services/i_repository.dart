abstract class ILocalStorageRepository {
  Future<dynamic> getValue(String key);
  Future<void> setValue(String key, dynamic item);
}
