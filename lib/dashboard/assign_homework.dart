import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/dashboard/HtmlLatexViewer.dart';
import 'package:easy_padhai/dashboard/teacher_bottomsheet.dart';
import 'package:easy_padhai/model/homework_model1.dart';
import 'package:easy_padhai/model/homework_model3.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';

class AssignHomeworkScreen extends StatefulWidget {
  String lessonId;
  final String tid;
  AssignHomeworkScreen({super.key, required this.tid, required this.lessonId});

  @override
  _AssignHomeworkScreenState createState() => _AssignHomeworkScreenState();
}

class _AssignHomeworkScreenState extends State<AssignHomeworkScreen> {
  List<Homework> questions = [];
  List<HomeworkModel3Data> prevH = [];
  List<String> selectedQuestionIds = [];
  DashboardController dashboardController = Get.find();
  bool isload = false;

  @override
  void initState() {
    super.initState();
    getData();
  }

  Future<void> getData() async {
    setState(() {
      isload = true;
    });

    print("Debug: getData() called with lessonId: ${widget.lessonId}");
    print("Debug: Testing for Class 12, 'Bharat itihas ke kuch vishaya', Lesson 08, Topic 'Parichay'");

    await dashboardController.getHWQbyTopic(widget.lessonId);

    // await dashboardController.getHWQbyTopic(widget.tid);
    questions = dashboardController.queslist;
    print("Debug: Questions loaded: ${questions.length}");
    
    // if (widget.tid.isNotEmpty) {
    //   await dashboardController.getPHWQbyTopic(widget.tid);
    // } else {
    print("Debug: Calling getPHWQbyTopic with lessonId: ${widget.lessonId}");
    await dashboardController.getPHWQbyTopic(widget.lessonId);
    // }

    prevH = dashboardController.prevHlist;
    print("Debug: Previous homework loaded: ${prevH.length}");
    print("Debug: Previous homework data: $prevH");
    
    // Additional debug info
    if (prevH.isNotEmpty) {
      print("Debug: First homework item details:");
      print("Debug: - publishedDate: ${prevH.first.publishedDate}");
      print("Debug: - homeworks count: ${prevH.first.homeworks?.length ?? 0}");
      if (prevH.first.homeworks != null && prevH.first.homeworks!.isNotEmpty) {
        print("Debug: - First question: ${prevH.first.homeworks!.first.question}");
      }
    } else {
      print("Debug: No previous homework found for lessonId: ${widget.lessonId}");
    }
    
    setState(() {
      isload = false;
    });
  }


  final List<String> previousHomework = [
    "Homework (20/12/2024)",
    "Homework (08/12/2024)",
    "Homework (01/12/2024)",
  ];









        // child: Container(
        //   padding: EdgeInsets.all(10),
        //   decoration: BoxDecoration(
        //       border: Border.all(
        //         color: Colors.grey,
        //       ),
        //       borderRadius: BorderRadius.circular(8)),
        //   child: Row(
        //       mainAxisAlignment: MainAxisAlignment.spaceBetween,
        //       children: [
        //         Text(
        //           selectDate,
        //           style: const TextStyle(
        //             color: Color(0xFF161621),
        //             fontSize: 14,
        //             fontFamily: 'Inter',
        //             fontWeight: FontWeight.w500,
        //             // height: 0.11,
        //           ),
        //         ),
        //         const Icon(
        //           Icons.calendar_month,
        //           color: Color(0xFF2765CA),
        //         ),
        //       ]),
        // )),


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        text: "Assign Homework",
      ),
      body: SafeArea(
        child: !isload
            ? SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Choose Your Questions",
                        style: TextStyle(
                            fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),

                      // Questions List
                      Container(
                        height: 300,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(color: AppColors.grey7),
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                  vertical: 10, horizontal: 20),
                              decoration: const BoxDecoration(
                                color: Color(0xff4186B6),
                                borderRadius: BorderRadius.only(
                                  topLeft: Radius.circular(5),
                                  topRight: Radius.circular(5),
                                ),
                              ),
                              child: Text(
                                "Questions (${selectedQuestionIds.length})",
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              child: questions.isNotEmpty
                                  ? ListView.separated(
                                      itemCount: questions.length,
                                      shrinkWrap: true,
                                      // physics:
                                      //     const NeverScrollableScrollPhysics(),
                                      separatorBuilder: (context, index) {
                                        return const Divider(
                                          color: Colors.grey,
                                          thickness: 0.5,
                                          height: 15,
                                        );
                                      },
                                      itemBuilder: (context, index) {
                                        return CheckboxListTile(
                                          checkColor: Colors.white,
                                          activeColor: const Color(0xff186BA5),
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(4),
                                          ),
                                          title: HtmlLatexViewer(
                                              htmlContent:
                                                  questions[index].question ??
                                                      ''),
                                          value: questions[index].isPublished,
                                          onChanged: (bool? value) {
                                            setState(() {
                                              questions[index].isPublished =
                                                  value ?? false;
                                              if (value == true) {
                                                selectedQuestionIds.add(
                                                    questions[index].id ?? '');
                                              } else {
                                                selectedQuestionIds.remove(
                                                    questions[index].id ?? '');
                                              }
                                            });
                                          },
                                        );
                                      },
                                    )
                                  : Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Image.asset(
                                          'assets/no_notification.png', // Change with your icon/image path
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
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Submit Button
                      Center(
                        child: SizedBox(
                          width: 200,
                          child: ElevatedButton(
                            onPressed: () async {
                              print("Debug: ===== SUBMIT BUTTON PRESSED =====");
                              print("Debug: Step 1: Validating input data...");
                              
                              // print("Selected Questions: $selectedQuestionIds");
                              // Handle submit logic here
                              if (selectedQuestionIds.isEmpty) {
                                print("Debug: ❌ VALIDATION FAILED: No questions selected");
                                Get.snackbar(
                                    "Message", "Please select questions.",
                                    snackPosition: SnackPosition.BOTTOM);
                                return;
                              } else {
                                print("Debug: ✅ VALIDATION PASSED: ${selectedQuestionIds.length} questions selected");
                                print("Debug: Step 2: Preparing submission data...");
                                
                                // Automatically use current date instead of user-selected date
                                DateTime currentDate = DateTime.now();
                                String isoDate = formatToISOWithOffset(currentDate);

                                print("Debug: Submitting homework with:");
                                print("Debug: - selectedQuestionIds = $selectedQuestionIds");
                                print("Debug: - isoDate = $isoDate");
                                print("Debug: - lessonId = ${widget.lessonId}");
                                print("Debug: - Testing for Class 12, 'Bharat itihas ke kuch vishaya', Lesson 08, Topic 'Parichay'");

                                print("Debug: Step 3: Calling updateHomework API...");
                                var res = await dashboardController.updateHomework(
                                    selectedQuestionIds, isoDate, widget.lessonId);

                                print("Debug: Step 4: API Response received");
                                print("Debug: - updateHomework result = $res");
                                print("Debug: - Result type: ${res.runtimeType}");
                                print("Debug: - Result is null: ${res == null}");
                                print("Debug: - Result is false: ${res == false}");
                                
                                print("Debug: === DATABASE CHECK ===");
                                print("Debug: Checking if homework was saved to database...");

                                if (res != null && res != false) {
                                  print("Debug: ✅ SUCCESS: Homework saved successfully!");
                                  print("Debug: Step 5: Refreshing data from database...");
                                  
                                  // Refresh the data after saving
                                  await getData();
                                  
                                  print("Debug: Step 6: Data refresh completed");
                                  
                                  setState(() {
                                    // Navigate back to topic after successful submission
                                    Navigator.pop(context);
                                    Navigator.pop(context);
                                  });
                                  
                                  print("Debug: Step 7: Redirecting back to topic");
                                  
                                  // Show success message
                                  Get.snackbar(
                                      "Success", "Homework assigned successfully!",
                                      snackPosition: SnackPosition.BOTTOM);
                                } else {
                                  print("Debug: ❌ FAILURE: Homework save failed");
                                  print("Debug: - Result was null: ${res == null}");
                                  print("Debug: - Result was false: ${res == false}");
                                  Get.snackbar(
                                      "Error", "Failed to save homework.",
                                      snackPosition: SnackPosition.BOTTOM);
                                }
                                
                                print("Debug: ===== SUBMIT PROCESS COMPLETED =====");
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.theme,
                            ),
                            child: const Text("Submit",
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),


                      const SizedBox(height: 10),

                      // Previous Homework List
                      const Text(
                        "Previous homework list",
                        style: TextStyle(
                            fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      Column(
                        children: prevH.map((homework) {
                          String formatdate =
                              formatDate(homework.publishedDate!);
                          return GestureDetector(
                            onTap: () {
                              _showBottomSheet(context, homework.homeworks!);
                            },
                            child: Container(
                              width: double.infinity,
                              height: 50,
                              margin: const EdgeInsets.only(bottom: 8),
                              decoration: BoxDecoration(
                                color: Color(0xff4186B6),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              padding: const EdgeInsets.all(12),
                              child: Text(
                                formatdate,
                                style: const TextStyle(color: Colors.white),
                              ),
                            ),
                          );
                        }).toList(),
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
                  reverse: false,
                ),
              ),
      ),
      bottomNavigationBar: Obx(() => CustomBottomNavBar(
            currentIndex: dashboardController.currentIndex.value,
            onTap: (index) {
              if (index == 1) {
                // Assuming index 1 is for creating batch
                BatchHelperTeacher.showCreateBatchBottomSheet(context);
                //_showdoneBatchBottomSheet(context);
              } else if (index == 2) {
                // Assuming index 1 is for creating batch
                BatchHelperTeacher.showFollowBatchBottomSheetTeacher(context);
                //_showdoneBatchBottomSheet(context);
              } else {
                dashboardController.changeIndex(index);
              }
            },
          )),
    );
  }

  void _showBottomSheet(BuildContext context, List<Homeworks> prevH) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true, // Added for better scrolling behavior
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height *
                0.7, // Better height calculation
          ),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Questions",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 10),
              Expanded(
                // Added Expanded for proper ListView sizing
                child: ListView.builder(
                  shrinkWrap: true,
                  physics:
                      const ClampingScrollPhysics(), // Better scrolling physics
                  itemCount: prevH.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: HtmlLatexViewer(
                        htmlContent: "${index + 1}. ${prevH[index].question}",
                        // style: {
                        //   "body": Style(
                        //     fontSize: FontSize(14.0),
                        //     margin: Margins.zero, // Remove default margins
                        //     // Remove default padding
                        //   ),
                        // },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String formatDate(String isoDate) {
    DateTime parsedDate = DateTime.parse(isoDate);
    String formattedDate = DateFormat('dd/MM/yyyy').format(parsedDate);
    return formattedDate;
  }

  String formatToISOWithOffset(DateTime parsedDate) {
    // Get current time (hours, minutes, seconds, milliseconds)
    // TimeOfDay now = TimeOfDay.fromDateTime(DateTime.now());
    DateTime currentTime = DateTime.now();

    // Combine parsed date with current time
    DateTime combined = DateTime(
      parsedDate.year,
      parsedDate.month,
      parsedDate.day,
      currentTime.hour,
      currentTime.minute,
      currentTime.second,
      currentTime.millisecond,
      currentTime.microsecond,
    );

    // Add 5 hours 30 minutes offset (for IST)
    DateTime adjustedDate = combined.add(const Duration(hours: 5, minutes: 30));

    // Format to ISO 8601 string
    return adjustedDate.toUtc().toIso8601String();
  }


}
