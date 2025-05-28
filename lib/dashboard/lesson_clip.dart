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

  // Sample data

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(child: _buildVideoCard(widget.vid_link, widget.vid_title)),
        ],
      ),
    );
  }

  Widget _buildVideoCard(String link, String title) {
    final String videoId = YoutubePlayer.convertUrlToId(link)!;

    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
            title: Text(title),
          ),
        ],
      ),
    );
  }
}
