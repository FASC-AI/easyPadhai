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
  final List<dynamic> wordMeanings;
  LessonTopics(
      {super.key,
      required this.topic,
      required this.topic_id,
      required this.lesson_id,
      required this.sub_id,
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

  @override
  void initState() {
    super.initState();
     print(widget.topic_id);

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
            child: Stack(
              children: [
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: WebViewWidget(controller: _webViewController),
                ),
                if (_isLoading)
                  Center(
                    child: Lottie.asset(
                      'assets/loading.json',
                      width: MediaQuery.of(context).size.width * .2,
                      height: MediaQuery.of(context).size.height * .2,
                      repeat: true,
                      animate: true,
                      reverse: false,
                    ),
                  ),
              ],
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
