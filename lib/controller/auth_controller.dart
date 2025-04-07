import 'package:easy_padhai/common/api_helper.dart';

import 'package:get/get.dart';


class AuthController extends GetxController {
  RxBool isLoading = false.obs;
  RxString version = ''.obs;
  RxString filter = 'date'.obs;
  ApiHelper apiHelper = ApiHelper();
  RxString userType = ''.obs;
  RxString userName = ''.obs;

  RxBool isLoading1 = false.obs;


 
}
