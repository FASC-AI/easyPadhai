import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custum_nav_bar2.dart';
import 'package:easy_padhai/dashboard/student_bottomsheet.dart';
import 'package:easy_padhai/model/home_noti_model.dart';
import 'package:easy_padhai/model/homework_model2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

class HomeworkScreen extends StatefulWidget {
  @override
  _HomeworkScreenState createState() => _HomeworkScreenState();
}

class _HomeworkScreenState extends State<HomeworkScreen> {
  List<HomeworkModel2Data> homeworkData = [];
  DashboardController dashboardController = Get.find();
  bool isExpanded = false;
  List<bool> expandedStates = [];
  @override
  void initState() {
    super.initState();
    getData();
  }

  void getData() {
    setState(() {
      homeworkData = dashboardController.homeworkList;
      expandedStates =
          List.generate(homeworkData.length, (index) => index == 0);
    });
  }

  String formatDate(String isoDate) {
    DateTime parsedDate = DateTime.parse(isoDate);
    String formattedDate = DateFormat('EEE, dd MMMM yyyy').format(parsedDate);
    return formattedDate;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        text: "Homework",
      ),
      body: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(10)),
        child: homeworkData.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset('assets/no_homework.png', height: 120),
                    const SizedBox(height: 16),
                    const Text(
                      "No homework assigned yet",
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ],
                ),
              )
            : ListView(
                children: homeworkData.asMap().entries.map((entry) {
                  final index = entry.key;
                  final data = entry.value;
                  final date = formatDate(data.publishedDate!);

                  return ExpansionTile(
                    key: ValueKey(
                        data.publishedDate), // Unique key for each tile
                    tilePadding: const EdgeInsets.symmetric(horizontal: 16.0),
                    collapsedBackgroundColor: const Color(0xffC5D5E1),
                    collapsedIconColor:
                        !expandedStates[index] ? Colors.black : Colors.white,
                    backgroundColor: const Color(0xff186BA5),
                    title: Text(
                      date,
                      style: TextStyle(
                        color: !expandedStates[index]
                            ? Colors.black
                            : Colors.white,
                      ),
                    ),
                    initiallyExpanded: expandedStates[index],
                    onExpansionChanged: (bool expanded) {
                      setState(() {
                        expandedStates[index] = expanded;
                      });
                    },
                    children: data.homework!.asMap().entries.map((entry) {
                      final questionIndex = entry.key + 1;
                      final questionData = entry.value;

                      return Container(
                        padding: const EdgeInsets.all(20),
                        color: const Color(0xffF6F9FF),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              children: [
                                CircleAvatar(
                                  backgroundColor: const Color(0xff186BA5),
                                  child: Text(
                                    "$questionIndex",
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                RotatedBox(
                                  quarterTurns: 1,
                                  child: ElevatedButton(
                                    onPressed: () => _showBottomSheet(
                                        context, questionData.hint ?? ""),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.white,
                                      shape: const StadiumBorder(),
                                      side: const BorderSide(
                                          color: Color(0xff186BA5)),
                                    ),
                                    child: const Text(
                                      'Answer',
                                      style:
                                          TextStyle(color: Color(0xff186BA5)),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Html(
                                  data: questionData.question ??
                                      "No question available"),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  );
                }).toList(),
              ),
      ),
      bottomNavigationBar: Obx(() => CustomBottomNavBar2(
            currentIndex: dashboardController.currentIndex1.value,
            onTap: (index) {
              if (index == 1) {
                BatchHelper.showFollowBatchBottomSheet(context);
              } else {
                dashboardController.changeIndex1(index);
              }
            },
          )),
    );
  }

  // 👉 Function to show the BottomSheet
  void _showBottomSheet(BuildContext context, String hint) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Answer",
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Html(
                data: hint.isNotEmpty ? hint : "No hint available.",
                //  style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 20),
              Center(
                child: ElevatedButton(
                  onPressed: () {
                    _showBottomSheet2(context);
                    // Navigator.pop(context); // Close BottomSheet
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      side: BorderSide(color: AppColors.theme),
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: const Text("Solutions"),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showBottomSheet2(BuildContext context) {
    Navigator.pop(context);
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Solutions",
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const Text(
                "This feature is available for prime member only",
                style: TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context); // Close BottomSheet
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.theme,
                      shape: RoundedRectangleBorder(
                        side: BorderSide(color: AppColors.theme),
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    child: const Text(
                      "Get Prime membership",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 10),
                  SizedBox(
                      width: 30,
                      height: 30,
                      child: Image.asset("assets/video.png"))
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
