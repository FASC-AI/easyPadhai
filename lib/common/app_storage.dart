import 'package:get_storage/get_storage.dart';

var box = GetStorage();

userid() {
  return box.read('userid') ?? '';
}

userRole() {
  return box.read('userRole') ?? '';
}

token() {
  return box.read('token') ?? '';
}

userName() {
  return box.read('username') ?? '';
}

userEmail() {
  return box.read('email') ?? '';
}
