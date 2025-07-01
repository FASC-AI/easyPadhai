import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/custom_widgets/custum_nav_bar2.dart';
import 'package:easy_padhai/dashboard/lesson.dart';
import 'package:easy_padhai/dashboard/lesson_clip.dart';
import 'package:easy_padhai/dashboard/lesson_content_student.dart';
import 'package:easy_padhai/dashboard/student_bottomsheet.dart';
import 'package:easy_padhai/dashboard/teacher_bottomsheet.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';
import 'package:lottie/lottie.dart';

import '../model/topic_model.dart';

class LessonTopic1Screen extends StatefulWidget {
  String lessonContent;
  String title;
  String id;
  String lessonkey;
  String lesson_id;
  String sub_id;
  String vid_link;
  bool istestreq;
  final List<dynamic> wordMeanings;
  LessonTopic1Screen(
      {super.key,
      required this.lessonContent,
      required this.title,
      required this.id,
      required this.lessonkey,
      required this.lesson_id,
      required this.sub_id,
      required this.vid_link,
      required this.istestreq,
      required this.wordMeanings});

  @override
  State<LessonTopic1Screen> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<LessonTopic1Screen> {
  int selectedTabIndex = 0;
  String lesson_id = "";
  DashboardController dashboardController = Get.find();
  bool isLoad = false;
  String? topic;
  String vid_link = "";
  String vid_name = "";
  List<dynamic> wordMeanings = [];
  bool istestreq_topic = false;
  bool _isRefreshing = false;
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    _getData();
    lesson_id = widget.lesson_id;
  }

  Future<void> _getData() async {
    setState(() {
      isLoad = true;
    });
    if (widget.id.isEmpty) {
      topic = widget.lessonContent;
      vid_link = widget.vid_link;
      vid_name = widget.title;
      wordMeanings = widget.wordMeanings;
    } else {
      await dashboardController.getTopic(widget.id);
      topic = dashboardController.topic!.lessonTextContent!;
      istestreq_topic = dashboardController.topic!.isTestRequired!;
      wordMeanings = dashboardController.topic!.wordMeanings!;
      await dashboardController.getVideo(widget.id);
      vid_link = dashboardController.vidList!.videoTutorialLink!;
      vid_name = dashboardController.vidList!.topic!;
    }

    setState(() {
      isLoad = false;
    });
  }

  Future<void> _onRefresh() async {
    // Your refresh logic
    await _getData();
    //_refreshController.refreshCompleted();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // appBar: CustomAppBar(
      //   text: widget.title,
      // ),
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        leadingWidth: MediaQuery.of(context).size.width * .13,
        leading: IconButton(
          padding: const EdgeInsets.only(
            left: 20,
          ),
          icon: Image.asset(
            'assets/back.png',
            fit: BoxFit.fill,
            width: MediaQuery.of(context).size.width * 0.09,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        titleSpacing: 10,
        title: Text(
          widget.title,
          style: TextStyle(
            color: AppColors.white,
            fontSize: MediaQuery.of(context).size.width * 0.045,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.white,),
            onPressed: () async {
              setState(() => _isRefreshing = true);
              await _onRefresh(); // Your refresh logic
              setState(() => _isRefreshing = false);
            },
          ),
        ],
      ),
      // floatingActionButton: FloatingActionButton(
      //   backgroundColor: AppColors.theme,
      //   onPressed: () async {
      //     setState(() => _isRefreshing = true);
      //     await _onRefresh(); // Your refresh logic
      //     setState(() => _isRefreshing = false);
      //   },
      //   child: _isRefreshing
      //       ? CircularProgressIndicator(color: Colors.white)
      //       : Icon(Icons.refresh, color: Colors.white),
      // ),
      // floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      body: !isLoad
          ? RefreshIndicator(
              onRefresh: _onRefresh,
              child: SafeArea(
                child: SizedBox(
                  width: MediaQuery.of(context).size.width,
                  height: MediaQuery.of(context).size.height,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                          height: 80,
                          decoration:
                              const BoxDecoration(color: AppColors.theme),
                          child: Container(
                            margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                            decoration: BoxDecoration(
                              color: AppColors.theme,
                              border: Border.all(
                                  color: Colors.white), // Theme background
                              borderRadius:
                                  BorderRadius.circular(30), // Full pill shape
                            ),
                            child: Row(
                              children: [
                                buildTab("Topics", 0),
                                buildTab("Clips", 1),
                              ],
                            ),
                          )),
                      Expanded(
                        child: Container(
                            child: selectedTabIndex == 0
                                ? LessonTopics(
                                    topic: topic,
                                    lesson_id: lesson_id,
                                    topic_id: widget.id,
                                    sub_id: widget.sub_id,
                                    wordMeanings: wordMeanings,
                                    istestreq: widget.istestreq,
                                    istestreq_topic: istestreq_topic,
                                  )
                                : selectedTabIndex == 1
                                    ? LessonClipsScreen(
                                        vid_link: vid_link,
                                        vid_title: vid_name,
                                        lesson_id: lesson_id,
                                        topic_id: widget.id,
                                        lessonkey: widget.lessonkey,
                                      )
                                    : null),
                      ),
                    ],
                  ),
                ),
              ),
            )
          : Center(
              child: Lottie.asset(
                'assets/loading.json',
                width: MediaQuery.of(context).size.width * .2,
                height: MediaQuery.of(context).size.height * .2,
                repeat: true,
                animate: true,
                reverse: false,
              ),
            ),
      bottomNavigationBar: userRole() == 'student'
          ? Obx(() => CustomBottomNavBar2(
                currentIndex: dashboardController.currentIndex1.value,
                onTap: (index) {
                  if (index == 1) {
                    // Assuming index 1 is for creating batch
                    BatchHelper.showFollowBatchBottomSheet(context);
                    //_showdoneBatchBottomSheet(context);
                  } else {
                    dashboardController.changeIndex1(index);
                  }
                },
              ))
          : Obx(() => CustomBottomNavBar(
                currentIndex: dashboardController.currentIndex.value,
                onTap: (index) {
                  if (index == 1) {
                    // Assuming index 1 is for creating batch
                    BatchHelperTeacher.showCreateBatchBottomSheet(context);
                    //_showdoneBatchBottomSheet(context);
                  } else if (index == 2) {
                    // Assuming index 1 is for creating batch
                    BatchHelperTeacher.showFollowBatchBottomSheetTeacher(
                        context);
                    //_showdoneBatchBottomSheet(context);
                  } else {
                    dashboardController.changeIndex(index);
                  }
                },
              )),
    );
  }

  Widget buildTab(String title, int index) {
    final bool isSelected = selectedTabIndex == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => selectedTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius:
                isSelected ? BorderRadius.circular(30) : BorderRadius.zero,
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              color: isSelected ? AppColors.theme : Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
