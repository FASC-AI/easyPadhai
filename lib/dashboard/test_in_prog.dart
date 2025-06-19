import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/model/current_test_model.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:easy_padhai/model/submit_test_model.dart';
import 'package:flutter/material.dart';
import 'dart:async';
import 'package:flutter/services.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

class TestInProgressScreen extends StatefulWidget {
  String subId;
  TestInProgressScreen({super.key, required this.subId});
  @override
  _TestInProgressScreenState createState() => _TestInProgressScreenState();
}

class _TestInProgressScreenState extends State<TestInProgressScreen> {
  int _currentIndex = 0;
  Duration _duration = const Duration(hours: 1);
  Timer? _timer;
  String _selectedAnswer = '';
  List<String> _selectedAnswers = [];
  Map<String, List<String>> answersMap = {};

  DashboardController dashboardController = Get.find();
  List<OnlineTestModel1Data> testList = [];
  List<CurrentTestModelData> tests = [];
  TestId? currentTest;
  List<String> options = [];
  String testType = "";
  String cls_id = "";
  bool isload = false;

  @override
  void initState() {
    super.initState();
    getData();
    _startTimer();
  }

  Future<void> getData() async {
    setState(() {
      isload = true;
    });
    await dashboardController.getCurrTest();
    await dashboardController.getCurrTime();

    // testList = dashboardController.testList;
    // tests= testList[0]!.tests![0];
    cls_id = dashboardController.profileModel?.data?.classDetail?[0].sId! ?? "";
    print(cls_id);
    tests = dashboardController.CurrTest;
    currentTest = dashboardController.CurrTest[_currentIndex].testId;
    testType = currentTest!.type!;
    String durationStr = tests[_currentIndex].duration!;
    String curTimeStr = dashboardController.currTime;
    String pubTimeStr = tests[_currentIndex].publishedTime!;

    _duration = parseDuration(durationStr);
    Duration fullDuration = parseDuration(durationStr);

    // Step 2: Parse time strings to DateTime objects
    DateTime now = DateTime.now();
    DateTime curTime = _getTodayDateTime(curTimeStr);
    DateTime pubTime = _getTodayDateTime(pubTimeStr);

    // Step 3: Get elapsed time and subtract from total duration
    Duration elapsed = curTime.difference(pubTime);
    Duration remaining = fullDuration - elapsed;

    //print("Remaining Duration: $remaining");
    setState(() {
      _duration = remaining;
    });

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
    setState(() {
      isload = false;
    });
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
        currentTest = tests[_currentIndex].testId;
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

    SubmitTestModel res = await dashboardController.submitCurrTest(
        response,
        tests[_currentIndex].publishedDate!,
        tests[_currentIndex].publishedTime!,
        tests[_currentIndex].duration!,
        cls_id,
        widget.subId);
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
        currentTest = tests[_currentIndex].testId;
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

  void _showCannotGoBackDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Cannot go back"),
        content: const Text("You must submit the test before exiting."),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text("OK"),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Returning false disables the back button
        return false;
      },
      child: Scaffold(
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
              // Navigator.pop(context);
              _showCannotGoBackDialog;
            },
          ),
          titleSpacing: 10,
          title: Text(
            "Test in Progress...",
            style: TextStyle(
              color: AppColors.white,
              fontSize: MediaQuery.of(context).size.width * 0.045,
              fontWeight: FontWeight.w600,
            ),
          ),
          actions: [
            Container(
              margin: const EdgeInsets.all(8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _formatDuration(_duration),
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        body: !isload
            ? SingleChildScrollView(
                child: Container(
                  margin: const EdgeInsets.all(30.0),
                  padding: const EdgeInsets.all(30.0),
                  decoration: BoxDecoration(
                      color: AppColors.white,
                      shape: BoxShape.rectangle,
                      border: Border.all(color: AppColors.grey7)),
                  child: ListView(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      Text("QUESTION ${_currentIndex + 1} / ${tests.length}",
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: AppColors.black.withOpacity(0.5))),
                      const SizedBox(height: 8),
                      Html(data: currentTest!.description ?? ''),
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
                                border: Border.all(color: AppColors.grey7)),
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
                                color: _selectedAnswer == option
                                    ? Colors.blue.shade50
                                    : Colors.white,
                                shape: BoxShape.rectangle,
                                border: Border.all(color: AppColors.grey7)),
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
                            onPressed: _currentIndex > 0 ? _handlePrev : null,
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
                                    style: TextStyle(color: Colors.white),
                                  )
                                : SizedBox(
                                    width: 30,
                                    height: 30,
                                    child: Lottie.asset(
                                      'assets/loading.json',
                                      width: MediaQuery.of(context).size.width,
                                      height:
                                          MediaQuery.of(context).size.height,
                                      repeat: true,
                                      animate: true,
                                      reverse: false,
                                    ),
                                  ),
                          ),
                        ],
                      )
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
                  reverse: false,
                ),
              ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String hours = twoDigits(duration.inHours);
    String minutes = twoDigits(duration.inMinutes.remainder(60));
    String seconds = twoDigits(duration.inSeconds.remainder(60));
    return "$hours:$minutes:$seconds";
  }
}
