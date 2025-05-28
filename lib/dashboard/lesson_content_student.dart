import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/dashboard/assign_homework.dart';
import 'package:easy_padhai/dashboard/lessonTest.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import '../model/topic_model.dart';

class LessonTopics extends StatefulWidget {
  String? topic;
  String topic_id;
  String lesson_id;
  String sub_id;
  LessonTopics(
      {super.key,
      required this.topic,
      required this.topic_id,
      required this.lesson_id,
      required this.sub_id});
  @override
  _LessonScreenState createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonTopics> {
  int currentPage = 0;
  Data? topicData;
  String head = "";
  String content = "";
  late PageController _pageController;
  DashboardController dashboardController = Get.find();

  late List<String> pages;
  // Example content list
  // final List<String> content = [
  //   'Act 3: Nora\'s Realization and Decision\n\nIn the third act of A Doll\'s House, Nora has a momentous realization about her marriage and her role as a wife and mother. The act begins with the tension rising between Nora and her husband, Torvald, as he reacts to the crisis caused by Krogstad’s blackmail.',
  //   '1. Torvald\'s Reaction to the Forged Loan:\n\nAfter Krogstad\'s letter exposes Nora’s forgery, Torvald is initially outraged and chastises Nora for her actions. His reaction is selfish and concerned more with the scandal and his reputation than with Nora’s well-being.',
  //   '2. The Disillusionment:\n\nNora starts to see Torvald for who he really is: a man who loves her not for who she is but for the image of her that fits his ideal of a delicate, dependent wife.',
  // ];
  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    // head = widget.topic!.topic ?? "";

    // pages = _splitTextIntoPages(widget.topic!.lessonTextContent ?? "");
  }

  Future<void> update() async {
    await dashboardController.getTopicUpdate(widget.topic_id, widget.lesson_id);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  List<String> _splitTextIntoPages(String text) {
    const int maxLength = 500; // Max characters per page (tweak this as needed)
    List<String> pageContent = [];

    int start = 0;
    while (start < text.length) {
      int end =
          (start + maxLength < text.length) ? start + maxLength : text.length;
      pageContent.add(text.substring(start, end));
      start = end;
    }
    return pageContent;
  }

  void nextPage() {
    update();
    Navigator.push(
      context,
      MaterialPageRoute(
          builder: (_) => LessonTestScreen(
                lesson_id: widget.lesson_id,
                topic_id: widget.topic_id,
                sub_id: widget.sub_id,
              )),
    );
  }

  void previousPage() {}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF6F9FF),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Container(
            //   alignment: Alignment.topLeft,
            //   margin: EdgeInsets.only(bottom: 20),
            //   child: Text(
            //     head,
            //     style: const TextStyle(
            //         color: Colors.black,
            //         fontSize: 18,
            //         fontWeight: FontWeight.bold),
            //   ),
            // ),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    Html(
                      data: widget.topic!,
                      //  style: const TextStyle(fontSize: 18, color: Colors.grey),
                      style: {
                        "body": Style(
                          margin: Margins.zero,
                          fontSize: FontSize.medium,
                        ),
                        "p": Style(
                          margin: Margins.zero,
                        ),
                      },
                    ),
                    const SizedBox(
                      height: 20,
                    ),
                    if (userRole() == "teacher")
                      ElevatedButton(
                        onPressed: () async {
                          update();
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => AssignHomeworkScreen(
                                      tid: widget.topic_id,
                                    )),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          maximumSize: Size.fromWidth(300),
                          backgroundColor: AppColors.theme,
                          padding: const EdgeInsets.symmetric(
                              vertical: 8, horizontal: 20),
                        ),
                        child: const Text(
                          'Assign Homework & Continue',
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    if (userRole() == "student")
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          IconButton(
                            onPressed: previousPage,
                            icon: SvgPicture.asset('assets/prev.svg'),
                            // padding: EdgeInsets.all(12),
                          ),
                          IconButton(
                            onPressed: nextPage,
                            icon: SvgPicture.asset('assets/next.svg'),
                          ),
                        ],
                      ),
                    if (userRole() == "student")
                      Align(
                        alignment: Alignment.bottomRight,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pop(context);
                          },
                          child: Container(
                            margin: EdgeInsets.only(right: 20, bottom: 10),
                            width: 50,
                            height: 27,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: AppColors.theme,
                              borderRadius: BorderRadius.circular(30),
                            ),
                            child: Text('Skip',
                                style: TextStyle(color: Colors.white)),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
