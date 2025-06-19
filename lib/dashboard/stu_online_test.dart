import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custum_nav_bar2.dart';
import 'package:easy_padhai/dashboard/student_bottomsheet.dart';
import 'package:easy_padhai/dashboard/test_in_prog.dart';
import 'package:easy_padhai/model/current_test_model.dart';

import 'package:easy_padhai/model/prev_test_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';
import 'package:lottie/lottie.dart';

class StuOnlineTest extends StatefulWidget {
  String subId;
  String classId;
  StuOnlineTest({super.key, required this.subId, required this.classId});

  @override
  State<StuOnlineTest> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<StuOnlineTest> {
  DashboardController dashboardController = DashboardController();
  List<PrevTestModelData> testList = [];
  bool isload = false;
  bool isAttempted = false;
  int _currIndex = 0;

  @override
  void initState() {
    super.initState();
    getData();
  }

  Future<void> getData() async {
    setState(() {
      isload = true;
    });
    await dashboardController.getPrevTest(widget.classId, widget.subId);
    testList = dashboardController.prevTest;
    setState(() {
      isload = false;
      if (testList.isNotEmpty) {
        isAttempted = testList[0].tests![0].attempted != "to be attempt";
      }
    });
  }

  bool isExpanded = false;
  int initiallyExpandedIndex = 0; // To expand only the first tile initially
  int? currentlyExpandedIndex;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: const CustomAppBar(text: 'Test'),
      body: !isload
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(left: 10),
                      height: 50,
                      child: ListView.builder(
                        itemCount: testList.length,
                        scrollDirection: Axis.horizontal,
                        itemBuilder: (context, index) {
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _currIndex = index;
                                isAttempted =
                                    testList[index].tests![0].attempted !=
                                        "to be attempt";
                              });
                            },
                            child: Padding(
                              padding: const EdgeInsets.only(right: 10),
                              child: Container(
                                width: 150,
                                padding: EdgeInsets.symmetric(vertical: 5),
                                decoration: ShapeDecoration(
                                  color: testList[index].tests![0].attempted ==
                                          "to be attempt"
                                      ? AppColors.theme
                                      : testList[index].tests![0].attempted ==
                                              "unattempted"
                                          ? AppColors.red
                                          : AppColors.white,
                                  shape: RoundedRectangleBorder(
                                    side: BorderSide(
                                      color:
                                          testList[index].tests![0].attempted ==
                                                  "to be attempt"
                                              ? AppColors.theme
                                              : testList[index]
                                                          .tests![0]
                                                          .attempted ==
                                                      "unattempted"
                                                  ? AppColors.red
                                                  : AppColors.grey,
                                    ),
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    "${testList[index].publishedDate!} \n${testList[index].publishedTime!}",
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color:
                                          testList[index].tests![0].attempted ==
                                                  "to be attempt"
                                              ? AppColors.white
                                              : testList[index]
                                                          .tests![0]
                                                          .attempted ==
                                                      "unattempted"
                                                  ? AppColors.white
                                                  : AppColors.grey,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 20),
                    !isAttempted
                        ? Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                "Instructions for the Online Test",
                                style: TextStyle(
                                  color: AppColors.black,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 20),
                              for (var i = 0; i < instructions.length; i++)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: Text(
                                    '${i + 1}. ${instructions[i]}',
                                    style: TextStyle(
                                      color: AppColors.black.withOpacity(0.6),
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              const SizedBox(height: 30),
                              GestureDetector(
                                onTap: () async {
                                  List<CurrentTestModelData> res =
                                      await dashboardController.getCurrTest();
                                  if (res.isNotEmpty &&
                                      res[0].attempted == "attempted") {
                                    Get.snackbar(
                                        "Message", "Test already attempted!",
                                        snackPosition: SnackPosition.BOTTOM);
                                  } else {
                                    if (res.isNotEmpty) {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (_) =>
                                                TestInProgressScreen(
                                                  subId: widget.subId,
                                                )),
                                      );
                                    }
                                  }
                                },
                                child: Container(
                                  width: double.infinity,
                                  height: 50,
                                  decoration: ShapeDecoration(
                                    color: AppColors.theme,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(30),
                                    ),
                                  ),
                                  child: const Center(
                                    child: Text("Test Start",
                                        style: TextStyle(color: Colors.white)),
                                  ),
                                ),
                              )
                            ],
                          )
                        : Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(20),
                              child: ListView(
                                children: groupTestsByType(
                                        testList[_currIndex].tests!)
                                    .entries
                                    .toList()
                                    .asMap()
                                    .entries
                                    .map((entryMap) {
                                  int index = entryMap.key;
                                  var entry = entryMap.value;

                                  bool isThisExpanded =
                                      currentlyExpandedIndex == index ||
                                          (currentlyExpandedIndex == null &&
                                              index == initiallyExpandedIndex);

                                  return ExpansionTile(
                                    collapsedBackgroundColor:
                                        const Color(0xffC5D5E1),
                                    collapsedIconColor: isThisExpanded
                                        ? Colors.white
                                        : Colors.black,
                                    backgroundColor: const Color(0xff186BA5),
                                    onExpansionChanged: (bool expanded) {
                                      setState(() {
                                        currentlyExpandedIndex =
                                            expanded ? index : null;
                                      });
                                    },
                                    title: Text(
                                      entry.key,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: isThisExpanded
                                            ? Colors.white
                                            : Colors.black,
                                      ),
                                    ),
                                    initiallyExpanded: isThisExpanded,
                                    children: entry.value
                                        .map((test) =>
                                            _buildQuestionReviewCard(test))
                                        .toList(),
                                  );
                                }).toList(),
                              ),
                            ),
                          ),
                  ],
                ),
              ),
            )
          : Center(
              child: Lottie.asset(
                'assets/loading.json',
                width: width * .2,
                height: height * .2,
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

  Widget _buildQuestionReviewCard(Tests test) {
    final type = test.testId!.type ?? "";
    List<String> options = [];
    List<String> correctAnswers = [];
    List<String> submittedAnswers = [];

    // Build options
    if (type == "True/False") {
      options = ["True", "False"];
      if (test.testId!.optionTrue == "true") {
        correctAnswers.add("True");
      } else if (test.testId!.optionFalse == "false") {
        correctAnswers.add("False");
      }
    } else if (type == "MCQ") {
      final optMap = {
        test.testId!.optionText1!: test.testId!.option1 ?? false,
        test.testId!.optionText2!: test.testId!.option2 ?? false,
        test.testId!.optionText3!: test.testId!.option3 ?? false,
        test.testId!.optionText4!: test.testId!.option4 ?? false,
      };
      options = optMap.keys.toList();
      correctAnswers = optMap.entries
          .where((entry) => entry.value == true)
          .map((entry) => entry.key)
          .toList();
    } else if (type == "Assertion-Reason") {
      final optMap = {
        test.testId!.optionAssertionText1!:
            test.testId!.optionAssertion1 ?? false,
        test.testId!.optionAssertionText2!:
            test.testId!.optionAssertion2 ?? false,
        test.testId!.optionAssertionText3!:
            test.testId!.optionAssertion3 ?? false,
        test.testId!.optionAssertionText4!:
            test.testId!.optionAssertion4 ?? false,
      };
      options = optMap.keys.toList();
      correctAnswers = optMap.entries
          .where((entry) => entry.value == true)
          .map((entry) => entry.key)
          .toList();
    }

    // Extract submitted answers
    if (test.submitTestData != null && test.submitTestData!.test != null) {
      final matched = test.submitTestData!.test!.firstWhere(
        (entry) => entry.questionId == test.testId!.sId!,
      );

      if (matched != null) {
        submittedAnswers = List<String>.from(matched.answer ?? []);
      }
    }

    return Container(
      color: AppColors.white,
      margin: const EdgeInsets.symmetric(vertical: 0),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Html(data: test.testId!.description ?? ""),
            const SizedBox(height: 12),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: options.length,
              itemBuilder: (context, index) {
                final optionText = options[index];
                final isCorrect = correctAnswers.contains(optionText);
                final isSubmitted = submittedAnswers.contains(optionText);

                Color? tileColor;
                if (isCorrect && isSubmitted) {
                  tileColor = Colors.green[100]; // Correct + selected
                } else if (isSubmitted && !isCorrect) {
                  tileColor = Colors.red[100]; // Wrong selection
                } else if (isCorrect && !isSubmitted) {
                  tileColor = Colors.green[50]; // Missed correct
                }

                return Container(
                  color: tileColor,
                  child: CheckboxListTile(
                    value: isSubmitted,
                    onChanged: null,
                    title: Text(
                      optionText,
                      style: TextStyle(
                        color: isCorrect ? Colors.green : Colors.black,
                        fontWeight:
                            isSubmitted ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
                );
              },
            ),
            const SizedBox(height: 10),
            Text(
              "Submitted: ${submittedAnswers.join(', ')}",
              style: TextStyle(
                color: Colors.blueGrey,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              "Correct: ${correctAnswers.join(', ')}",
              style: const TextStyle(
                color: Colors.green,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Map<String, List<Tests>> groupTestsByType(List<Tests> tests) {
    Map<String, List<Tests>> grouped = {
      "Multiple Choice Questions": [],
      "True/False Questions": [],
      "AR Questions": [],
    };

    for (var test in tests) {
      String? type = test.testId?.type ?? "";
      if (type.contains("MCQ")) {
        grouped["Multiple Choice Questions"]!.add(test);
      } else if (type.contains("True")) {
        grouped["True/False Questions"]!.add(test);
      } else {
        grouped["AR Questions"]!.add(test);
      }
    }
    return grouped;
  }
}

List<String> instructions = [
  "Ensure a stable internet connection before starting the test.",
  "The test will be automatically submitted when the timer runs out.",
  "Switching tabs or refreshing the page may result in disqualification.",
  "Do not use external resources, calculators, or any other aids unless explicitly allowed.",
  "Read each question carefully before answering."
];
