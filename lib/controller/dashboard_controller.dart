import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';


// import 'package:easy_padhai/auth/google_signin_helper.dart';  // Temporarily disabled
import 'package:easy_padhai/common/api_helper.dart';
import 'package:easy_padhai/common/api_urls.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/dashboard/pdf_open.dart';
import 'package:easy_padhai/dashboard/stu_online_test.dart';
import 'package:easy_padhai/model/banner_model.dart';
import 'package:easy_padhai/model/batch_model.dart';
import 'package:easy_padhai/model/batchlist_model.dart';
import 'package:easy_padhai/model/batchreq.dart';
import 'package:easy_padhai/model/binfo.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/bstudent_model.dart';
import 'package:easy_padhai/model/current_test_model.dart';
import 'package:easy_padhai/model/editTestModel.dart';
import 'package:easy_padhai/model/home_noti_model.dart';
import 'package:easy_padhai/model/homework_model1.dart';
import 'package:easy_padhai/model/homework_model2.dart';
import 'package:easy_padhai/model/homework_model3.dart';
import 'package:easy_padhai/model/image_model.dart';
import 'package:easy_padhai/model/institution_list_model.dart';
import 'package:easy_padhai/model/instruc_model.dart';
import 'package:easy_padhai/model/instruction_model.dart';
import 'package:easy_padhai/model/joinedModel.dart';
import 'package:easy_padhai/model/latest_assgn_model.dart';
import 'package:easy_padhai/model/leader_model.dart';
import 'package:easy_padhai/model/lesson_model.dart';
import 'package:easy_padhai/model/lesson_test_model.dart';
import 'package:easy_padhai/model/notes_model.dart';
import 'package:easy_padhai/model/noti_count.dart';
import 'package:easy_padhai/model/noti_model.dart';
import 'package:easy_padhai/model/notification_model.dart';
import 'package:easy_padhai/model/offline_test_list.dart';
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
import 'package:easy_padhai/model/watsapp_model.dart';
import 'package:easy_padhai/route/route_name.dart';
// import 'package:firebase_auth/firebase_auth.dart';  // Temporarily disabled
import 'package:flutter/material.dart';
import 'package:get/get.dart';
// Fixed: Print function issue resolved
import 'package:get_storage/get_storage.dart' as get_storage;
// import 'package:google_sign_in/google_sign_in.dart';  // Temporarily disabled
import 'package:http/http.dart' as http;
import 'package:lottie/lottie.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'package:image/image.dart' as img;
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as path;
import 'package:url_launcher/url_launcher.dart';

class DashboardController extends GetxController {
  RxBool isLoading = false.obs;
  ApiHelper apiHelper = ApiHelper();
  var currentIndex = 0.obs;
  var currentIndex1 = 0.obs;
  var currentIndex2 = 0.obs;
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
  RxString stuBatchId = ''.obs;
  RxString stuBatchCode = ''.obs;
  RxBool isLoading4 = false.obs;
  List<JoinedData> batchData = [];
  List<LessonTestModelData> lessonQList = [];
  List<TestMarksModelData> marksList = [];
  List<EData> qList = [];
  List<LeaderModelData> leaderList = [];
  List<NotiCountData> countNotilist = [];
  List<NotesData> notelist = [];
  List<OfflineTestListData> offlinetestList = [];
  IData? instruction;
  VideoClipModelData? vidList;
  LatestAssgnModelData? assignData;
  // final FirebaseAuth _auth = FirebaseAuth.instance;  // Temporarily disabled
  // final GoogleSignIn _googleSignIn = GoogleSignIn();  // Temporarily disabled
  RxString whatsappTeacher = ''.obs;
  RxString whatsappStudent = ''.obs;
  RxString batchId = ''.obs;

  @override
  void onInit() {
    // TODO: implement onInit
    super.onInit();
    getWhatsapp();
    // getBanners();
    // getNotification();
    // getBatch();
  }

  // Future<void> signOut() async {  // Temporarily disabled
  //   try {
  //     // Sign out from Firebase
  //     await _auth.signOut();

  //     // Sign out from Google
  //     await _googleSignIn.signOut();
  //     await _googleSignIn.disconnect();

  //     // Clear local storage
  //     //  await _storage.erase();

  //     // Optional: Reset any state management (like GetX)
  //     // Get.reset();

  //     print('User signed out successfully');
  //   } catch (e) {
  //     print('Error signing out: $e');
  //     throw Exception('Failed to sign out');
  //   }
  // }

//watsapp teacher : +919810168391, watsapp student : +918882130397
  Future<void> changeIndex(int index) async {
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
        await openWhatsAppChat(
          "+91${whatsappTeacher.value}",
          "",
        );
        // Get.offAllNamed(RouteName.teacherHome);
        break;
      case 4:
        Get.offAllNamed(RouteName.profile);
        break;
    }
  }

  Future<void> changeIndex1(int index) async {
    if (currentIndex1.value == index) return;
    currentIndex1.value = index;
    switch (index) {
      case 0:
        Get.offAllNamed(RouteName.studentHome);
        break;
      case 1:
        // Get.offAllNamed(RouteName.joinBatch);
        break;
      case 2:
        //Get.offAllNamed(RouteName.support);
        await openWhatsAppChat(
          "+91${whatsappStudent.value}",
          "",
        );
        break;
      case 3:
        Get.offAllNamed(RouteName.profile);
        break;
    }
  }

  Future<void> changeIndex3(int index) async {
    if (currentIndex2.value == index) return;
    currentIndex2.value = index;
    switch (index) {
      case 0:
        Get.offAllNamed(RouteName.teacherHome);
        break;
      case 1:
        // Get.offAllNamed(RouteName.teacherHome);
        break;
      case 2:
        // Get.offAllNamed(RouteName.teacherHome);
        await openWhatsAppChat(
          "+91${whatsappTeacher.value}",
          "",
        );
        break;
      case 3:
        Get.offAllNamed(RouteName.profile);
        break;
    }
  }

  Future<void> openWhatsAppChat1({
    required String phoneNumber,
    String message = '',
  }) async {
    // Format phone number (remove any non-digit characters)
    // final formattedNumber = phoneNumber.replaceAll(RegExp(r'[^0-9]'), '');

    // // Create the WhatsApp URL
    // final url = Uri.parse(
    //     'https://wa.me/$formattedNumber?text=${Uri.encodeComponent(message)}');

    // // Try launching WhatsApp
    // if (await canLaunchUrl(url)) {
    //   await launchUrl(url);
    // } else {
    //   throw 'Could not launch WhatsApp';
    // }
    final formattedNumber = phoneNumber.replaceAll(RegExp(r'[^0-9]'), '');
    final String whatsappUrl =
        "whatsapp://send?phone=$formattedNumber&text=${Uri.encodeComponent(message)}";
    if (await canLaunch(whatsappUrl)) {
      await launch(whatsappUrl);
    } else {
      throw 'Could not launch WhatsApp';
      // ScaffoldMessenger.of(context).showSnackBar(
      //   SnackBar(
      //       content:
      //           Text("WhatsApp is not installed or could not be launched")),
      // );
    }
  }

  Future<void> openWhatsAppChat(String phoneNumber, String message) async {
    try {
      final formattedNumber = phoneNumber.replaceAll(RegExp(r'[^0-9+]'), '');
      final encodedMessage = Uri.encodeComponent(message);

      // All possible URL patterns
      final urlsToTry = [
        Uri.parse(
            'whatsapp://send?phone=$formattedNumber&text=$encodedMessage'),
        Uri.parse('https://wa.me/$formattedNumber?text=$encodedMessage'),
        Uri.parse(
            'https://api.whatsapp.com/send?phone=$formattedNumber&text=$encodedMessage'),
      ];

      bool launched = false;

      for (final url in urlsToTry) {
        try {
          if (await canLaunchUrl(url)) {
            await launchUrl(
              url,
              mode: LaunchMode.externalApplication,
            );
            launched = true;
            break;
          }
        } catch (e) {
          debugPrint('Failed to launch URL $url: $e');
          continue;
        }
      }

      if (!launched) {
        // Ultimate fallback - open play store
        final playStoreUrl = Uri.parse(
            'https://play.google.com/store/apps/details?id=com.whatsapp');

        if (await canLaunchUrl(playStoreUrl)) {
          await launchUrl(
            playStoreUrl,
            mode: LaunchMode.externalApplication,
          );
        } else {
          throw 'Could not launch WhatsApp. Please install WhatsApp.';
        }
      }
    } catch (e) {
      debugPrint('Error opening WhatsApp: $e');
      // Show user-friendly message
      throw 'Could not open WhatsApp. Please ensure WhatsApp is installed.';
    }
  }

  getWhatsapp() async {
    isLoading4(false);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final countryJson =
        await apiHelper.get(ApiUrls.getWhatsapp, queryParameter, data);
    if (countryJson != null && countryJson != false) {
      WhatsAppModel response = WhatsAppModel.fromJson(countryJson);
      if (response.status == true) {
        whatsappTeacher.value = response.data!.teacherWhatsapp!;
        whatsappStudent.value = response.data!.studentWhatsapp!;
        isLoading4(true);
        return response;
      } else {
        isLoading4(true);
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

  // final GoogleSignInHelper _googleSignInHelper = GoogleSignInHelper();  // Temporarily disabled

  getProfile() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.profile, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      ProfileModel response = ProfileModel.fromJson(profileJson);
      print(response.status.toString());
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
        Get.snackbar("Message", response.message!,
            snackPosition: SnackPosition.BOTTOM);
        // await _googleSignInHelper.signOutGoogle();  // Temporarily disabled
        await box.erase();

        //await GetStorage().erase();

        Get.delete<AuthController>();
        Get.delete<DashboardController>();
        Get.lazyPut(() => AuthController());
        Get.lazyPut(() => DashboardController());

        Get.offAllNamed(RouteName.login);
      }
    }
    isLoading(false);
  }

  getNotification() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {"isMobile": "true"};
    final profileJson = await apiHelper.get(ApiUrls.noti, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      NotifModel response = NotifModel.fromJson(profileJson);
      if (response.status == true) {
        tNoti.clear();
        uNoti.clear();
        List<Notifications> list = response.data!.notifications!;
        for (int i = 0; i < list.length; i++) {
          // Safely check the first type
          if (list[i].type != null && list[i].type!.isNotEmpty) {
            for (int j = 0; j < list[i].type!.length; j++) {
              if (list[i].type![j].nameEn == "Teacher") {
                tNoti.add(list[i]);
              } else {
                uNoti.add(list[i]);
              }
            }
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
    Map<String, dynamic>? queryParameter;
    if (sec.isEmpty) {
      queryParameter = {
        "classId": cls,
        "code": code,
      };
    } else {
      queryParameter = {
        "classId": cls,
        "sectionId": sec,
        "code": code,
      };
    }

    print(queryParameter.toString());
    final profileJson =
        await apiHelper.post(ApiUrls.crbatch, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      BatchModel response = BatchModel.fromJson(profileJson);
      print(response.code.toString());
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
        print(response.message ?? 'No message');
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
      print(response.message ?? 'No message');
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
      print(response.message ?? 'No message');
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
    // print("topic id: " + id);
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
    Map<String, dynamic>? queryParameter;
    if (id.isEmpty) {
      queryParameter = {"lessonId": lesson_id, "status": true};
    } else {
      queryParameter = {"lessonId": lesson_id, "topicId": id, "status": true};
    }
    print(queryParameter);
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
    Map<String, dynamic>? queryParameter;
    queryParameter = {
      "lessonId": id,
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
      "batchId": batchId.value
    };
    print("Debug: getPHWQbyTopic called with:");
    print("Debug: - topicId: $id");
    print("Debug: - batchId: ${batchId.value}");
    print("Debug: Full queryParameter: $queryParameter");
    print("Debug: Calling API: ${ApiUrls.getprevques}");
    final profileJson =
        await apiHelper.get(ApiUrls.getprevques, queryParameter, data);
    print("Debug: API Response: $profileJson");
    
    if (profileJson != null && profileJson != false) {
      HomeworkModel3 response = HomeworkModel3.fromJson(profileJson);
      print("Debug: Parsed response - status: ${response.status}");
      
      if (response.status == true) {
        prevHlist = response.data!;
        debugPrint("Debug: prevHlist length: ${prevHlist.length}");
        // Update box storage with profile data

        isLoading(false);
        return prevHlist;
      } else {
        print("Debug: API returned false status");
        prevHlist = [];
        isLoading(false);
      }
    } else {
      print("Debug: API returned null or false");
      prevHlist = [];
    }

    isLoading(false);
  }

  updateHomework(List<String> ids, String date, String topicId) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "ids": ids,
      "publishedDate": date,
      "topicId": topicId,
      "batchId": batchId.value
    };
    print("Debug: updateHomework called with parameters:");
    print("Debug: - ids: $ids");
    print("Debug: - date: $date");
    print("Debug: - topicId: $topicId");
    print("Debug: - batchId: ${batchId.value}");
    print("Debug: Full queryParameter: $queryParameter");
    print("Debug: Calling API: ${ApiUrls.uphome}");
    final profileJson =
        await apiHelper.patch(ApiUrls.uphome, queryParameter, data);
    print("Debug: API Response: $profileJson");
    
    if (profileJson != null && profileJson != false) {
      TpupdateModel response = TpupdateModel.fromJson(profileJson);
      print("Debug: Parsed response - status: ${response.status}, message: ${response.message}");
      
      if (response.status == true) {
        //topic = response.data!;
        // Update box storage with profile data
        Get.snackbar("Message", response.message!,
            snackPosition: SnackPosition.BOTTOM);
        // print("Topic updated:" + response.message!);
        isLoading(false);
        return response;
      } else {
        debugPrint("Debug: API returned false status");
        isLoading(false);
      }
    } else {
      debugPrint("Debug: API returned null or false");
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
        if (response.data!.isNotEmpty) {
          isJoined.value = true;
          stuBatchId.value = response.data!.first.batchId!;
          stuBatchCode.value = response.code!;
        }

        // Update box storage with profile data
        batchData = response.data!;
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

  getStuHomework(String subid, String classid) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "subjectId": subid,
      "classId": classid,
      // "sections": secid
    };
    print(queryParameter);
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
    print(queryParameter);
    final profileJson =
        await apiHelper.get(ApiUrls.getq1, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      OnlineQuesmodel response = OnlineQuesmodel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message ?? 'No message');
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

  updateQuestion(List<String> ids, String date, String time, String duration,
      List<String>? selectedInstructions) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "ids": ids,
      "publishedDate": date,
      "publishedTime": time,
      "duration": duration,
      "instructionId": selectedInstructions,
      "batchId": batchId.value
    };
    print(queryParameter);
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

  updateTest(List<String> ids, String date, String time, String duration,
      List<String> selectedInstructions) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "ids": ids,
      "publishedDate": date,
      "publishedTime": time,
      "duration": duration,
      "instructionId": selectedInstructions,
      "batchId": batchId.value
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.patch(ApiUrls.updateq2, queryParameter, data);
    print(profileJson);
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
        print(response.message ?? 'No message');
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

  getAllPubTest(String clsId, String subId) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": clsId,
      "subjectId": subId,
      "batchId": batchId.value
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.get(ApiUrls.getAllTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      OnlineTestModel1 response = OnlineTestModel1.fromJson(profileJson);
      if (response.status == true) {
        print(response.message ?? 'No message');
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
    Map<String, dynamic>? queryParameter = {"batchId": stuBatchId.value};
    final profileJson =
        await apiHelper.get(ApiUrls.getCurrTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      CurrentTestModel response = CurrentTestModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message ?? 'No message');
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
      "subjectId": subId,
      "batchId": stuBatchId.value
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.post(ApiUrls.submitTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      SubmitTestModel response = SubmitTestModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message ?? 'No message');
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

  getPrevTest(String classid, String subid, String value) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": classid,
      "subjectId": subid,
      "batchId": value
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.get(ApiUrls.prevTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      PrevTestModel response = PrevTestModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message ?? 'No message');
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
    print(queryParameter);
    final profileJson =
        await apiHelper.get(ApiUrls.offlineTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      OfflineTestModel response = OfflineTestModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message ?? 'No message');
        OffquesList = response.data!.groupedTests!;
        // Update box storage with profile data
        //  print(OffquesList.length);
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
      // var uri = Uri.parse('https://easypadhai.in/api/v1/image/upload');
  String url = 'https://easypadhai.in/api/v1/image/upload';
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

  // Future<void> downloadAndOpenPdf(
  //   String sub,
  //   String classid,
  //   String top,
  //   String lesson,
  //   List<String> quesId,
  //   String sess,
  //   String dur,
  //   String book,
  // ) async {
  //   final url =
  //       Uri.parse('https://codesuperb.com/api/v1/offlinetest/previewtest');

  //   Map<String, dynamic> body = {
  //     "subjectId": sub,
  //     "classId": classid,
  //     "topicId": top,
  //     "lessonId": lesson,
  //     "testIds": quesId,
  //     "session": sess,
  //     "duration": dur,
  //     "bookId": book,
  //   };

  //   final tokenValue = await token(); // get token from your token() method

  //   try {
  //     final response = await http.post(
  //       url,
  //       headers: {
  //         'Authorization': 'Bearer $tokenValue',
  //         'Accept': 'application/pdf',
  //         'Content-Type': 'application/json', // Add this line
  //       },
  //       body: jsonEncode(body),
  //     );

  //     if (response.statusCode == 200) {
  //       final bytes = response.bodyBytes;

  //       final timestamp = DateTime.now().millisecondsSinceEpoch ~/ 1000;
  //       final dir = await getTemporaryDirectory();
  //       final file = File('${dir.path}/$timestamp-offline-paper.pdf');

  //       await file.writeAsBytes(bytes);

  //       await OpenFile.open(file.path);
  //       Get.snackbar("Message", response.statusCode as String,
  //           snackPosition: SnackPosition.BOTTOM);
  //     } else {
  //       print('Failed to load PDF: ${response.statusCode}');
  //       print('Response body: ${response.body}');
  //       Get.snackbar("Message", response.statusCode as String,
  //           snackPosition: SnackPosition.BOTTOM);
  //     }
  //   } catch (e) {
  //     print('Error downloading PDF: $e');
  //     Get.snackbar("Message", e as String, snackPosition: SnackPosition.BOTTOM);
  //   }
  // }

  Future<void> downloadAndOpenPdf(
      String sub,
      String classid,
      String top,
      String lesson,
      List<String> quesId,
      String sess,
      String dur,
      String book,
      String ids,
      BuildContext context,
      List<String> selectedInstructions) async {
    
    // List of endpoints to try
    List<String> endpoints = [
      ApiUrls.posttest,
      ApiUrls.posttestAlternative1,
      ApiUrls.posttestAlternative2,
      ApiUrls.posttestAlternative3,
    ];
    
    Exception? lastException;
    
        // Try each endpoint until one works
    for (String endpoint in endpoints) {
      try {
        final url = Uri.parse('https://${ApiUrls.apiBaseUrl}/$endpoint');
        print('🔄 Trying endpoint: $endpoint');
        
        // Add timeout to prevent hanging
        final result = await _tryDownloadFromEndpoint(
          url, sub, classid, top, lesson, quesId, sess, dur, book, ids, context, selectedInstructions
        ).timeout(
          Duration(seconds: 30), // 30 second timeout
          onTimeout: () {
            print('⏰ Timeout for endpoint: $endpoint');
            return false;
          },
        );
        
        if (result) {
          print('✅ PDF downloaded successfully from: $endpoint');
          return; // Success, exit the function
        }
      } catch (e) {
        print('❌ Failed with endpoint $endpoint: $e');
        if (e is Exception) {
          lastException = e;
        } else {
          lastException = Exception(e.toString());
        }
        continue; // Try next endpoint
      }
    }
    
    // If all endpoints failed, throw the last exception
    if (lastException != null) {
      throw lastException;
    }
  }
  
  Future<bool> _tryDownloadFromEndpoint(
      Uri url,
      String sub,
      String classid,
      String top,
      String lesson,
      List<String> quesId,
      String sess,
      String dur,
      String book,
      String ids,
      BuildContext context,
      List<String> selectedInstructions) async {

    // Validate and clean the data before sending
    if (quesId.isEmpty) {
      throw Exception('No questions selected');
    }
    
    // Ensure selectedInstructions is not null and has valid data
    List<String> validInstructions = selectedInstructions.where((instruction) => 
      instruction.isNotEmpty && instruction != null
    ).toList();
    
    // Build request body with only non-empty values
    Map<String, dynamic> body = {};
    if (sub.isNotEmpty) body["subjectId"] = sub;
    if (classid.isNotEmpty) body["classId"] = classid;
    if (top.isNotEmpty) body["topicId"] = top;
    if (lesson.isNotEmpty) body["lessonId"] = lesson;
    body["testIds"] = quesId;
    if (sess.isNotEmpty) body["session"] = sess;
    if (dur.isNotEmpty) body["duration"] = dur;
    if (book.isNotEmpty) body["bookId"] = book;
    if (validInstructions.isNotEmpty) body["instructionId"] = validInstructions;
    
    print('Request Body: $body');
    print('Questions Count: ${quesId.length}');
    print('Instructions Count: ${validInstructions.length}');
    final tokenValue = await token();

    try {
      // Show loading indicator
      Get.dialog(
        Center(
          child: Lottie.asset(
            'assets/loading.json',
            width: MediaQuery.of(context).size.width * .2,
            height: MediaQuery.of(context).size.height * .2,
            repeat: true,
            animate: true,
            reverse: false,
          ),
        ),
        barrierDismissible: false,
      );

      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $tokenValue',
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: jsonEncode(body),
      );

      // Remove loading indicator
      Navigator.pop(context);

      if (response.statusCode == 200) {
        final bytes = response.bodyBytes;
        
        // Validate that we actually received PDF data
        if (bytes.isEmpty) {
          throw Exception('Received empty PDF data from server');
        }
        
        // Check if response is actually PDF (basic validation)
        if (response.headers['content-type']?.contains('application/pdf') == true) {
          print('✅ Valid PDF response received');
        } else {
          print('⚠️ Response content-type: ${response.headers['content-type']}');
        }

        // Navigate to PDF viewer screen
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => PdfViewerScreen(
                    pdfBytes: bytes,
                    sub: sub,
                    classid: classid,
                    top: top,
                    lesson: lesson,
                    quesId: quesId,
                    sess: sess,
                    dur: dur,
                    book: book,
                    ids: ids,
                    selectedInstructions: selectedInstructions,
                  )),
        );
      } else {
        // Get the actual error response from server
        String errorResponse = '';
        try {
          errorResponse = response.body;
        } catch (e) {
          errorResponse = 'Unable to read error response';
        }
        
        String errorMessage = 'Failed to load PDF: ${response.statusCode}';
        if (response.statusCode == 503) {
          errorMessage = 'Server is currently unavailable. Please try again later.';
        } else if (response.statusCode == 500) {
          errorMessage = 'Internal server error: $errorResponse';
        } else if (response.statusCode == 404) {
          errorMessage = 'API endpoint not found. Please check configuration.';
        } else if (response.statusCode == 400) {
          errorMessage = 'Bad request: $errorResponse';
        } else if (response.statusCode == 422) {
          errorMessage = 'Validation error: $errorResponse';
        }
        
        print('Server Error Response: $errorResponse');
        print('HTTP Status: ${response.statusCode}');
        print('Request URL: $url');
        print('Request Headers: ${response.headers}');
        print('Full Response Body: ${response.body}');
        
        // Try to parse error response for more details
        try {
          Map<String, dynamic> errorJson = jsonDecode(errorResponse);
          if (errorJson.containsKey('error')) {
            print('Parsed Error: ${errorJson['error']}');
          }
          if (errorJson.containsKey('message')) {
            print('Error Message: ${errorJson['message']}');
          }
        } catch (e) {
          print('Could not parse error response: $e');
        }
        
        throw Exception(errorMessage);
      }
          } catch (e) {
        Navigator.pop(context); // Ensure loading indicator is removed
        print('Error downloading PDF from endpoint');
        return false; // Return false to indicate failure
      }
      
      return true; // Return true to indicate success
    }
    
  Future<void> saveOffline(
      String sub,
      String classid,
      String top,
      String lesson,
      List<String> quesId,
      String sess,
      String dur,
      String book,
      String id,
      BuildContext context,
      List<String> selectedInstructions) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParams = {
      "download": true,
      "subjectId": sub,
      "classId": classid,
      "topicId": top,
      "lessonId": lesson,
      "testIds": quesId,
      "session": sess,
      "duration": dur,
      "bookId": book,
      "id": id,
      "instructionId": selectedInstructions
    };
    print(queryParams);
    final countryJson =
        await apiHelper.post(ApiUrls.posttest, queryParams, data);
    if (countryJson != null && countryJson != false) {
      //  print(countryJson);
      SimpleModel response = SimpleModel.fromJson(countryJson);
      print(response.status);
      if (response.status == true) {
        Get.snackbar(
          "Message",
          "Offline Test saved successfully",
          snackPosition: SnackPosition.BOTTOM,
          duration: Duration(seconds: 5),
        );
        getofflinePubTest(classid, sub);
        Navigator.pop(context);
        Navigator.pop(context);
        isLoading(false);
        return;
      } else {
        isLoading(true);
      }
    }
  }

  // Removed duplicate downloadAndOpenPdf function

  getStudentfromBatch(String cls_id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": cls_id,
      "batchId": batchId.value
      //   "sectionId": sec_id
    };
    final profileJson =
        await apiHelper.get(ApiUrls.stulist, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      StudentModel response = StudentModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message ?? 'No message');
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
      String state, String dist, String pic, String instituteId) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter;
    if (userRole() == 'student') {
      queryParameter = {
        "name": {"english": name},
        "mobile": mob,
        "address1": add1,
        "address2": add2,
        "pinCode": pin,
        "state": state,
        "district": dist,
        "picture": pic
      };
    } else {
      queryParameter = {
        "name": {"english": name},
        "mobile": mob,
        "address1": add1,
        "address2": add2,
        "pinCode": pin,
        "state": state,
        "district": dist,
        "picture": pic,
        "institution": instituteId
      };
    }

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

  removeStu(List<String> stu, BuildContext context) async {
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
        Navigator.pop(context);
        //  Navigator.pop(context);
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

  getStuTestMarks(String class_id, String sub_id, String batch_id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": class_id,
      "subjectId": sub_id,
      "batchId": batch_id
    };
    print(queryParameter);
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

  getStuTestMarks1(String class_id, String sub_id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": class_id,
      "subjectId": sub_id,
      "batchId": stuBatchId.value
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.get(ApiUrls.testMS, queryParameter, data);
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
    print("topic id: " + topic_id);
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

  getAssignment(String clsid, String subid) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": clsid,
      "subjectId": subid,
      "batchId": batchId.value
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.get(ApiUrls.latAssign, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      LatestAssgnModel response = LatestAssgnModel.fromJson(profileJson);
      if (response.status == true) {
        // print(response.message);
        assignData = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return assignData;
      } else {
        assignData = null;
        isLoading(false);
      }
    } else {}
    isLoading(false);
  }

  submitLessonTest(List<Map<String, dynamic>> resp, String clsId, String subId,
      String lesson_id) async {
    isLoading(true);
    dynamic data;
    String id = await userid();
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "test": resp,
      "userId": id,
      "classId": clsId,
      "subjectId": subId,
      "lessonId": lesson_id
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.post(ApiUrls.submitLesson, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message ?? 'No message');
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

  sendMesgStu(List<String> stu, String msg, String clsid, String subid) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "userIds": stu,
      "message": msg,
      "classId": clsid,
      "subjectId": subid,
      "batchId": batchId.value
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.post(ApiUrls.sendMsg, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.status);
        Get.snackbar("Message", "Message sent successfully",
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

  getleaderBoard(String class_id, String sub_id, String batch_id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    // String bid = "";
    // if (userRole() == 'teacher') {
    //   bid = batchId.value;
    // } else {
    //   bid = stuBatchId.value;
    // }
    Map<String, dynamic>? queryParameter = {
      "classId": class_id,
      "subjectId": sub_id,
      "batchId": batch_id
    };
    // print(queryParameter);
    final profileJson =
        await apiHelper.get(ApiUrls.getleaderBoard, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      LeaderModel response = LeaderModel.fromJson(profileJson);
      if (response.status == true) {
        // print(response.message);
        leaderList = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return leaderList;
      } else {
        leaderList = [];
        isLoading(false);
      }
    } else {
      leaderList = [];
    }
    isLoading(false);
  }

  updateNoti(String sub_id, String cls_id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": cls_id,
      "subjectId": sub_id
    };
    final profileJson =
        await apiHelper.patch(ApiUrls.updateNoti, queryParameter, data);

    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      print(response.message ?? 'No message');
      if (response.status == true) {
        //topic = response.data!;
        // Update box storage with profile data
        print(response.message ?? 'No message');
        isLoading(false);
        return response;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  countNoti() async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    final profileJson =
        await apiHelper.get(ApiUrls.countNoti, queryParameter, data);

    if (profileJson != null && profileJson != false) {
      NotiCount response = NotiCount.fromJson(profileJson);
      //  print(response.message);
      if (response.status == true) {
        countNotilist = response.data!;
        // Update box storage with profile data
        // print(response.message);

        isLoading(false);
        return countNotilist;
      } else {
        countNotilist = [];
        isLoading(false);
      }
    } else {
      countNotilist = [];
    }
    isLoading(false);
  }

  getOnTest(String class_id, String sub_id, String bookId, String lessonId,
      String topicId, String pubdate, String pubtime) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": class_id,
      "subjectId": sub_id,
      "bookId": bookId,
      "lessonId": lessonId,
      "topicId": topicId,
      "publishedTime": pubtime,
      "publishedDate": pubdate
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.get(ApiUrls.getOnques, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      Edittestmodel response = Edittestmodel.fromJson(profileJson);
      if (response.status == true) {
        // print(response.message);
        qList = response.data!;
        // Update box storage with profile data

        isLoading(false);
        return qList;
      } else {
        qList = [];
        isLoading(false);
      }
    } else {
      qList = [];
    }
    isLoading(false);
  }

  deleteOntest(String duration, String pubdate, String pubtime, String clsId,
      String subId, BuildContext context) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "duration": duration,
      "publishedTime": pubtime,
      "publishedDate": pubdate
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.delete(ApiUrls.deletetest, queryParameter, data);
    print(profileJson);
    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.status);
        Get.snackbar("Message", "Test deleted successfully!",
            snackPosition: SnackPosition.BOTTOM);
        // Update box storage with profile data
        getAllPubTest(clsId, subId);
        Navigator.pop(context);
        Navigator.pop(context);
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

  Future<void> uploadPdfFile(
      File file, String title, String subid, String clsid) async {
    final fileSize = await file.length();
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (fileSize > maxSize) {
      Get.snackbar(
        "Error",
        "File size exceeds 10MB limit (${(fileSize / (1024 * 1024)).toStringAsFixed(2)}MB)",
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
      );
      return;
    }
    if (!file.path.toLowerCase().endsWith('.pdf')) {
      Get.snackbar(
        "Error",
        "Only PDF files are allowed",
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    final uri = Uri.parse(
        "https://easypadhai.in/api/v1/image/upload"); // Replace with your API
    final request = http.MultipartRequest('POST', uri);

    request.files.add(await http.MultipartFile.fromPath(
      'image', // API field name
      file.path,
      contentType: MediaType('application', 'pdf'),
    ));

    // Optionally add fields:
    // request.fields['noteTitle'] = 'Physics Notes';

    final response = await request.send();

    if (response.statusCode == 200) {
      print('Upload successful');
      var response1 = await http.Response.fromStream(response);
      final responseData = json.decode(response1.body);
      // isLoading.value = false;
      ImageModel.fromJson(responseData);
      ImageModel dta = ImageModel.fromJson(responseData);
      updatePfd(dta.data!.url!, title, subid, clsid);
      Get.offAllNamed(RouteName.teacherHome);
    } else {
      print('Upload failed: ${response.statusCode}');
      Get.snackbar("Message", "Note Upload failed",
          snackPosition: SnackPosition.BOTTOM);
    }
  }

  updatePfd(String url, String title, String subid, String clsid) async {
    isLoading(true);
    dynamic data;
    data = await token();
    List<String> sub = [];
    sub.add(subid);
    List<String> cls = [];
    cls.add(clsid);
    Map<String, dynamic>? queryParameter = {
      "title": title,
      "fileUrl": url,
      "classIds": cls,
      "subjectIds": sub
    };
    print(queryParameter);
    final profileJson =
        await apiHelper.post(ApiUrls.addnote, queryParameter, data);

    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      print(response.message ?? 'No message');
      if (response.status == true) {
        //topic = response.data!;
        // Update box storage with profile data
        Get.snackbar("Message", "Note added successfully",
            snackPosition: SnackPosition.BOTTOM);
        isLoading(false);
        print(response.message ?? 'No message');
        isLoading(false);
        return response;
      } else {
        isLoading(false);
      }
    }
    isLoading(false);
  }

  getNotes(String batchClassId, String id) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": batchClassId,
      "subjectId": id,
    };
    final profileJson =
        await apiHelper.get(ApiUrls.getnote, queryParameter, data);

    if (profileJson != null && profileJson != false) {
      NotesModel response = NotesModel.fromJson(profileJson);
      // print(response.message);
      if (response.status == true) {
        notelist = response.data!;
        // Update box storage with profile data
        // print(response.message);

        isLoading(false);
        return notelist;
      } else {
        notelist = [];
        isLoading(false);
      }
    } else {
      notelist = [];
    }
    isLoading(false);
  }

  deleteNote(
      String id, String clsId, String subId, BuildContext context) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    print(queryParameter);
    final profileJson =
        await apiHelper.delete(ApiUrls.deletenote + id, queryParameter, data);
    print(profileJson);
    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.status);
        Get.snackbar("Message", "Note deleted successfully!",
            snackPosition: SnackPosition.BOTTOM);
        // Update box storage with profile data
        getNotes(clsId, subId);

        // Navigator.pop(context);
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

  deleteOffline(
      String id, String clsId, String subId, BuildContext context) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {};
    print(queryParameter);
    final profileJson =
        await apiHelper.delete(ApiUrls.deleteOffine + id, queryParameter, data);
    print(profileJson);
    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.status);
        Get.snackbar("Message", "Offline test deleted successfully!",
            snackPosition: SnackPosition.BOTTOM);
        // Update box storage with profile data
        getofflinePubTest(clsId, subId);
        Navigator.pop(context);
        Navigator.pop(context);

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

  getofflinePubTest(String clsId, String subId) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": clsId,
      "subjectId": subId
    };
    final profileJson =
        await apiHelper.get(ApiUrls.getofflineTest, queryParameter, data);
    if (profileJson != null && profileJson != false) {
      OfflineTestList response = OfflineTestList.fromJson(profileJson);
      if (response.status == true) {
        offlinetestList = response.data!;
        print(offlinetestList.length);
        // Update box storage with profile data

        isLoading(false);
        return offlinetestList;
      } else {
        offlinetestList = [];
        isLoading(false);
      }
    } else {
      offlinetestList = [];
    }
    isLoading(false);
  }

  postVideo(String id, String link, BuildContext context) async {
    isLoading(true);
    dynamic data;
    data = await token();
    print(id);
    Map<String, dynamic>? queryParameter = {"videoTutorialLink": link};
    final profileJson =
        await apiHelper.patch(ApiUrls.postvid + id, queryParameter, data);
    print(profileJson);
    if (profileJson != null && profileJson != false) {
      SimpleModel response = SimpleModel.fromJson(profileJson);
      if (response.status == true) {
        print(response.message ?? 'No message');
        Get.snackbar("Message", "Video added successfully!",
            snackPosition: SnackPosition.BOTTOM);
        // Update box storage with profile data

        Navigator.pop(context);
        Navigator.pop(context);

        isLoading(false);
        return response;
      } else {
        isLoading(false);
      }
    } else {}
    isLoading(false);
  }

  getInstruction(String batchClassId, String id, String type) async {
    isLoading(true);
    dynamic data;
    data = await token();
    Map<String, dynamic>? queryParameter = {
      "classId": batchClassId,
      "subjectId": id,
      "type": type
    };
    final profileJson =
        await apiHelper.get(ApiUrls.getIns, queryParameter, data);

    if (profileJson != null && profileJson != false) {
      InstrucModel response = InstrucModel.fromJson(profileJson);
      print(response.message ?? 'No message');
      if (response.status == true) {
        instruction = response.data;

        // print(instructionList);
        // Update box storage with profile data
        // print(response.message);

        isLoading(false);
        return instruction;
      } else {
        isLoading(false);
      }
    } else {}
    isLoading(false);
  }
}
