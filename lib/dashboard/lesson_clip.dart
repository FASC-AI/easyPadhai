import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class LessonClipsScreen extends StatefulWidget {
  @override
  _LessonClipsScreenState createState() => _LessonClipsScreenState();
}

class _LessonClipsScreenState extends State<LessonClipsScreen> {
  int selectedTabIndex = 0;

  // Sample data
  final List<Map<String, dynamic>> clipsData = [
    {
      "title": "Nora's Realization and Decision",
      "rating": 4.6,
      "hours": "15.5 total hours",
      "recommendedBy": "Abhishek Kumar Jha",
      "videoUrl": "https://youtu.be/e_04ZrNroTo",
      "teacherImage": "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      "title": "Nora's Realization and Decision",
      "rating": 4.9,
      "hours": "5.1 total hours",
      "recommendedBy": "Sachin Sharma",
      "videoUrl": "https://youtu.be/e_04ZrNroTo",
      "teacherImage": "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      "title": "Nora's Realization and Decision",
      "rating": 4.0,
      "hours": "5.1 total hours",
      "recommendedBy": "Kriti Sharma",
      "videoUrl": "https://youtu.be/e_04ZrNroTo",
      "teacherImage": "https://randomuser.me/api/portraits/women/3.jpg"
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          //_buildTabBar(),
          Expanded(
            child: ListView.builder(
              itemCount: clipsData.length,
              itemBuilder: (context, index) {
                final clip = clipsData[index];
                return _buildVideoCard(clip);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Row(
      children: [
        _buildTab("Topics", 0),
        _buildTab("Clips", 1),
      ],
    );
  }

  Widget _buildTab(String title, int index) {
    final isSelected = selectedTabIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            selectedTabIndex = index;
          });
        },
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Color(0xff186BA5),
            borderRadius: isSelected ? BorderRadius.circular(24) : null,
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              color: isSelected ? Color(0xff186BA5) : Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVideoCard(Map<String, dynamic> clip) {
    final String videoId = YoutubePlayer.convertUrlToId(clip['videoUrl'])!;

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
            leading: CircleAvatar(
              backgroundImage: NetworkImage(clip['teacherImage']),
            ),
            title: Text(clip['title']),
            subtitle: Column(
              children: [
                Container(
                  alignment: Alignment.topLeft,
                  child: Text(
                    "${clip['rating']} ★  •  ${clip['hours']}",
                    style: TextStyle(fontSize: 12),
                  ),
                ),
                //  SizedBox(width: 8),
                Row(
                  children: [
                    Container(
                      alignment: Alignment.topLeft,
                      width: 100,
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Color(0xff0073E6),
                       // borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        "Recommended by",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                        ),
                      ),
                    ),
                    SizedBox(width: 8),
                    Text(clip['recommendedBy']),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
