import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/custom_input.dart';
import 'package:easy_padhai/custom_widgets/custom_input2.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class LessonClipsScreen extends StatefulWidget {
  String vid_link;
  String vid_title;
  String topic_id;
  String lesson_id;
  String lessonkey;
  LessonClipsScreen({
    required this.vid_link,
    required this.vid_title,
    required this.topic_id,
    required this.lesson_id,
    required this.lessonkey,
  });
  @override
  _LessonClipsScreenState createState() => _LessonClipsScreenState();
}

class _LessonClipsScreenState extends State<LessonClipsScreen> {
  int selectedTabIndex = 0;
  List<String> videoLinks = [];
  TextEditingController textEditingController = TextEditingController();
  DashboardController dashboardController = Get.find();

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    videoLinks = parseVideoLinks(widget.vid_link);
    print(videoLinks);
  }

  // Sample data
  List<String> parseVideoLinks(dynamic videoTutorialLink) {
    if (videoTutorialLink == null) return [];

    if (videoTutorialLink is List) {
      return List<String>.from(videoTutorialLink);
    }

    if (videoTutorialLink is String) {
      return videoTutorialLink.split(',').map((link) => link.trim()).toList();
    }

    return [];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Header section with input field
          if (userRole() == "teacher")
            Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: CustomInput2(
                      label: "Enter video link",
                      controller: textEditingController,
                    ),
                  ),
                  const SizedBox(
                    width: 10,
                  ),
                  Expanded(
                      flex: 1,
                      child: CustomButton(
                        text: "Submit",
                        onTap: () async {
                          if (textEditingController.text
                              .toString()
                              .trim()
                              .isEmpty) {
                            Get.snackbar("Message", "Please enter video link",
                                snackPosition: SnackPosition.BOTTOM);
                            return;
                          } else if (!isValidYoutubeLink(
                              textEditingController.text.toString().trim())) {
                            Get.snackbar(
                                "Message", "Please enter a valid video link",
                                snackPosition: SnackPosition.BOTTOM);
                            return;
                          } else {
                            String id = "";
                            if (widget.topic_id.isEmpty) {
                              id = widget.lessonkey;
                            } else {
                              id = widget.topic_id;
                            }
                            await dashboardController.postVideo(
                                id,
                                textEditingController.text.toString().trim(),
                                context);
                          }
                        },
                      ))
                ],
              ),
            ),

          // Video list section
          Expanded(
            child: videoLinks.isNotEmpty
                ? ListView.builder(
                    itemCount: videoLinks.length,
                    itemBuilder: (context, index) {
                      return _buildVideoCard(
                          videoLinks[index], widget.vid_title);
                    },
                  )
                : Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.asset(
                          'assets/no_notification.png',
                          height: 80,
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          "No Video links available",
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  bool isValidYoutubeLink(String link) {
    final videoId = YoutubePlayer.convertUrlToId(link);
    return videoId != null && videoId.length == 11;
  }

  Widget _buildVideoCard(String link, String title) {
    final String? videoId = YoutubePlayer.convertUrlToId(link);

    return SizedBox(
      height: 280,
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Column(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              child: videoId != null
                  ? YoutubePlayer(
                      controller: YoutubePlayerController(
                        initialVideoId: videoId,
                        flags: YoutubePlayerFlags(autoPlay: false),
                      ),
                      showVideoProgressIndicator: true,
                    )
                  : Container(
                      height: 200,
                      color: Colors.grey.shade300,
                      alignment: Alignment.center,
                      child: Text('Invalid video link'),
                    ),
            ),
            ListTile(
              // leading: CircleAvatar(
              //   backgroundColor: AppColors.theme,
              // ),
              title: Text(
                title,
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
