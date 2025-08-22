import 'package:flutter/material.dart';

class ApiUrls {
  //For Local Date
  static String localDate(TimeOfDay time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    var dateTime = '$hour:$minute';
    return dateTime;
  }

  static bool ongoingTime(String date) {
    var time = DateTime.parse(date).difference(DateTime.now()).inSeconds;
    if (time >= 2) {
      return true;
    } else {
      return false;
    }
  }

  // Base url https://codesuperb.com/

  static const String apiBaseUrl = 'easypadhai.in';
  static const String prodApiBaseUrl = 'https://easypadhai.in/';

  // Api End Point

  // Auth

  static const String googleLogin = 'api/v1/auth/google-login';
  static const String setverifyMpin = 'api/v1/auth/set-verify-mpin/';
  static const String classList = 'api/v1/class/list';
  static const String sectionList = 'api/v1/section/list';
  static const String subjectList = 'api/v1/subject/list';
  static const String institutionList = 'api/v1/institutes/list';
  static const String addIns = 'api/v1/institutes';
  static const String dictrictList = 'api/v1/district';
  static const String stateList = 'api/v1/state';
  static const String district = 'api/v1/district';
  static const String updateProfile = 'api/v1/user-profile/add-edit';
  static const String profile = 'api/v1/user-profile/user-info';
  static const String crbatch = 'api/v1/batch';
  static const String crins = '/api/v1/institutes';
  static const String bannerList = 'api/v1/banner/list';
  static const String batchlist = 'api/v1/batch';
  static const String noti = 'api/v1/notification/list';
  static const String binfo = 'api/v1/batch/info';
  static const String breq = 'api/v1/request';
  static const String breqget = 'api/v1/request/requestedbatch';
  static const String breqapprove = 'api/v1/request/';
  static const String getbook = 'api/v1/book/bookbysubject';
  static const String getlesson = 'api/v1/lesson/topic';
  static const String gettopic = 'api/v1/lesson/topicinfo/';
  static const String getques = 'api/v1/homework/homeworkbytopic';
  static const String getprevques = 'api/v1/homework/homeworkpublishedbytopic';
  static const String updatetopic = 'api/v1/topic';
  static const String uphome = 'api/v1/homework/publishhomework';
  static const String getJbat = 'api/v1/request/checkjoinedbatch';
  static const String geth = 'api/v1/homework/homeworkbyclasssubject';
  static const String getq1 = 'api/v1/test/testbybookinfo';
  static const String updateq1 = 'api/v1/test/publishtest';
  static const String updateq2 = 'api/v1/test/republishtest';
  static const String stuNoti = 'api/v1/studentnotification/notification';
  static const String getAllTest = 'api/v1/test/publishedtestinfo';
  static const String getCurrTest = 'api/v1/test/getcurrentdaytest';
  static const String submitTest = 'api/v1/submittest';
  static const String prevTest = 'api/v1/test/previoustest';
  static const String offlineTest = 'api/v1/offlinetest';
  static const String currTime = 'api/v1/test/currenttime';
  static const String stulist = 'api/v1/batch/batchstudentlist';
  static const String profileUp = 'api/v1/auth/';
  static const String lessonQ = 'api/v1/test/testbylessontopic';
  static const String deleteS = 'api/v1/request/removestudent';
  static const String testM = 'api/v1/test/studentmarkslist';
  static const String testMS = 'api/v1/test/markslist';
  static const String vid = 'api/v1/lesson/';
  static const String latAssign = 'api/v1/studentnotification/lasthomework';
  static const String submitLesson = 'api/v1/lessontest';
  static const String sendMsg = 'api/v1/studentnotification/sendmessage';
  static const String getleaderBoard = 'api/v1/test/leaderboard';
  static const String postmpin = 'api/v1/auth/reset-mpin';
  static const String updateNoti ='api/v1/studentnotification/readnotification';
  static const String countNoti ='api/v1/studentnotification/notificationcount';
  static const String getOnques = 'api/v1/test/userpublishtest';
  static const String deletetest = 'api/v1/test/deletepublishedtest';
  static const String addnote = 'api/v1/notes';
  static const String getnote = 'api/v1/notes/noteslist';
  static const String deletenote = 'api/v1/notes/deletenote/';
  static const String posttest = 'api/v1/offlinetest/previewtest';
  static const String getofflineTest = 'api/v1/offlinetest/paper';
  static const String deleteOffine = 'api/v1/offlinetest/';
  static const String postvid = 'api/v1/lesson/videolink/';
  static const String getIns = 'api/v1/instruction/instructionbysubclass';
  static const String getWhatsapp = 'api/v1/whatsapp';
}
