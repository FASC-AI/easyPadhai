import 'package:easy_padhai/common/api_helper.dart';
import 'package:easy_padhai/common/api_urls.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/model/banner_model.dart';
import 'package:easy_padhai/model/batch_model.dart';
import 'package:easy_padhai/model/batchlist_model.dart';
import 'package:easy_padhai/model/batchreq.dart';
import 'package:easy_padhai/model/binfo.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/current_test_model.dart';
import 'package:easy_padhai/model/home_noti_model.dart';
import 'package:easy_padhai/model/homework_model1.dart';
import 'package:easy_padhai/model/homework_model2.dart';
import 'package:easy_padhai/model/homework_model3.dart';
import 'package:easy_padhai/model/institution_list_model.dart';
import 'package:easy_padhai/model/joinedModel.dart';
import 'package:easy_padhai/model/lesson_model.dart';
import 'package:easy_padhai/model/noti_model.dart';
import 'package:easy_padhai/model/notification_model.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:easy_padhai/model/question_model.dart';
import 'package:easy_padhai/model/simple_model.dart';
import 'package:easy_padhai/model/topic_model.dart';
import 'package:easy_padhai/model/tpupdate_model.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:get/get.dart';

class DashboardController extends GetxController {
  RxBool isLoading = false.obs;
  ApiHelper apiHelper = ApiHelper();
  var currentIndex = 0.obs;
  var currentIndex1 = 0.obs;
  List<InstitutesList> institutiondataList = [];
  List<Banners> Bannerlist = [];
  List<Notifications> tNoti = [];
  List<BRData> uBat = [];
  List<BRData> tBat = [];
  List<Notifications> uNoti = [];
  ProfileModel? profileModel;
  List<BbData> batchlist = [];
  Data? topic;
  List<Books> booklist = [];
  List<Homework> queslist = [];
  List<HomeworkModel3Data> prevHlist = [];
  List<HomeworkModel2Data> homeworkList = [];
  List<OnlineQuesmodelData> quesList = [];
  List<NData1> stuNotilist = [];
  List<OnlineTestModel1Data> testList = [];
  List<CurrentTestModelData> CurrTest = [];
  List<LData> lessonlist = [];
  RxString instituteId = ''.obs;
  RxString instituteName = ''.obs;
  RxBool isJoined = false.obs;
  RxBool isLoading4 = false.obs;
  BatchId? batchData;

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
    if (currentIndex1.value == index) return;
    currentIndex1.value = index;
    switch (index) {
      case 0:
        Get.offAllNamed(RouteName.studentHome);
        break;
      case 1:
        Get.offAllNamed(RouteName.joinBatch);
        break;
      case 2:
        //Get.offAllNamed(RouteName.support);
        break;
      case 3:
        Get.offAllNamed(RouteName.profile);
        break;
    }
  }

  void changeIndex3(int index) {
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
      print(response.code);
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

  postbatchreq(String code, String name, String roll) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "code": code,
      "rollNo": roll,
    };
    print(queryParameter);
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

  getBook(String id, String clsid) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {"subjectId": id, "classId": clsid};
    final profileJson =
        await apiHelper.get(ApiUrls.getbook, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      BookModel response = BookModel.fromJson(profileJson);
      if (response.status == true) {
        booklist = response.data!.books!;
        // Update box storage with profile data

        isLoading(false);
        return booklist;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  getLesson(String bookid, String subid) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "bookId": bookid,
      "subjectId": subid
    };
    final profileJson =
        await apiHelper.get(ApiUrls.getlesson, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      LessonModel response = LessonModel.fromJson(profileJson);
      if (response.status == true) {
        lessonlist = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return lessonlist;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  getTopic(String id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.gettopic + id, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      TopicModel response = TopicModel.fromJson(profileJson);
      if (response.status == true) {
        topic = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return topic;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  getTopicUpdate(String id, String lesson_id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "lessonId": lesson_id,
      "topicId": id,
      "status": true
    };
    final profileJson =
        await apiHelper.patch(ApiUrls.updatetopic, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      TpupdateModel response = TpupdateModel.fromJson(profileJson);
      if (response.status == true) {
        //topic = response.data!;
        // Update box storage with profile data
        print("Topic updated:" + response.message!);
        isLoading(false);
        return response;
      } else {
        isLoading(false);
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

  getHWQbyTopic(String id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "topicId": id,
    };
    final profileJson =
        await apiHelper.get(ApiUrls.getques, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      HomeworkModel1 response = HomeworkModel1.fromJson(profileJson);
      if (response.status == true) {
        queslist = response.data!.homework!;
        // Update box storage with profile data

        isLoading(false);
        return queslist;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  getPHWQbyTopic(String id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "topicId": id,
    };
    final profileJson =
        await apiHelper.get(ApiUrls.getprevques, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      HomeworkModel3 response = HomeworkModel3.fromJson(profileJson);
      if (response.status == true) {
        prevHlist = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return prevHlist;
      } else {
        prevHlist = [];
        isLoading(false);
      }
    } else {
      prevHlist = [];
    }

    isLoading(false);
  }

  updateHomework(List<String> ids, String date) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "ids": ids,
      "publishedDate": date,
    };
    final profileJson =
        await apiHelper.patch(ApiUrls.uphome, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      TpupdateModel response = TpupdateModel.fromJson(profileJson);
      if (response.status == true) {
        //topic = response.data!;
        // Update box storage with profile data
        Get.snackbar("Message", response.message!,
            snackPosition: SnackPosition.BOTTOM);
        print("Topic updated:" + response.message!);
        isLoading(false);
        return response;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  getbatchjoined() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.getJbat, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      Joinedmodel response = Joinedmodel.fromJson(profileJson);
      if (response.status == true) {
        isJoined.value = response.data!.approve!;
        // Update box storage with profile data
        batchData = response.data!.batchId!;
        isLoading(false);
        return response.data!;
      } else {
        isLoading(false);
        isJoined.value = false;
      }
    } else {
      isJoined.value = false;
    }
    isLoading(false);
  }

  getStuHomework(String subid, String classid, String secid) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "subjectId": subid,
      "classId": classid,
      "sections": secid
    };
    final profileJson = await apiHelper.get(ApiUrls.geth, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      HomeworkModel2 response = HomeworkModel2.fromJson(profileJson);
      if (response.status == true) {
        homeworkList = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return homeworkList;
      } else {
        homeworkList = [];
        isLoading(false);
      }
    } else {
      homeworkList = [];
    }
    isLoading(false);
  }

  getOnlineQ1(String classid, String subid, String bookid, String lesson,
      String topic) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": classid,
      "subjectId": subid,
      "bookId": bookid,
      "lessonId": lesson,
      "topicId": topic
    };
    final profileJson =
        await apiHelper.get(ApiUrls.getq1, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      OnlineQuesmodel response = OnlineQuesmodel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message);
        quesList = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return quesList;
      } else {
        quesList = [];
        isLoading(false);
      }
    } else {
      quesList = [];
    }
    isLoading(false);
  }

  updateQuestion(
      List<String> ids, String date, String time, String duration) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "ids": ids,
      "publishedDate": date,
      "publishedTime": time,
      "duration": duration
    };
    final profileJson =
        await apiHelper.patch(ApiUrls.updateq1, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      TpupdateModel response = TpupdateModel.fromJson(profileJson);
      if (response.status == true) {
        //topic = response.data!;
        // Update box storage with profile data
        Get.snackbar("Message", response.message!,
            snackPosition: SnackPosition.BOTTOM);
        print("Question updated:" + response.message!);
        isLoading(false);
        return response;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  getStuNoti() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.stuNoti, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      NotificationModel response = NotificationModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message);
        stuNotilist = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return stuNotilist;
      } else {
        stuNotilist = [];
        isLoading(false);
      }
    } else {
      stuNotilist = [];
    }
    isLoading(false);
  }

  getAllPubTest() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.getAllTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      OnlineTestModel1 response = OnlineTestModel1.fromJson(profileJson);
      if (response.status == true) {
        print(response.message);
        testList = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return testList;
      } else {
        testList = [];
        isLoading(false);
      }
    } else {
      testList = [];
    }
    isLoading(false);
  }

  getCurrTest() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.getCurrTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      CurrentTestModel response = CurrentTestModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message);
        if (response.data!.isNotEmpty) {
          CurrTest = response.data!;
        } else {
          Get.snackbar("Message", response.message!,
              snackPosition: SnackPosition.BOTTOM);
        }
        // Update box storage with profile data

        isLoading(false);
        return CurrTest;
      } else {
        isLoading(false);
      }
    } else {}
    isLoading(false);
  }
}
