import 'package:easy_padhai/common/api_helper.dart';
import 'package:easy_padhai/common/api_urls.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/model/batch_model.dart';
import 'package:easy_padhai/model/institution_list_model.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:get/get.dart';

class DashboardController extends GetxController {
  RxBool isLoading = false.obs;
  ApiHelper apiHelper = ApiHelper();
  var currentIndex = 0.obs;

  List<InstitutesList> institutiondataList = [];
  ProfileModel? profileModel;

  RxString instituteId = ''.obs;
  RxString instituteName = ''.obs;

  RxBool isLoading4 = false.obs;

  void changeIndex(int index) {
    if (currentIndex.value == index) return;
    currentIndex.value = index;
    switch (index) {
      case 0:
        Get.offAllNamed(RouteName.teacherHome);
        break;
      case 1:
        // Get.offAllNamed(RouteName.teacherHome);
        break;
      case 2:
        // Get.offAllNamed(RouteName.teacherHome);
        break;
      case 3:
        // Get.offAllNamed(RouteName.teacherHome);
        break;
      case 4:
        Get.offAllNamed(RouteName.profile);
        break;
    }
  }

  void changeIndex1(int index) {
    if (currentIndex.value == index) return;
    currentIndex.value = index;
    switch (index) {
      case 0:
        Get.offAllNamed(RouteName.studentHome);
        break;
      case 1:
        Get.offAllNamed(RouteName.joinBatch);
        break;
      case 2:
        Get.offAllNamed(RouteName.support);
        break;
      case 3:
        Get.offAllNamed(RouteName.profile);
        break;
    }
  }

  getInstitutes() async {
    isLoading4(false);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final countryJson =
        await apiHelper.get(ApiUrls.institutionList, queryParameter, data);
    if (countryJson != null && countryJson != false) {
      InstitutionListModel response =
          InstitutionListModel.fromJson(countryJson);
      if (response.status == true) {
        institutiondataList = response.data!.institutes!;
        isLoading4(true);
        return institutiondataList;
      } else {
        isLoading4(true);
      }
    }
  }

  searchInstitutes(String query) async {
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    String titleLower = '';
    final categoryDataJson =
        await apiHelper.get(ApiUrls.institutionList, queryParameter, data);
    if (categoryDataJson != null) {
      if (categoryDataJson['status'] == true) {
        var response = InstitutionListModel.fromJson(categoryDataJson);
        if (response.status == true) {
          return response.data!.institutes!.map((e) => e).where((e) {
            if (response.data != null) {
              titleLower = e.institutesName!.toLowerCase();
            }
            final searchLower = query.toLowerCase();
            return titleLower.contains(searchLower);
          }).toList();
        }
      }
    }
  }

  getProfile() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.profile, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      ProfileModel response = ProfileModel.fromJson(profileJson);
      if (response.status == true) {
        profileModel = response;
        // Update box storage with profile data
        box.write('username', response.data?.userDetails?.name);
        box.write('email', response.data?.userDetails?.email);
        box.write('propic', response.data?.picture);
        isLoading(false);
        return profileModel;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  postbatch(String cls, String sec, String code) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "subjectId": cls,
      "classId": sec,
      "code": code,
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.post(ApiUrls.crbatch, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      BatchModel response = BatchModel.fromJson(profileJson);
      if (response.status == true) {
        BatchModel dta = response;
        // Update box storage with profile data
        isLoading(false);
        return dta;
      } else {
        Get.snackbar("Message", "Batch code already created!",
            snackPosition: SnackPosition.BOTTOM);
        isLoading(false);
        return response;
      }
    }
    isLoading(false);
  }
}
