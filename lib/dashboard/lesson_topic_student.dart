import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/dashboard/lesson.dart';
import 'package:easy_padhai/dashboard/lesson_clip.dart';
import 'package:easy_padhai/dashboard/lesson_content_student.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';
import 'package:lottie/lottie.dart';

import '../model/topic_model.dart';

class LessonTopic1Screen extends StatefulWidget {
  String lessonContent;
  String title;
  String id;
  String lesson_id;
  String sub_id;
  LessonTopic1Screen(
      {super.key,
      required this.lessonContent,
      required this.title,
      required this.id,
      required this.lesson_id,
      required this.sub_id});

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
    } else {
      await dashboardController.getTopic(widget.id);
      topic = dashboardController.topic!.lessonTextContent!;
      await dashboardController.getVideo(widget.id);
      vid_link = dashboardController.vidList!.videoTutorialLink!;
      vid_name = dashboardController.vidList!.topic!;
    }

    setState(() {
      isLoad = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        text: widget.title,
      ),
      body: !isLoad
          ? SafeArea(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                      height: 100,
                      decoration: const BoxDecoration(color: AppColors.theme),
                      child: Container(
                        margin: const EdgeInsets.fromLTRB(20, 30, 20, 20),
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
                              )
                            : selectedTabIndex == 1
                                ? LessonClipsScreen(
                                    vid_link: vid_link,
                                    vid_title: vid_name,
                                  )
                                : null),
                  ),
                ],
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
