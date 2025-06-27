import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/dashboard/assign_homework.dart';
import 'package:easy_padhai/dashboard/lessonTest.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:lottie/lottie.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:easy_padhai/model/lesson_model.dart' as lessonModel;
import 'package:easy_padhai/model/topic_model.dart';

class LessonTopics extends StatefulWidget {
  String? topic;
  String topic_id;
  String lesson_id;
  String sub_id;
  bool istestreq;
  bool istestreq_topic;
  final List<dynamic> wordMeanings;
  LessonTopics(
      {super.key,
      required this.topic,
      required this.topic_id,
      required this.lesson_id,
      required this.sub_id,
      required this.istestreq,
      required this.istestreq_topic,
      required this.wordMeanings});
  @override
  _LessonScreenState createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonTopics> {
  int currentPage = 0;

  String head = "";
  String content = "";
  bool _isLoading = true;
  late List<WordMeanings> wordMeaningList;
  late PageController _pageController;
  DashboardController dashboardController = Get.find();
  late final WebViewController _webViewController;
  late List<String> pages;
  late bool testreq;

  @override
  void initState() {
    super.initState();
    print(widget.topic_id);
    if (widget.topic_id.isEmpty) {
      testreq = widget.istestreq;
    } else {
      testreq = widget.istestreq_topic;
    }

    wordMeaningList = widget.wordMeanings.map((item) {
      if (item is WordMeanings) {
        return WordMeanings(word: item.word, meaning: item.meaning);
      } else if (item is lessonModel.WordMeanings) {
        // The class from lesson_model.dart (use actual name if different)
        return WordMeanings(word: item.word, meaning: item.meaning);
      } else if (item is Map<String, dynamic>) {
        return WordMeanings.fromJson(item);
      } else {
        return WordMeanings(word: '', meaning: '');
      }
    }).toList();
    _pageController = PageController();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'VocabularyChannel',
        onMessageReceived: (message) {
          String tappedWord = message.message.toLowerCase();
          String? meaning = wordMeaningList
              .firstWhere((w) => w.word?.toLowerCase() == tappedWord,
                  orElse: () => WordMeanings(word: '', meaning: ''))
              .meaning;

          if (meaning != null && meaning.isNotEmpty) {
            // _showTooltip(tappedWord, meaning);
            showModalBottomSheet(
              context: context,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              builder: (_) {
                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Word:',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        tappedWord,
                        style: TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Meaning:',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        meaning,
                        style: TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Close'),
                        ),
                      )
                    ],
                  ),
                );
              },
            );
          }
        },
      )
      ..setBackgroundColor(const Color(0xffF6F9FF))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _isLoading = false;
            });
          },
        ),
      )
      ..loadHtmlString('''
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
      window.MathJax = {
        options: {
          enableMenu: false
        },
        loader: {
          load: ['input/tex', 'output/chtml']
        },
        chtml: {
          useGlobalCache: false
        },
        startup: {
          ready: () => {
            MathJax.startup.defaultReady();
            MathJax.config.chtml.useGlobalCache = false;
          }
        }
      };
    </script>
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
      .vocab-word {
        text-decoration: underline;
        color: blue;
        cursor: pointer;
      }
      p {
        margin: 0 0 16px 0;
      }
    </style>
    <script>
      function setupClickHandlers() {
        document.querySelectorAll('.vocab-word').forEach(function(span) {
          span.onclick = function() {
            VocabularyChannel.postMessage(span.innerText);
          };
        });
      }
      window.onload = setupClickHandlers;
    </script>
  </head>
  <body>
    ${widget.topic ?? ''}
  </body>
</html>
''');
    setState(() {
      _isLoading = false;
    });
  }

  OverlayEntry? _tooltipOverlay;

  void _showTooltip(String word, String meaning) {
    _removeTooltip(); // remove old one if any

    _tooltipOverlay = OverlayEntry(
      builder: (context) => Positioned(
        top: 100, // Adjust as needed
        left: 20,
        right: 20,
        child: Material(
          color: Colors.transparent,
          child: Center(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.8),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    word,
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    meaning,
                    style: const TextStyle(color: Colors.white),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    Overlay.of(context).insert(_tooltipOverlay!);

    Future.delayed(const Duration(seconds: 3), () {
      _removeTooltip();
    });
  }

  void _removeTooltip() {
    _tooltipOverlay?.remove();
    _tooltipOverlay = null;
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

  void nextPage() {
    if (testreq) {
      Navigator.push(
        context,
        MaterialPageRoute(
            builder: (_) => LessonTestScreen(
                  lesson_id: widget.lesson_id,
                  topic_id: widget.topic_id,
                  sub_id: widget.sub_id,
                )),
      );
    } else {
      Navigator.pop(context);
    }
  }

  void previousPage() {
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF6F9FF),
      resizeToAvoidBottomInset: true, // To avoid keyboard pushing UI off
      body: SafeArea(
        child: Column(
          children: [
            // WebView Area with Loader
            Expanded(
              child: Stack(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 10),
                    child: WebViewWidget(controller: _webViewController),
                  ),
                  if (_isLoading)
                    Center(
                      child: Lottie.asset(
                        'assets/loading.json',
                        width: MediaQuery.of(context).size.width * 0.2,
                        height: MediaQuery.of(context).size.height * 0.2,
                        repeat: true,
                        animate: true,
                        reverse: false,
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // Teacher Button
            if (userRole() == "teacher")
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: ElevatedButton(
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
              ),

            // Student Navigation (Next + Skip)
            if (userRole() == "student")
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Spacer for alignment
                  IconButton(
                    onPressed: previousPage,
                    icon: SvgPicture.asset('assets/prev.svg',
                        width: 70, height: 70),
                  ),
                  IconButton(
                    onPressed: nextPage,
                    icon: SvgPicture.asset('assets/next.svg',
                        width: 70, height: 70),
                  ),
                ],
              ),

            // if (userRole() == "student")
            // Padding(
            //   padding: const EdgeInsets.only(bottom: 16, right: 16),
            //   child: Align(
            //     alignment: Alignment.centerRight,
            //     child: GestureDetector(
            //       onTap: () {
            //         update();
            //         Navigator.pop(context);
            //       },
            //       child: Container(
            //         width: 60,
            //         height: 30,
            //         alignment: Alignment.center,
            //         decoration: BoxDecoration(
            //           color: AppColors.theme,
            //           borderRadius: BorderRadius.circular(30),
            //         ),
            //         child: const Text('Skip',
            //             style: TextStyle(color: Colors.white)),
            //       ),
            //     ),
            //   ),
            // ),
          ],
        ),
      ),
    );
  }
}
