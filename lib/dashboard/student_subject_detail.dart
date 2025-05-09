import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/sub_appbar.dart';
import 'package:easy_padhai/dashboard/lesson.dart';
import 'package:easy_padhai/dashboard/stu_homework.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';
import 'package:lottie/lottie.dart';

class SubjectDetailScreen extends StatefulWidget {
  final String title;
  final String id;

  const SubjectDetailScreen({super.key, required this.title, required this.id});
  @override
  State<SubjectDetailScreen> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<SubjectDetailScreen> {
  List<Books> booklist = [];
  bool isload = false;
  DashboardController dashboardController = Get.find();

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    setState(() {
      isload = true;
    });
    await dashboardController.getBook(widget.id);
    booklist = dashboardController.booklist;

    setState(() {
      isload = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    // final String title = Get.arguments?['title'] ?? 'Subject';
    return Scaffold(
      appBar: SubjectAppBar(
        title: widget.title,
        teacherName: 'Priyanka Sharma',
      ),
      body: !isload
          ? Column(
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
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => HomeworkScreen()),
                            );
                          },
                          child: Image.asset(
                            'assets/join.png', // Your attention image asset
                            height: 160,
                          ),
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
                  child: GridView.builder(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2, // 2 items per row
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio:
                                  1 // Wider cards (adjust as needed)
                              ),
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: booklist.length,
                      itemBuilder: (context, index) {
                        return GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => LessonScreen(
                                        title: booklist[index].book!,
                                        subId: widget.id,
                                        bookId: booklist[index].sId!,
                                      )),
                            );
                          },
                          child: buildTile(
                            label: booklist[index].book!,
                            imageAsset: booklist[index].images!.isNotEmpty
                                ? booklist[index].images![0].url!
                                : "", // Replace with your image
                            color: Colors.black87,
                          ),
                        );
                        // buildTile(
                        //   label: "Notes of\nComplete Physics",
                        //   imageAsset: "",
                        //   color: Colors.red,
                        //   icon: Icons.picture_as_pdf,
                        // ),
                      }),
                ),
              ],
            )
          : Center(
              child: Lottie.asset(
                'assets/loading.json',
                width: MediaQuery.of(context).size.width * .2,
                height: MediaQuery.of(context).size.height * .2,
                repeat: true,
                animate: true,
                reverse: false,
              ),
            ),
    );
  }

  Widget buildTile({
    required String label,
    required String imageAsset,
    required Color color,
    IconData? icon,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: NetworkImage(imageAsset),
            fit: BoxFit.cover,
          ),
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
      ),
    );
  }
}
