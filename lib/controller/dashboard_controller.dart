import 'package:easy_padhai/common/api_helper.dart';
import 'package:get/get.dart';


class DashboardController extends GetxController {
  RxBool isLoading = false.obs;
  ApiHelper apiHelper = ApiHelper();
  var currentIndex = 0.obs;

  void changeIndex(int index) {
    currentIndex.value = index;
  }
 
}
