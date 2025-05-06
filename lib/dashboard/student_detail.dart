import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/sub_appbar.dart';
import 'package:easy_padhai/dashboard/lesson.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SubjectDetailScreen extends StatelessWidget {
  final String title;

  const SubjectDetailScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    // final String title = Get.arguments?['title'] ?? 'Subject';
    return Scaffold(
      appBar: SubjectAppBar(
        title: title,
        teacherName: 'Priyanka Sharma',
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Attention card
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              // height: 200,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Image.asset(
                    'assets/join.png', // Your attention image asset
                    height: 160,
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Attention!",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.blueAccent,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    "Join a batch to receive updates, homeworks, and take tests.",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.black87),
                  ),
                ],
              ),
            ),
          ),

          // Subject tiles
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: GridView.count(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const LessonScreen()),
                    );
                  },
                  child: buildTile(
                    label: "Physics",
                    imageAsset: "assets/subject.png", // Replace with your image
                    color: Colors.black87,
                  ),
                ),
                buildTile(
                  label: "Notes of\nComplete Physics",
                  imageAsset: "",
                  color: Colors.red,
                  icon: Icons.picture_as_pdf,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget buildTile({
    required String label,
    required String imageAsset,
    required Color color,
    IconData? icon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: imageAsset.isEmpty ? color : null,
        borderRadius: BorderRadius.circular(12),
        image: imageAsset.isNotEmpty
            ? DecorationImage(
                image: AssetImage(imageAsset),
                fit: BoxFit.cover,
              )
            : null,
      ),
      alignment: Alignment.bottomLeft,
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (icon != null) ...[
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 4),
          ],
          Flexible(
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 2,
            ),
          ),
        ],
      ),
    );
  }
}
