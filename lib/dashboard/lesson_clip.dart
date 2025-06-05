import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class LessonClipsScreen extends StatefulWidget {
  String vid_link;
  String vid_title;
  LessonClipsScreen({required this.vid_link, required this.vid_title});
  @override
  _LessonClipsScreenState createState() => _LessonClipsScreenState();
}

class _LessonClipsScreenState extends State<LessonClipsScreen> {
  int selectedTabIndex = 0;
  List<String> videoLinks = [];

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    videoLinks = parseVideoLinks(widget.vid_link);
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
      body: videoLinks.isNotEmpty
          ? ListView.builder(
              itemCount: videoLinks.length,
              itemBuilder: (context, index) {
                return _buildVideoCard(videoLinks[index], widget.vid_title);
              })
          : Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Image.asset(
                    'assets/no_notification.png', // Change with your icon/image path
                    height: 80,
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "No Video link available",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildVideoCard(String link, String title) {
    final String videoId = YoutubePlayer.convertUrlToId(link)!;

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
              child: YoutubePlayer(
                controller: YoutubePlayerController(
                  initialVideoId: videoId,
                  flags: YoutubePlayerFlags(autoPlay: false),
                ),
                showVideoProgressIndicator: true,
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
