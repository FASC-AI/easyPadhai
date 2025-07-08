import 'package:easy_padhai/auth/google_signin_helper.dart';
import 'package:easy_padhai/common/api_helper.dart';
import 'package:easy_padhai/common/api_urls.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/model/class_list_model.dart';
import 'package:easy_padhai/model/common_model.dart';
import 'package:easy_padhai/model/district_model.dart';
import 'package:easy_padhai/model/ins_model.dart';
import 'package:easy_padhai/model/institution_list_model.dart';
import 'package:easy_padhai/model/login_model.dart';
import 'package:easy_padhai/model/register_model.dart';
import 'package:easy_padhai/model/section_list_model.dart';
import 'package:easy_padhai/model/simple_model.dart';
import 'package:easy_padhai/model/state_model.dart';
import 'package:easy_padhai/model/subject_list_model.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_sign_in/google_sign_in.dart';

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
  RxString stateId = ''.obs;
  RxString stateName = ''.obs;
  RxString districtId = ''.obs;
  RxString districtName = ''.obs;

  List<ClassesData> classesdataList = [];
  List<SectionData> sectiondataList = [];
  List<SubjectList> subjectdataList = [];
  List<InstitutesList> institutiondataList = [];
  List<List1> stateList = [];
  List<List2> districtList = [];

  var selectedClassIds = <String>[].obs;
  var selectedSectionIds = <String>[].obs;
  var selectedSubjectIds = <String>[].obs;

  RxBool isLoading1 = false.obs;
  RxBool isLoading2 = false.obs;
  RxBool isLoading3 = false.obs;
  RxBool isLoading4 = false.obs;
  RxBool isLoading5 = false.obs;
  RxString forgetEmail = ''.obs;

  @override
  void onInit() {
    // TODO: implement onInit
    super.onInit();
    if (classesdataList.isEmpty) {
      getClassList('');
    }
    getsubjectList('');
    if (sectiondataList.isEmpty) {
      getsectionList('');
    }
  }

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

  resetMpin(String email, String mpin) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {"email": email, "mpin": mpin};
    final profileJson =
        await apiHelper.post(ApiUrls.postmpin, queryParameter, data);
    print(queryParameter);
    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      if (response.status == true) {
        // print(response.message);
        Get.snackbar(
          '',
          '',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.transparent,
          titleText: const SizedBox.shrink(),
          messageText: const Text(
            "MPIN reset successfully",
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
            ),
          ),
        );
        Get.offAllNamed(RouteName.login);
        isLoading(false);
        return response;
      } else {
        isLoading(false);
      }
    } else {}
    isLoading(false);
  }

  googleSignin(String method) async {
    isLoading1.value = true;
    final User? user = await _googleSignInHelper.signInWithGoogle();
    if (user != null) {
      dynamic queryParameters = {
        "email": user.email,
        "name": user.displayName,
        "picture": user.photoURL,
        "signInMethod": method
      };
      final signUpJson = await apiHelper.postwithoutToken(
          ApiUrls.googleLogin, queryParameters);
      if (signUpJson != null) {
        RegisterModel response = RegisterModel.fromJson(signUpJson);
        if (response.code == 200) {
          userId.value = response.data!.id!;
          userName.value = response.data!.name!;
          box.write('username', response.data!.name!);
          box.write('userid', response.data!.id!);
          response.data!.isMpinSet == true
              ? Get.toNamed(RouteName.verifyMpin)
              : Get.toNamed(RouteName.setMPin);

          isLoading1.value = false;
          return response;
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
          return response;
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

  emailSignin(String method, String email) async {
    isLoading.value = true;
    if (email.isNotEmpty) {
      dynamic queryParameters = {"email": email, "signInMethod": method};
      final signUpJson = await apiHelper.postwithoutToken(
          ApiUrls.googleLogin, queryParameters);
      if (signUpJson != null) {
        RegisterModel response = RegisterModel.fromJson(signUpJson);
        print(response.code);
        if (response.code == 200) {
          userId.value = response.data!.id!;
          userName.value = response.data!.name!;
          box.write('username', response.data!.name!);
          box.write('userid', response.data!.id!);
          isLoading.value = false;
          return response;
        } else if (response.code == 401) {
          isLoading.value = false;
          Get.snackbar("Message", response.message!,
              snackPosition: SnackPosition.BOTTOM);
        } else {
          isLoading.value = false;
          return response;
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
        isLoading.value = false;
      }
    }
  }

  postSetVerifymPin(String mPin) async {
    isLoading.value = true;
    userId.value = userid();
    print("userId: $userId");

    dynamic queryParameters = {"mpin": mPin};
    final signUpJson = await apiHelper.postwithoutToken(
        "${ApiUrls.setverifyMpin}$userId", queryParameters);
    if (signUpJson != null && signUpJson != false) {
      LoginModel response = LoginModel.fromJson(signUpJson);
      if (response.status == true) {
        box.write('token', response.data!.token);
        box.write('username', response.data!.name!.english);
        box.write('email', response.data!.email);
        box.write('userRole', response.data!.userRole);
        box.write('propic', response.data!.picture);
        print("userEmail:  ${userEmail()}");
        response.data!.isProfileSet!.classSet == false
            ? {await getClassList(''), Get.toNamed(RouteName.classSelect)}
            :
            // response.data!.isProfileSet!.section == false
            //     ? Get.toNamed(RouteName.sectionSelect)
            response.data!.isProfileSet!.subject == false
                ? Get.toNamed(RouteName.subjectSelect)
                : response.data!.userRole == "teacher"
                    ? response.data!.isProfileSet!.institution == false
                        ? Get.toNamed(RouteName.selectInstitution)
                        : {
                            Get.lazyPut(() => DashboardController()),
                            box.write('username', response.data!.name!.english),
                            box.write('email', response.data!.email),
                            box.write('userRole', response.data!.userRole),
                            box.write('propic', response.data!.picture),
                            Get.offAllNamed(RouteName.teacherHome)
                          }
                    : {
                        Get.lazyPut(() => DashboardController()),
                        box.write('username', response.data!.name!.english),
                        box.write('email', response.data!.email),
                        box.write('userRole', response.data!.userRole),
                        box.write('propic', response.data!.picture),
                        Get.offAllNamed(RouteName.studentHome)
                      };

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

  postInstitution(
    String name,
    String type,
    String add1,
    String add2,
    String state,
    String district,
    String pin,
    String inscode,
  ) async {
    isLoading1(false);

    Map<String, dynamic>? queryParams = {
      "institutesName": name,
      "instituteType": type,
      "address": {
        "pinCode": pin,
        "address1": add1,
        "address2": add2,
        "stateId": state,
        "districtId": district,
      },
      "codee": inscode,
      "isActive": false,
      "isVerified": false
    };

    print(queryParams);

    final countryJson =
        await apiHelper.postwithoutToken(ApiUrls.addIns, queryParams);
    if (countryJson != null && countryJson != false) {
      InstituteModel response = InstituteModel.fromJson(countryJson);
      if (response.status == true) {
        isLoading1(true);
        return response;
      } else {
        isLoading1(true);
      }
    }
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
    Map<String, dynamic>? queryParameter = {"isActive": "true"};
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
    Map<String, dynamic>? queryParameter = {
      "search": query,
      "isActive": "true"
    };
    String titleLower = '';
    final categoryDataJson =
        await apiHelper.get(ApiUrls.institutionList, queryParameter, data);
    // print(queryParameter);
    if (categoryDataJson != null) {
      if (categoryDataJson['status'] == true) {
        var response = InstitutionListModel.fromJson(categoryDataJson);
        // print(response);
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
    Map<String, dynamic>? queryParameter = {"limit": "1000"};
    final countryJson =
        await apiHelper.get(ApiUrls.stateList, queryParameter, data);
    if (countryJson != null && countryJson != false) {
      StateModel response = StateModel.fromJson(countryJson);
      if (response.status == true) {
        stateList = response.data!.list!;
        isLoading5(true);
        return stateList;
      } else {
        isLoading5(true);
      }
    }
  }

  searchStates(String query) async {
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {"search": query};
    String titleLower = '';
    final categoryDataJson =
        await apiHelper.get(ApiUrls.stateList, queryParameter, data);
    // print(queryParameter);
    if (categoryDataJson != null) {
      if (categoryDataJson['status'] == true) {
        var response = StateModel.fromJson(categoryDataJson);
        // print(response);
        if (response.status == true) {
          return response.data!.list!.map((e) => e).where((e) {
            if (response.data != null) {
              titleLower = e.name!.english!.toLowerCase();
            }
            final searchLower = query.toLowerCase();
            return titleLower.contains(searchLower);
          }).toList();
        }
      }
    }
  }

  getdistrictList() async {
    isLoading5(false);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {"limit": "1000"};
    final countryJson =
        await apiHelper.get(ApiUrls.district, queryParameter, data);
    if (countryJson != null && countryJson != false) {
      DistrictModel response = DistrictModel.fromJson(countryJson);
      if (response.status == true) {
        districtList = response.data!.list!;
        isLoading5(true);
        return districtList;
      } else {
        isLoading5(true);
      }
    }
  }

  searchDistrict(String query) async {
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "search": query,
    };
    String titleLower = '';
    final categoryDataJson =
        await apiHelper.get(ApiUrls.district, queryParameter, data);
    if (categoryDataJson != null) {
      if (categoryDataJson['status'] == true) {
        var response = DistrictModel.fromJson(categoryDataJson);
        if (response.status == true) {
          return response.data!.list!.map((e) => e).where((e) {
            if (response.data != null) {
              titleLower = e.name!.english!.toLowerCase();
            }
            final searchLower = query.toLowerCase();
            return titleLower.contains(searchLower);
          }).toList();
        }
      }
    }
  }

  postUpdateAuthInfo(String type) async {
    isLoading.value = true;
    dynamic data;
    data = await token();
    if (data != null) {
      dynamic queryParameters = {};
      type == 'class'
          ? queryParameters = {
              "classId": selectedClassIds,
            }
          :
          // type == "section"
          //     ? queryParameters = {
          //         "sections": selectedSectionIds,
          //       }
          //     :
          type == "subject"
              ? queryParameters = {
                  "subjectId": selectedSubjectIds,
                }
              : type == "institute"
                  ? queryParameters = {
                      "institution": instituteId.value,
                    }
                  : queryParameters = {};

      final signUpJson =
          await apiHelper.post(ApiUrls.updateProfile, queryParameters, data);
      if (signUpJson != null && signUpJson != false) {
        CommonModel response = CommonModel.fromJson(signUpJson);
        print(response.message);
        if (response.status == true) {
          isLoading.value = false;

          type == 'class'
              // ? Get.toNamed(RouteName.sectionSelect)
              // :
              //  type == "section"
              ? Get.toNamed(RouteName.subjectSelect)
              : type == "subject" && response.data!.role == "teacher"
                  ? Get.toNamed(RouteName
                      .selectInstitution) // have to chk student or teacher
                  : type == "institute"
                      ? {
                          Get.lazyPut(() => DashboardController()),
                          Get.offAllNamed(RouteName.teacherHome)
                        }
                      // : queryParameters = {}
                      : {
                          Get.lazyPut(() => DashboardController()),
                          Get.offAllNamed(RouteName.studentHome)
                        };
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
    isLoading.value = false;
  }

  postinstitute(String name, String type, String add1, String add2,
      String stateid, String distid, String pin, String code) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "institutesName": name,
      "instituteType": type,
      "address1": add1,
      "address2": add2,
      "stateId": stateid,
      "districtId": distid,
      "pinCode": pin,
      "codee": code
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.post(ApiUrls.crins, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      InstituteModel response = InstituteModel.fromJson(profileJson);
      if (response.status == true) {
        InstituteModel dta = response;
        // Update box storage with profile data
        isLoading(false);
        return dta;
      } else {
        Get.snackbar("Message", response.message!,
            snackPosition: SnackPosition.BOTTOM);
        isLoading(false);
        return response;
      }
    }
    isLoading(false);
  }
}
