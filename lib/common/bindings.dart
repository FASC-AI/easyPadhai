import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:get/get.dart';


class RootBinding implements Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => AuthController());
  
  }
}
