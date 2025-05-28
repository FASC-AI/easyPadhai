import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:easy_padhai/common/api_helper.dart';
import 'package:easy_padhai/common/api_urls.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/dashboard/stu_online_test.dart';
import 'package:easy_padhai/model/banner_model.dart';
import 'package:easy_padhai/model/batch_model.dart';
import 'package:easy_padhai/model/batchlist_model.dart';
import 'package:easy_padhai/model/batchreq.dart';
import 'package:easy_padhai/model/binfo.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/bstudent_model.dart';
import 'package:easy_padhai/model/current_test_model.dart';
import 'package:easy_padhai/model/home_noti_model.dart';
import 'package:easy_padhai/model/homework_model1.dart';
import 'package:easy_padhai/model/homework_model2.dart';
import 'package:easy_padhai/model/homework_model3.dart';
import 'package:easy_padhai/model/image_model.dart';
import 'package:easy_padhai/model/institution_list_model.dart';
import 'package:easy_padhai/model/joinedModel.dart';
import 'package:easy_padhai/model/lesson_model.dart';
import 'package:easy_padhai/model/lesson_test_model.dart';
import 'package:easy_padhai/model/noti_model.dart';
import 'package:easy_padhai/model/notification_model.dart';
import 'package:easy_padhai/model/offline_test_model.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:easy_padhai/model/prev_test_model.dart';
import 'package:easy_padhai/model/pro_update_model.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:easy_padhai/model/question_model.dart';
import 'package:easy_padhai/model/simple_model.dart';
import 'package:easy_padhai/model/submit_test_model.dart';
import 'package:easy_padhai/model/test_marks_model.dart';
import 'package:easy_padhai/model/time_model.dart';
import 'package:easy_padhai/model/topic_model.dart';
import 'package:easy_padhai/model/tpupdate_model.dart';
import 'package:easy_padhai/model/video_clip_model.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'package:image/image.dart' as img;

import 'package:path/path.dart' as path;

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
  List<GroupedTests> OffquesList = [];
  List<NData1> stuNotilist = [];
  List<OnlineTestModel1Data> testList = [];
  List<CurrentTestModelData> CurrTest = [];
  List<PrevTestModelData> prevTest = [];
  List<StudentModelData> studentList = [];
  String currTime = "";
  List<LData> lessonlist = [];
  RxString instituteId = ''.obs;
  RxString instituteName = ''.obs;
  RxBool isJoined = false.obs;
  RxBool isLoading4 = false.obs;
  BatchId? batchData;
  List<LessonTestModelData> lessonQList = [];
  List<TestMarksModelData> marksList = [];
  VideoClipModelData? vidList;

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
          if (list[i].type![0].nameEn == "teacher") {
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
        Get.snackbar("Message", response.message!,
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
        Get.snackbar("Message", response.message!,
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

  submitCurrTest(List<Map<String, dynamic>> resp, String pubDate,
      String pubTime, String duration, String clsId, String subId) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "test": resp,
      "publishedDate": pubDate,
      "publishedTime": pubTime,
      "duration": duration,
      "classId": clsId,
      "subjectId": subId
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.post(ApiUrls.submitTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      SubmitTestModel response = SubmitTestModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message);
        Get.snackbar("Message", response.message!,
            snackPosition: SnackPosition.BOTTOM);
        // Update box storage with profile data
        // Get.offAllNamed(RouteName.studentHome);

        isLoading(false);
        return response;
      } else {
        isLoading(false);
      }
    } else {}
    isLoading(false);
  }

  getPrevTest() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.prevTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      PrevTestModel response = PrevTestModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message);
        prevTest = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return prevTest;
      } else {
        prevTest = [];
        isLoading(false);
      }
    } else {
      prevTest = [];
    }
    isLoading(false);
  }

  getOfflineQ1(String classid, String subid, String bookid, String lesson,
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
        await apiHelper.get(ApiUrls.offlineTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      OfflineTestModel response = OfflineTestModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message);
        OffquesList = response.data!.groupedTests!;
        // Update box storage with profile data

        isLoading(false);
        return OffquesList;
      } else {
        OffquesList = [];
        isLoading(false);
      }
    } else {
      OffquesList = [];
    }
    isLoading(false);
  }

  Future<void> uploadImage(List<File> image) async {
    // var uri = Uri.parse('https://codesuperb.com/api/v1/image/upload');
    String url = 'https://codesuperb.com/api/v1/image/upload';
    Map<String, dynamic> queryParams = {};
    var uri = Uri.parse(url).replace(queryParameters: queryParams);
    var request = http.MultipartRequest('POST', uri);
    Map<String, String> headers = {
      "Content-Type": "multipart/form-data",
      // "Authorization": "Bearer $data",
      "Device-Platform": Platform.isAndroid ? "Android" : "iOS",
    };
    dynamic multiport1;

    for (int i = 0; i < image.length; i++) {
      multiport1 = http.MultipartFile.fromPath('image', image[i].path);
      request.files.add(await multiport1);
    }

    request.headers.addAll(headers);
    var response = await request.send();
    var response1 = await http.Response.fromStream(response);
    final responseData = json.decode(response1.body);
    isLoading.value = false;
    ImageModel.fromJson(responseData);
    ImageModel dta = ImageModel.fromJson(responseData);
    //  print(dta.data!.url!);
    box.write('propic', dta.data!.url!);

    //  print("picture :  ${userPic()}");
  }

  Future<void> downloadAndOpenPdf(
    String sub,
    String classid,
    String top,
    String lesson,
    List<String> quesId,
    String sess,
    String dur,
    String book,
  ) async {
    final url =
        Uri.parse('https://codesuperb.com/api/v1/offlinetest/previewtest');

    Map<String, dynamic> body = {
      "subjectId": sub,
      "classId": classid,
      "topicId": top,
      "lessonId": lesson,
      "testIds": quesId,
      "session": sess,
      "duration": dur,
      "bookId": book,
    };

    final tokenValue = await token(); // get token from your token() method

    try {
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $tokenValue',
          'Accept': 'application/pdf',
          'Content-Type': 'application/json', // Add this line
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final bytes = response.bodyBytes;

        final timestamp = DateTime.now().millisecondsSinceEpoch ~/ 1000;
        final dir = await getTemporaryDirectory();
        final file = File('${dir.path}/$timestamp-offline-paper.pdf');

        await file.writeAsBytes(bytes);

        await OpenFile.open(file.path);
        Get.snackbar("Message", response.statusCode as String,
            snackPosition: SnackPosition.BOTTOM);
      } else {
        print('Failed to load PDF: ${response.statusCode}');
        print('Response body: ${response.body}');
        Get.snackbar("Message", response.statusCode as String,
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      print('Error downloading PDF: $e');
      Get.snackbar("Message", e as String, snackPosition: SnackPosition.BOTTOM);
    }
  }

  getStudentfromBatch(String cls_id, String sec_id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": cls_id,
      "sectionId": sec_id
    };
    final profileJson =
        await apiHelper.get(ApiUrls.stulist, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      StudentModel response = StudentModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message);
        studentList = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return studentList;
      } else {
        studentList = [];
        isLoading(false);
      }
    } else {
      studentList = [];
    }
    isLoading(false);
  }

  updatePro(String name, String mob, String add1, String add2, String pin,
      String state, String dist, String pic) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "name": {"english": name},
      "mobile": mob,
      "address1": add1,
      "address2": add2,
      "pinCode": pin,
      "state": state,
      "district": dist,
      "picture": pic
    };
    print(queryParameter);
    final profileJson = await apiHelper.patch(
        ApiUrls.profileUp + userid(), queryParameter, data);
    if (profileJson != null && profileJson != false) {
      ProUpdateModel response = ProUpdateModel.fromJson(profileJson);
      print(response.code);
      if (response.status == true) {
        ProUpdateModel dta = response;
        // Update box storage with profile data
        Get.snackbar("Message", response.message!,
            snackPosition: SnackPosition.BOTTOM);

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

  getLessonQues(String lesson, String topic) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "lessonId": lesson,
      "topicId": topic
    };
    final profileJson =
        await apiHelper.get(ApiUrls.lessonQ, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      LessonTestModel response = LessonTestModel.fromJson(profileJson);
      if (response.status == true) {
        // print(response.message);
        lessonQList = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return lessonQList;
      } else {
        lessonQList = [];
        isLoading(false);
      }
    } else {
      lessonQList = [];
    }
    isLoading(false);
  }

  removeStu(List<String> stu) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "userIds": stu,
    };
    final profileJson =
        await apiHelper.delete(ApiUrls.deleteS, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.status);
        Get.snackbar("Message", "Student removed successfully!",
            snackPosition: SnackPosition.BOTTOM);
        // Update box storage with profile data

        isLoading(false);
        return response;
      } else {
        Get.snackbar("Message", response.message!,
            snackPosition: SnackPosition.BOTTOM);
        isLoading(false);
      }
    } else {}
    isLoading(false);
  }

  getCurrTime() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.currTime, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      TimeModel response = TimeModel.fromJson(profileJson);
      if (response != "") {
        currTime = response.istTime!;
        // Update box storage with profile data

        isLoading(false);
        return currTime;
      } else {
        isLoading(false);
      }
    } else {}
    isLoading(false);
  }

  getStuTestMarks(String class_id, String sub_id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": class_id,
      "subjectId": sub_id
    };
    final profileJson =
        await apiHelper.get(ApiUrls.testM, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      TestMarksModel response = TestMarksModel.fromJson(profileJson);
      if (response.status == true) {
        // print(response.message);
        marksList = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return marksList;
      } else {
        marksList = [];
        isLoading(false);
      }
    } else {
      marksList = [];
    }
    isLoading(false);
  }

  getVideo(String topic_id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.vid + topic_id, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      VideoClipModel response = VideoClipModel.fromJson(profileJson);
      if (response.status == true) {
        // print(response.message);
        vidList = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return vidList;
      } else {
        isLoading(false);
      }
    } else {}
    isLoading(false);
  }
}
