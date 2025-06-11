import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/dashboard/assign_homework.dart';
import 'package:easy_padhai/dashboard/lessonTest.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:webview_flutter/webview_flutter.dart';
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
  late final WebViewController _webViewController;
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
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xffF6F9FF))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Show loading indicator if needed
          },
          onPageStarted: (String url) {},
          onPageFinished: (String url) {},
          onWebResourceError: (WebResourceError error) {},
        ),
      );
    // pages = _splitTextIntoPages(widget.topic!.lessonTextContent ?? "");
  }

  Future<void> update() async {
    if (widget.topic_id.isEmpty) {
      await dashboardController.getTopicUpdate("", widget.lesson_id);
    } else {
      await dashboardController.getTopicUpdate(
          widget.topic_id, widget.lesson_id);
    }
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
      body: Column(
        children: [
          Expanded(
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: WebViewWidget(
                controller: _webViewController..loadHtmlString('''
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
                    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
                    <style>
                      body {
                        font-family: Arial;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #333;
                        background-color: #F6F9FF;
                        padding: 10px;
                        margin: 0;
                      }
                      p {
                        margin: 0 0 16px 0;
                      }
                    </style>
                  </head>
                  <body>
                    ${widget.topic ?? ''}
                    </body>
                  </html>
                '''),
              ),
            ),
          ),
          const SizedBox(height: 10),
          if (userRole() == "teacher")
            ElevatedButton(
              onPressed: () async {
                update();
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => AssignHomeworkScreen(
                      lessonId: widget.lesson_id,
                      tid: widget.topic_id,
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                maximumSize: const Size.fromWidth(300),
                backgroundColor: AppColors.theme,
                padding:
                    const EdgeInsets.symmetric(vertical: 8, horizontal: 20),
              ),
              child: const Text(
                'Assign Homework & Continue',
                style: TextStyle(color: Colors.white),
              ),
            ),
          const SizedBox(height: 10),
          if (userRole() == "student")
            SizedBox(
              height: 80,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: previousPage,
                    icon: SvgPicture.asset('assets/prev.svg'),
                  ),
                  IconButton(
                    onPressed: nextPage,
                    icon: SvgPicture.asset('assets/next.svg'),
                  ),
                ],
              ),
            ),
          if (userRole() == "student")
            Align(
              alignment: Alignment.bottomRight,
              child: GestureDetector(
                onTap: () {
                  Navigator.pop(context);
                },
                child: Container(
                  margin: const EdgeInsets.only(right: 20, bottom: 20),
                  width: 50,
                  height: 27,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.theme,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child:
                      const Text('Skip', style: TextStyle(color: Colors.white)),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
