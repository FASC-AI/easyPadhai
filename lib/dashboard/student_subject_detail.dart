import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/sub_appbar.dart';
import 'package:easy_padhai/dashboard/lesson.dart';
import 'package:easy_padhai/dashboard/stu_homework.dart';
import 'package:easy_padhai/dashboard/stu_online_test.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/home_noti_model.dart';
import 'package:easy_padhai/model/homework_model2.dart';
import 'package:easy_padhai/model/notification_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';
import 'package:intl/intl.dart';
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
  String teacher = "";
  List<NData1> hlist = [];
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
    String cls_id =
        dashboardController.profileModel?.data?.classDetail?[0].sId! ?? "";
    String sec_id =
        dashboardController.profileModel?.data?.sectionDetail?[0].sId! ?? "";
    await dashboardController.getBook(widget.id, cls_id);
    booklist = dashboardController.booklist;
    if (dashboardController.isJoined.value) {
      teacher =
          dashboardController.batchData?.classTeacherId?.name?.english! ?? "";
    }
    await dashboardController.getStuHomework(widget.id, cls_id, sec_id);
    await dashboardController.getStuNoti();
    hlist = dashboardController.stuNotilist;

    setState(() {
      isload = false;
    });
  }

  String formatDate(String isoDate) {
    final dateTime = DateTime.parse(isoDate).toLocal(); // Convert to local time
    return DateFormat('EEE, dd MMM').format(dateTime);
  }

  String formatDate1(String isoDate) {
    final dateTime = DateTime.parse(isoDate).toLocal(); // Convert to local time
    return DateFormat('yyyy-MM-dd').format(dateTime);
  }

  @override
  Widget build(BuildContext context) {
    // final String title = Get.arguments?['title'] ?? 'Subject';
    return Scaffold(
      appBar: SubjectAppBar(
        title: widget.title,
        teacherName: teacher,
      ),
      body: !isload
          ? SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Attention card
                  if (teacher.isEmpty)
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
                              onTap: () {},
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

                  if (teacher.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16.0, vertical: 16),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                        child: hlist.isNotEmpty
                            ? Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: List.generate(
                                  hlist.length,
                                  (index) {
                                    String formatted =
                                        formatDate(hlist[index].publishedDate!);
                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 8),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          if (hlist.isNotEmpty)
                                            Text(
                                              formatted,
                                              style: const TextStyle(
                                                  fontWeight: FontWeight.bold),
                                            ),
                                          const SizedBox(height: 8),
                                          GestureDetector(
                                            onTap: () {
                                              if (hlist[index].type! ==
                                                  "homework") {
                                                Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                      builder: (_) =>
                                                          HomeworkScreen()),
                                                );
                                              } else if (hlist[index].type! ==
                                                  "test") {
                                                String date = formatDate1(
                                                    hlist[index]
                                                        .publishedDate!);
                                                Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                      builder: (_) =>
                                                          StuOnlineTest(
                                                            subId: hlist[index].subjectId![0] ,
                                                          )),
                                                );
                                              } else {}
                                            },
                                            child: Row(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                hlist[index].type! == "homework"
                                                    ? SvgPicture.asset(
                                                        "assets/hw.svg")
                                                    : hlist[index].type! ==
                                                            "test"
                                                        ? SizedBox(
                                                            width: 30,
                                                            height: 30,
                                                            child: Image.asset(
                                                                "assets/testq.png"),
                                                          )
                                                        : SvgPicture.asset(
                                                            "assets/notes.svg"),
                                                const SizedBox(width: 10),
                                                Expanded(
                                                  child: hlist[index].type! ==
                                                          "homework"
                                                      ? Text(
                                                          "${hlist[index].data![0].topic!} is a homework on $formatted",
                                                        )
                                                      : hlist[index].type! ==
                                                              "test"
                                                          ? Text(
                                                              "${hlist[index].data![0].topic!} test is on $formatted",
                                                            )
                                                          : Text("Notes"),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                              )
                            : Center(child: Text("No Homework")),
                      ),
                    ),
                  const SizedBox(height: 20),
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
              ),
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
          color: Colors.grey[200], // Fallback color for better UX
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Image loader
            imageAsset.isNotEmpty
                ? Image.network(
                    imageAsset,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const Center(
                        child: CircularProgressIndicator(),
                      );
                    },
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: Colors.grey[300],
                        alignment: Alignment.center,
                        child: Icon(
                          Icons.broken_image,
                          color: Colors.grey[600],
                          size: 50,
                        ),
                      );
                    },
                  )
                : Container(
                    color: Colors.grey[300],
                    alignment: Alignment.center,
                    child: Icon(
                      Icons.image_not_supported,
                      color: Colors.grey[600],
                      size: 50,
                    ),
                  ),
            // Text and Icon overlay
            Align(
              alignment: Alignment.bottomLeft,
              child: Container(
                padding: const EdgeInsets.all(12),
                // color: Colors.black54, // Slight overlay for readability
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
                        overflow: TextOverflow.ellipsis,
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
