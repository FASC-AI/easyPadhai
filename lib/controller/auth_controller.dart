import 'package:easy_padhai/auth/google_signin_helper.dart';
import 'package:easy_padhai/common/api_helper.dart';
import 'package:easy_padhai/common/api_urls.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/model/class_list_model.dart';
import 'package:easy_padhai/model/institution_list_model.dart';
import 'package:easy_padhai/model/login_model.dart';
import 'package:easy_padhai/model/register_model.dart';
import 'package:easy_padhai/model/section_list_model.dart';
import 'package:easy_padhai/model/subject_list_model.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AuthController extends GetxController {
  final GoogleSignInHelper _googleSignInHelper = GoogleSignInHelper();

  RxBool isLoading = false.obs;
  RxString version = ''.obs;
  RxString filter = 'date'.obs;
  ApiHelper apiHelper = ApiHelper();
  RxString userType = ''.obs;
  RxString userName = ''.obs;
  RxString userId = ''.obs;
  RxString instituteId = ''.obs;
  RxString instituteName = ''.obs;

  List<ClassesData> classesdataList = [];
  List<SectionData> sectiondataList = [];
  List<SubjectList> subjectdataList = [];
  List<InstitutesList> institutiondataList = [];

  var selectedClassIds = <String>[].obs;
  var selectedSectionIds = <String>[].obs;
  var selectedSubjectIds = <String>[].obs;

  RxBool isLoading1 = false.obs;
  RxBool isLoading2 = false.obs;
  RxBool isLoading3 = false.obs;
  RxBool isLoading4 = false.obs;
    RxBool isLoading5 = false.obs;


  void toggleClassSelection(String classId) {
    if (selectedClassIds.contains(classId)) {
      selectedClassIds.remove(classId);
    } else {
      selectedClassIds.add(classId);
    }
  }

  void toggleSectionSelection(String sectionId) {
    if (selectedSectionIds.contains(sectionId)) {
      selectedSectionIds.remove(sectionId);
    } else {
      selectedSectionIds.add(sectionId);
    }
  }

  void toggleSubjectSelection(String subjectId) {
    if (selectedSubjectIds.contains(subjectId)) {
      selectedSubjectIds.remove(subjectId);
    } else {
      selectedSubjectIds.add(subjectId);
    }
  }

  Future<void> googleSignin() async {
    isLoading1.value = true;
    final User? user = await _googleSignInHelper.signInWithGoogle();
    if (user != null) {
      dynamic queryParameters = {
        "email": user.email,
        "name": user.displayName,
        "picture": user.photoURL
      };
      final signUpJson = await apiHelper.postwithoutToken(
          ApiUrls.googleLogin, queryParameters);
      if (signUpJson != null) {
        RegisterModel response = RegisterModel.fromJson(signUpJson);
        if (response.code == 200) {
          userId.value = response.data!.id!;
          userName.value = response.data!.name!;

          response.data!.isMpinSet == true
              ? Get.toNamed(RouteName.verifyMpin)
              : Get.toNamed(RouteName.setMPin);

          isLoading1.value = false;
        } else {
          Get.snackbar(
            '',
            '',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: AppColors.red,
            titleText: const SizedBox.shrink(),
            messageText: Text(
              response.message.toString(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
              ),
            ),
          );
          isLoading1.value = false;
        }
      } else {
        Get.snackbar(
          '',
          '',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red,
          titleText: const SizedBox.shrink(),
          messageText: const Text(
            'Please try again!',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
            ),
          ),
        );
        isLoading1.value = false;
      }
    }
  }

  postSetVerifymPin(String mPin) async {
    isLoading.value = true;

    dynamic queryParameters = {"mpin": mPin};
    final signUpJson = await apiHelper.postwithoutToken(
        "${ApiUrls.setverifyMpin}$userId", queryParameters);
    if (signUpJson != null && signUpJson != false) {
      LoginModel response = LoginModel.fromJson(signUpJson);
      if (response.status == true) {
        box.write('token', response.data!.token);

        response.data!.isProfileSet!.classSet == false
            ? {await getClassList(''), Get.toNamed(RouteName.classSelect)}
            : response.data!.isProfileSet!.section == false
                ? Get.toNamed(RouteName.sectionSelect)
                : response.data!.isProfileSet!.subject == false
                    ? Get.toNamed(RouteName.subjectSelect)
                    : response.data!.userRole == "Teacher"
                        ? response.data!.isProfileSet!.institution == false
                            ? Get.toNamed(RouteName.selectInstitution)
                            : Get.offAllNamed(RouteName.teacherHome)
                        : Get.offAllNamed(RouteName.teacherHome);

        isLoading.value = false;
      } else {
        Get.snackbar(
          '',
          '',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red,
          titleText: const SizedBox.shrink(),
          messageText: Text(
            response.message.toString(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
            ),
          ),
        );
        isLoading.value = false;
      }
    }

    isLoading.value = false;
  }

  getClassList(String search) async {
    isLoading1(false);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParams = {"search": search};
    final countryJson =
        await apiHelper.get(ApiUrls.classList, queryParams, data);
    if (countryJson != null && countryJson != false) {
      ClassListModel response = ClassListModel.fromJson(countryJson);
      if (response.status == true) {
        classesdataList = response.data?.classes ?? [];

        isLoading1(true);
        return classesdataList;
      } else {
        isLoading1(true);
      }
    }
  }

  getsectionList(String search) async {
    isLoading2(false);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParams = {"search": search};
    final countryJson =
        await apiHelper.get(ApiUrls.sectionList, queryParams, data);
    if (countryJson != null && countryJson != false) {
      SectionListModel response = SectionListModel.fromJson(countryJson);
      if (response.status == true) {
        sectiondataList = response.data?.section ?? [];

        isLoading2(true);
        return sectiondataList;
      } else {
        isLoading2(true);
      }
    }
  }

  getsubjectList(String search) async {
    isLoading3(false);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParams = {"search": search};
    final countryJson =
        await apiHelper.get(ApiUrls.subjectList, queryParams, data);
    if (countryJson != null && countryJson != false) {
      SubjectListModel response = SubjectListModel.fromJson(countryJson);
      if (response.status == true) {
        subjectdataList = response.data?.subject ?? [];

        isLoading3(true);
        return subjectdataList;
      } else {
        isLoading3(true);
      }
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

  getStateList() async {
    isLoading5(false);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final countryJson =
        await apiHelper.get(ApiUrls.stateList, queryParameter, data);
    if (countryJson != null && countryJson != false) {
      InstitutionListModel response =
          InstitutionListModel.fromJson(countryJson);
      if (response.status == true) {
        institutiondataList = response.data!.institutes!;
        isLoading5(true);
        return institutiondataList;
      } else {
        isLoading5(true);
      }
    }
  }

  searchState(String query) async {
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    String titleLower = '';
    final categoryDataJson =
        await apiHelper.get(ApiUrls.stateList, queryParameter, data);
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


}
