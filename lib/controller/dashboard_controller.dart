import 'package:easy_padhai/common/api_helper.dart';
import 'package:easy_padhai/common/api_urls.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/model/banner_model.dart';
import 'package:easy_padhai/model/batch_model.dart';
import 'package:easy_padhai/model/batchlist_model.dart';
import 'package:easy_padhai/model/batchreq.dart';
import 'package:easy_padhai/model/binfo.dart';
import 'package:easy_padhai/model/institution_list_model.dart';
import 'package:easy_padhai/model/noti_model.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:easy_padhai/model/simple_model.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:get/get.dart';

class DashboardController extends GetxController {
  RxBool isLoading = false.obs;
  ApiHelper apiHelper = ApiHelper();
  var currentIndex = 0.obs;

  List<InstitutesList> institutiondataList = [];
  List<Banners> Bannerlist = [];
  List<Notifications> tNoti = [];
  List<BRData> uBat = [];
  List<BRData> tBat = [];
  List<Notifications> uNoti = [];
  ProfileModel? profileModel;
  List<BbData> batchlist = [];
  RxString instituteId = ''.obs;
  RxString instituteName = ''.obs;

  RxBool isLoading4 = false.obs;

  @override
  void onInit() {
    // TODO: implement onInit
    super.onInit();
    // getBanners();
    // getNotification();
    // getBatch();
  }

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

  getBanners() async {
    isLoading4(false);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final countryJson =
        await apiHelper.get(ApiUrls.bannerList, queryParameter, data);
    if (countryJson != null && countryJson != false) {
      BannerModel response = BannerModel.fromJson(countryJson);
      if (response.status == true) {
        Bannerlist = response.data!.banners!;
        isLoading4(true);
        return Bannerlist;
      } else {
        isLoading4(true);
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
        box.write('userRole', response.data!.userDetails?.role);
        box.write('propic', response.data?.picture);
        isLoading(false);
        return profileModel;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  getNotification() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson = await apiHelper.get(ApiUrls.noti, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      NotifModel response = NotifModel.fromJson(profileJson);
      if (response.status == true) {
        tNoti.clear();
        uNoti.clear();
        List<Notifications> list = response.data!.notifications!;
        for (int i = 0; i < list.length; i++) {
          if (list[i].type == "teacher") {
            tNoti.add(list[i]);
          } else {
            uNoti.add(list[i]);
          }
        }

        isLoading(false);
        return list;
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
      "classId": cls,
      "sectionId": sec,
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

  postbatchinfo(String code) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "batchCode": code,
    };
    //  print(queryParameter);
    final profileJson =
        await apiHelper.post(ApiUrls.binfo, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      BinfoModel response = BinfoModel.fromJson(profileJson);
      if (response.status == true) {
        BinfoModel dta = response;
        // Update box storage with profile data
        isLoading(false);
        return dta;
      } else {
        // Get.snackbar("Message", "Wrong Batch code!",
        //     snackPosition: SnackPosition.BOTTOM);
        isLoading(false);
        return response;
      }
    }
    isLoading(false);
  }

  postbatchreq(String code) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "code": code,
    };
    //  print(queryParameter);
    final profileJson =
        await apiHelper.post(ApiUrls.breq, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      BinfoModel response = BinfoModel.fromJson(profileJson);
      print(response.message);
      if (response.status == true) {
        BinfoModel dta = response;
        // Update box storage with profile data

        isLoading(false);
        return dta;
      } else {
        Get.snackbar("Message", "Something went wrong, try again later!",
            snackPosition: SnackPosition.BOTTOM);
        isLoading(false);
        return response;
      }
    }
    isLoading(false);
  }

  getBatchReq() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.breqget, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      BatchReqModel response = BatchReqModel.fromJson(profileJson);
      if (response.status == true) {
        List<BRData> batchlist = response.data!;
        // Update box storage with profile data
        tBat.clear();
        uBat.clear();

        for (int i = 0; i < batchlist.length; i++) {
          if (batchlist[i].userRole == "teacher") {
            tBat.add(batchlist[i]);
          } else {
            uBat.add(batchlist[i]);
          }
        }
        isLoading(false);
        return batchlist;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  Approvebatchreq(bool code, String id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "approve": code,
    };
    //  print(queryParameter);
    final profileJson =
        await apiHelper.patch(ApiUrls.breqapprove + id, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      print(response.message);
      if (response.status == true) {
        SimpleModel dta = response;
        // Update box storage with profile data

        isLoading(false);
        return dta;
      } else {
        Get.snackbar("Message", "Something went wrong, try again later!",
            snackPosition: SnackPosition.BOTTOM);
        isLoading(false);
        return response;
      }
    }
    isLoading(false);
  }

  getBatch() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.batchlist, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      BatchlistModel response = BatchlistModel.fromJson(profileJson);
      if (response.status == true) {
        batchlist = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return batchlist;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }
}
