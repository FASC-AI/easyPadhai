import 'dart:async';

import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custum_nav_bar2.dart';
import 'package:easy_padhai/dashboard/HtmlLatexViewer.dart';
import 'package:easy_padhai/dashboard/student_bottomsheet.dart';
import 'package:easy_padhai/model/lesson_test_model.dart';
import 'package:easy_padhai/model/submit_test_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

class LessonTestScreen extends StatefulWidget {
  String lesson_id;
  String topic_id;
  String sub_id;

  LessonTestScreen(
      {required this.lesson_id, required this.topic_id, required this.sub_id});
  @override
  _LessonTestScreenState createState() => _LessonTestScreenState();
}

class _LessonTestScreenState extends State<LessonTestScreen> {
  int _currentIndex = 0;
  Duration _duration = const Duration(hours: 1);
  Timer? _timer;
  String _selectedAnswer = '';
  List<String> _selectedAnswers = [];
  Map<String, List<String>> answersMap = {};

  DashboardController dashboardController = Get.find();
  // List<OnlineTestModel1Data> testList = [];
  List<LessonTestModelData> tests = [];
  LessonTestModelData? currentTest;
  List<String> options = [];
  String testType = "";
  String cls_id = "";
  bool isload = false;

  @override
  void initState() {
    super.initState();
    getData();
    //  _startTimer();
  }

  Future<void> getData() async {
    setState(() {
      isload = true;
    });
    await dashboardController.getLessonQues(widget.lesson_id, widget.topic_id);

    // testList = dashboardController.testList;
    // tests= testList[0]!.tests![0];
    cls_id = dashboardController.profileModel?.data?.classDetail?[0].sId! ?? "";
    print(cls_id);
    tests = dashboardController.lessonQList;
    if (tests.isNotEmpty) {
      currentTest = dashboardController.lessonQList[_currentIndex];
      testType = currentTest!.type!;

      options.clear();
      if (testType == "True/False") {
        options.add("True");
        options.add("False");
      } else if (testType == "MCQ") {
        options.add(currentTest!.optionText1!);
        options.add(currentTest!.optionText2!);
        options.add(currentTest!.optionText3!);
        options.add(currentTest!.optionText4!);
      } else {
        options.add(currentTest!.optionAssertionText1!);
        options.add(currentTest!.optionAssertionText2!);
        options.add(currentTest!.optionAssertionText3!);
        options.add(currentTest!.optionAssertionText4!);
      }
    }

    setState(() {
      isload = false;
    });
  }

  Future<void> update() async {
    if (widget.topic_id.isEmpty) {
      await dashboardController.getTopicUpdate("", widget.lesson_id);
    } else {
      await dashboardController.getTopicUpdate(
          widget.topic_id, widget.lesson_id);
    }
  }

  DateTime _getTodayDateTime(String timeStr) {
    final now = DateTime.now();
    final parts = timeStr.split(RegExp(r'[:\s]'));
    int hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);
    final period = parts[2].toLowerCase();

    if (period == 'pm' && hour != 12) hour += 12;
    if (period == 'am' && hour == 12) hour = 0;

    return DateTime(now.year, now.month, now.day, hour, minute);
  }

  Duration parseDuration(String duration) {
    List<String> parts = duration.split(':');
    int hours = int.parse(parts[0]);
    int minutes = int.parse(parts[1]);
    return Duration(hours: hours, minutes: minutes);
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_duration.inSeconds == 0) {
        timer.cancel();
      } else {
        setState(() {
          _duration -= const Duration(seconds: 1);
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _handleNext() {
    // Save answer before moving to next
    if (testType == "True/False") {
      answersMap[currentTest!.sId!] = [_selectedAnswer];
    } else {
      answersMap[currentTest!.sId!] = List.from(_selectedAnswers);
    }

    if (_currentIndex < tests.length - 1) {
      setState(() {
        _currentIndex++;
        _selectedAnswer = '';
        _selectedAnswers.clear();
        currentTest = tests[_currentIndex];
        testType = currentTest!.type!;
        options.clear();

        if (testType == "True/False") {
          options.add("True");
          options.add("False");
        } else if (testType == "MCQ") {
          options.add(currentTest!.optionText1!);
          options.add(currentTest!.optionText2!);
          options.add(currentTest!.optionText3!);
          options.add(currentTest!.optionText4!);
        } else {
          options.add(currentTest!.optionAssertionText1!);
          options.add(currentTest!.optionAssertionText2!);
          options.add(currentTest!.optionAssertionText3!);
          options.add(currentTest!.optionAssertionText4!);
        }
      });
    }
  }

  bool isvisible = false;

  Future<void> submit() async {
    setState(() {
      isvisible = true;
    });
    if (testType == "True/False") {
      answersMap[currentTest!.sId!] = [_selectedAnswer];
    } else {
      answersMap[currentTest!.sId!] = List.from(_selectedAnswers);
    }
    print("Submitted Answers:");
    print(answersMap);
    List<Map<String, dynamic>> response = [];

    for (var entry in answersMap.entries) {
      response.add({
        "questionId": entry.key,
        "answer": entry.value, // Note the plural "answers" since it's a list
      });
    }
    update();
    final res = await dashboardController.submitLessonTest(
        response, cls_id, widget.sub_id, widget.lesson_id);
    if (res.status == true) {
      Navigator.pop(context);
      Navigator.pop(context);
      setState(() {
        isvisible = false;
      });
    } else {
      Navigator.pop(context);
      Navigator.pop(context);
      setState(() {
        isvisible = false;
      });
    }
  }

  void _handlePrev() {
    if (_currentIndex > 0) {
      setState(() {
        _currentIndex--;
        _selectedAnswer = '';
        _selectedAnswers.clear();
        currentTest = tests[_currentIndex];
        testType = currentTest!.type!;
        options.clear();
        if (testType == "True/False") {
          options.add("True");
          options.add("False");
        } else if (testType == "MCQ") {
          options.add(currentTest!.optionText1!);
          options.add(currentTest!.optionText2!);
          options.add(currentTest!.optionText3!);
          options.add(currentTest!.optionText4!);
        } else {
          options.add(currentTest!.optionAssertionText1!);
          options.add(currentTest!.optionAssertionText2!);
          options.add(currentTest!.optionAssertionText3!);
          options.add(currentTest!.optionAssertionText4!);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blue.shade50,
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
          "Solve Now to Move Ahead",
          style: TextStyle(
            color: AppColors.white,
            fontSize: MediaQuery.of(context).size.width * 0.045,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: !isload
          ? SingleChildScrollView(
              child: Container(
                width: double.infinity,
                margin: const EdgeInsets.all(30.0),
                padding: const EdgeInsets.all(30.0),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  shape: BoxShape.rectangle,
                  border: Border.all(color: AppColors.grey7),
                ),
                child: tests.isNotEmpty
                    ? ListView(
                        shrinkWrap: true,
                        physics:
                            const NeverScrollableScrollPhysics(), // Prevent nested scroll
                        children: [
                          Text(
                            "QUESTION ${_currentIndex + 1} / ${tests.length}",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: AppColors.black.withOpacity(0.5),
                            ),
                          ),
                          const SizedBox(height: 8),
                          HtmlLatexViewer(htmlContent: currentTest!.description ?? ''),
                          const SizedBox(height: 16),
                          if (testType == "True/False")
                            ...options.map((option) {
                              return Container(
                                margin: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: _selectedAnswer == option
                                      ? Colors.blue.shade50
                                      : Colors.white,
                                  shape: BoxShape.rectangle,
                                  border: Border.all(color: AppColors.grey7),
                                ),
                                child: RadioListTile(
                                  title: Text(option),
                                  value: option,
                                  groupValue: _selectedAnswer,
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedAnswer = value.toString();
                                    });
                                  },
                                ),
                              );
                            }).toList()
                          else
                            ...options.map((option) {
                              return Container(
                                margin: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: _selectedAnswers.contains(option)
                                      ? Colors.blue.shade50
                                      : Colors.white,
                                  shape: BoxShape.rectangle,
                                  border: Border.all(color: AppColors.grey7),
                                ),
                                child: CheckboxListTile(
                                  checkColor: Colors.white,
                                  activeColor: const Color(0xff186BA5),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  title: Text(option),
                                  value: _selectedAnswers.contains(option),
                                  onChanged: (value) {
                                    setState(() {
                                      value == true
                                          ? _selectedAnswers.add(option)
                                          : _selectedAnswers.remove(option);
                                    });
                                  },
                                ),
                              );
                            }).toList(),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.white,
                                  shape: RoundedRectangleBorder(
                                    side: BorderSide(
                                        color: _currentIndex > 0
                                            ? AppColors.theme
                                            : AppColors.grey),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                ),
                                onPressed:
                                    _currentIndex > 0 ? _handlePrev : null,
                                child: const Text("Prev"),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.theme,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                ),
                                onPressed: _currentIndex < tests.length - 1
                                    ? _handleNext
                                    : submit,
                                child: !isvisible
                                    ? Text(
                                        _currentIndex < tests.length - 1
                                            ? "Next"
                                            : "Submit",
                                        style: const TextStyle(
                                            color: Colors.white),
                                      )
                                    : SizedBox(
                                        width: 30,
                                        height: 30,
                                        child: Lottie.asset(
                                          'assets/loading.json',
                                          width: 30,
                                          height: 30,
                                          repeat: true,
                                          animate: true,
                                          reverse: false,
                                        ),
                                      ),
                              ),
                            ],
                          ),
                        ],
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.asset(
                            'assets/no_notification.png',
                            height: 80,
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            "No Questions Available",
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 16,
                            ),
                          ),
                        ],
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
              ),
            ),
             bottomNavigationBar: Obx(() => CustomBottomNavBar2(
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
          )),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String hours = twoDigits(duration.inHours);
    String minutes = twoDigits(duration.inMinutes.remainder(60));
    String seconds = twoDigits(duration.inSeconds.remainder(60));
    return "$hours:$minutes:$seconds";
  }
  // Sample Questions Data
  // final List<Map<String, dynamic>> questions = [
  //   {
  //     'question': 'What is the acceleration due to gravity on Earth?',
  //     'options': ['9.8 m/s²', '9.8 m/s²', '9.8 m/s²', '9.8 m/s²'],
  //     'selected': <int>{}
  //   },
  //   {
  //     'question': 'What is the acceleration due to gravity on Earth?',
  //     'options': ['9.8 m/s²', '9.8 m/s²', '9.8 m/s²', '9.8 m/s²'],
  //     'selected': <int>{}
  //   },
  //   {
  //     'question': 'What is the acceleration due to gravity on Earth?',
  //     'options': ['9.8 m/s²', '9.8 m/s²', '9.8 m/s²', '9.8 m/s²'],
  //     'selected': <int>{}
  //   },
  //   {
  //     'question': 'What is the acceleration due to gravity on Earth?',
  //     'options': ['9.8 m/s²', '9.8 m/s²', '9.8 m/s²', '9.8 m/s²'],
  //     'selected': <int>{}
  //   },
  // ];

  // @override
  // Widget build(BuildContext context) {
  //   return Scaffold(
  //     backgroundColor: const Color(0xffF6F9FF),
  //     appBar: CustomAppBar(
  //       text: 'Solve Now to Move Ahead',
  //     ),
  //     body: Padding(
  //       padding: const EdgeInsets.all(16.0),
  //       child: Column(
  //         children: [
  //           _buildHeader(),
  //           //  const SizedBox(height: 12),
  //           Expanded(
  //             child: Container(
  //               decoration: BoxDecoration(
  //                   shape: BoxShape.rectangle,
  //                   border: Border.all(color: Colors.grey)),
  //               child: ListView.separated(
  //                 itemCount: questions.length,
  //                 separatorBuilder: (context, index) {
  //                   return const Divider(
  //                     color: Colors.grey,
  //                     thickness: 0.5,
  //                     height: 24,
  //                   );
  //                 },
  //                 itemBuilder: (context, index) {
  //                   return _buildQuestionCard(index);
  //                 },
  //               ),
  //             ),
  //           ),
  //           const SizedBox(height: 20),
  //           ElevatedButton(
  //             onPressed: () {
  //               // Save and Continue Action
  //             },
  //             style: ElevatedButton.styleFrom(
  //               backgroundColor: const Color(0xff186BA5),
  //               shape: RoundedRectangleBorder(
  //                 borderRadius: BorderRadius.circular(24),
  //               ),
  //               padding:
  //                   const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
  //             ),
  //             child: const Text(
  //               'Save & Continue',
  //               style: TextStyle(color: Colors.white, fontSize: 16),
  //             ),
  //           ),
  //           const SizedBox(height: 16),
  //         ],
  //       ),
  //     ),
  //   );
  // }

  // // Header Widget
  // Widget _buildHeader() {
  //   return Container(
  //     alignment: Alignment.centerLeft,
  //     padding: const EdgeInsets.all(12),
  //     decoration: const BoxDecoration(
  //       color: Color(0xff186BA5),
  //       borderRadius: BorderRadius.only(
  //           topLeft: Radius.circular(10), topRight: Radius.circular(10)),
  //     ),
  //     child: const Text(
  //       'Multiple Choice Questions',
  //       style: TextStyle(
  //           color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
  //     ),
  //   );
  // }

  // // Question Card
  // Widget _buildQuestionCard(int index) {
  //   return Container(
  //     margin: const EdgeInsets.only(bottom: 12),
  //     child: Padding(
  //       padding: const EdgeInsets.all(12.0),
  //       child: Column(
  //         children: [
  //           Row(
  //             children: [
  //               Image.asset(
  //                 'assets/question.png',
  //                 height: 24,
  //                 width: 24,
  //                 color: const Color(0xffD56363),
  //               ),
  //               const SizedBox(width: 12),
  //               Expanded(
  //                 child: Text(
  //                   questions[index]['question'],
  //                   style: const TextStyle(
  //                     fontSize: 16,
  //                     fontWeight: FontWeight.w500,
  //                   ),
  //                 ),
  //               ),
  //             ],
  //           ),
  //           const SizedBox(height: 12),
  //           _buildGridOptions(index),
  //         ],
  //       ),
  //     ),
  //   );
  // }

  // // Options Builder
  // Widget _buildGridOptions(int questionIndex) {
  //   return GridView.builder(
  //     shrinkWrap: true,
  //     physics: const NeverScrollableScrollPhysics(),
  //     gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
  //       crossAxisCount: 2,
  //       mainAxisSpacing: 8,
  //       crossAxisSpacing: 8,
  //       childAspectRatio: 3,
  //     ),
  //     itemCount: questions[questionIndex]['options'].length,
  //     itemBuilder: (context, index) {
  //       bool isSelected = questions[questionIndex]['selected'] == index;
  //       return CheckboxListTile(
  //           activeColor: const Color(0xff186BA5),
  //           title: Text(questions[questionIndex]['options'][index]),
  //           value: questions[questionIndex]['selected'].contains(index),
  //           onChanged: (bool? value) {
  //             setState(() {
  //               if (value == true) {
  //                 questions[questionIndex]['selected'].add(index);
  //               } else {
  //                 questions[questionIndex]['selected'].remove(index);
  //               }
  //             });
  //           });
  //     },
  //   );
  // }
}
