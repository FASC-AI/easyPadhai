import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/custom_widgets/custum_nav_bar2.dart';
import 'package:easy_padhai/dashboard/lesson_topic_student.dart';
import 'package:easy_padhai/dashboard/student_bottomsheet.dart';
import 'package:easy_padhai/dashboard/teacher_bottomsheet.dart';
import 'package:easy_padhai/model/lesson_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';
import 'package:lottie/lottie.dart';

class LessonScreen extends StatefulWidget {
  String title;
  String subId;
  String bookId;
  LessonScreen(
      {super.key,
      required this.title,
      required this.subId,
      required this.bookId});

  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> {
  int expandedIndex = -1;

  DashboardController dashboardController = Get.find();
  bool isload = false;
  List<LData> lessonList = [];
  // List<Topics> topicList = [];
  bool isCompleted = false;
  String titile = "";

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    _loadData();
  }

  Future<void> _onRefresh() async {
    // Your refresh logic
    await _loadData();
    //_refreshController.refreshCompleted();
  }

  Future<void> _loadData() async {
    setState(() {
      isload = true;
    });
    titile = widget.title;
    await dashboardController.getLesson(widget.bookId, widget.subId);
    lessonList = dashboardController.lessonlist;
    setState(() {
      isload = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        text: titile,
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: !isload
            ? ListView.builder(
                itemCount: lessonList.length,
                padding: const EdgeInsets.all(12),
                itemBuilder: (context, index) {
                  final isExpanded = expandedIndex == index;
                  isCompleted = lessonList[index].status!;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      GestureDetector(
                        onTap: () async {
                          setState(() {
                            expandedIndex = isExpanded ? -1 : index;
                          });
                          if (lessonList[index].topics!.isEmpty) {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => LessonTopic1Screen(
                                        title: lessonList[index].lesson!,
                                        lessonContent: lessonList[index]
                                            .lessonDescription!,
                                        id: "",
                                        lesson_id: lessonList[index].sId!,
                                        sub_id: widget.subId,
                                        vid_link: lessonList[index]
                                            .videoTutorialLink!,
                                        wordMeanings:
                                            lessonList[index].wordMeanings!,
                                        lessonkey: lessonList[index].lessonKey!,
                                        istestreq:
                                            lessonList[index].isTestRequired!,
                                      )),
                            );
                            setState(() {
                              _loadData();
                            });
                          }
                        },
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 16),
                          decoration: BoxDecoration(
                            color: isCompleted
                                ? Colors.green
                                : const Color(0x0D186BA5),
                            border: Border.all(
                                color: isCompleted
                                    ? Colors.green
                                    : AppColors.lesson),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  lessonList[index].lesson!,
                                  style: TextStyle(
                                    color: isCompleted
                                        ? Colors.white
                                        : AppColors.lesson,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              Icon(
                                isExpanded
                                    ? Icons.expand_less
                                    : Icons.expand_more,
                                color: isCompleted
                                    ? Colors.white
                                    : AppColors.lesson,
                              )
                            ],
                          ),
                        ),
                      ),
                      if (isExpanded && lessonList[index].topics!.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.only(left: 16),
                          child: Column(
                            children: List.generate(
                              lessonList[index].topics!.length,
                              (subIndex) {
                                isCompleted =
                                    lessonList[index].topics![subIndex].status!;
                                return ListTile(
                                  // value: subtopicStatus[index][subIndex],
                                  // onChanged: (value) {
                                  //   setState(() {
                                  //     subtopicStatus[index][subIndex] = value ?? false;
                                  //   });
                                  // },
                                  onTap: () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                          builder: (_) => LessonTopic1Screen(
                                                lessonContent: lessonList[index]
                                                    .lessonDescription!,
                                                title:
                                                    lessonList[index].lesson!,
                                                id: lessonList[index]
                                                    .topics![subIndex]
                                                    .sId!,
                                                lesson_id:
                                                    lessonList[index].sId!,
                                                sub_id: widget.subId,
                                                vid_link: lessonList[index]
                                                    .videoTutorialLink!,
                                                wordMeanings: lessonList[index]
                                                    .wordMeanings!,
                                                lessonkey: lessonList[index]
                                                    .lessonKey!,
                                                istestreq: lessonList[index]
                                                    .isTestRequired!,
                                              )),
                                    );
                                    setState(() {
                                      _loadData();
                                    });
                                  },
                                  leading: isCompleted
                                      ? SvgPicture.asset('assets/chk1.svg')
                                      : SvgPicture.asset('assets/chk2.svg'),
                                  title: Text(lessonList[index]
                                      .topics![subIndex]
                                      .topic!),
                                  // controlAffinity: ListTileControlAffinity.leading,
                                );
                              },
                            ),
                          ),
                        ),
                    ],
                  );
                },
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
}
