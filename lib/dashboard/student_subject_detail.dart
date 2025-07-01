import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custum_nav_bar2.dart';
import 'package:easy_padhai/custom_widgets/sub_appbar.dart';
import 'package:easy_padhai/dashboard/lesson.dart';
import 'package:easy_padhai/dashboard/pub_read.dart';
import 'package:easy_padhai/dashboard/stu_homework.dart';
import 'package:easy_padhai/dashboard/stu_online_test.dart';
import 'package:easy_padhai/dashboard/student_bottomsheet.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/home_noti_model.dart';
import 'package:easy_padhai/model/homework_model2.dart';
import 'package:easy_padhai/model/joinedModel.dart';
import 'package:easy_padhai/model/notes_model.dart';
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
  List<String> teacher = [];
  List<NData1> hlist = [];
  String subId = "";
  DashboardController dashboardController = Get.find();
  List<JoinedData> batData = [];
  List<NotesData> noteslist = [];
  String cls_id = "";

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    _loadProfileData();
  }

  Future<void> _onRefresh() async {
    // Your refresh logic
    await _loadProfileData();
    //_refreshController.refreshCompleted();
  }

  Future<void> _loadProfileData() async {
    setState(() {
      isload = true;
    });
    subId = widget.id;
    cls_id = dashboardController.profileModel?.data?.classDetail?[0].sId! ?? "";
    // String sec_id =
    //     dashboardController.profileModel?.data?.sectionDetail?[0].sId! ?? "";
    await dashboardController.getBook(widget.id, cls_id);
    booklist = dashboardController.booklist;
    if (dashboardController.isJoined.value) {
      batData = dashboardController.batchData;
      if (batData.isNotEmpty) {
        List<String> teacherNames = getTeacherNamesForSubject(batData, subId);

        if (teacherNames.isNotEmpty) {
          setState(() {
            teacher = teacherNames;
          });
        }
      }
      // if (batData.isNotEmpty) {
      //   List<String> allTeacherNames = [];

      //   for (var batch in batData) {
      //     List<String> teacherNames = getTeacherNamesForSubject([batch], subId);
      //     if (teacherNames.isNotEmpty) {
      //       allTeacherNames.addAll(teacherNames);
      //     }
      //   }

      //   // Optional: remove duplicates
      //   allTeacherNames = allTeacherNames.toSet().toList();

      //   if (allTeacherNames.isNotEmpty) {
      //     setState(() {
      //       teacher = allTeacherNames;
      //     });
      //   }
      // }
    }
    await dashboardController.getStuHomework(widget.id, cls_id);
    await dashboardController.getStuNoti();
    List<NData1> filteredList = dashboardController.stuNotilist;
    hlist = filterBySubjectId(filteredList, subId);
    await dashboardController.updateNoti(widget.id, cls_id);
    await dashboardController.getNotes(cls_id, subId);
    noteslist = dashboardController.notelist;
    setState(() {
      isload = false;
    });
  }

  List<NData1> filterBySubjectId(List<NData1>? allNotifications, String subId) {
    if (allNotifications == null) return [];

    return allNotifications.where((notification) {
      return notification.subjectId?.contains(subId) ?? false;
    }).toList();
  }

  List<String> getTeacherNamesForSubject(
      List<JoinedData> batData, String subId) {
    return batData
        .where((batch) => batch.userId?.subjectId == subId)
        .map((batch) => batch.userId?.name?.english ?? 'Unknown')
        .where((name) => name != 'Unknown')
        .toList();
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
    final Map<String, List<NData1>> groupedByDate = {};

    for (var item in hlist) {
      String date = formatDate(item.publishedDate!);
      if (!groupedByDate.containsKey(date)) {
        groupedByDate[date] = [];
      }
      groupedByDate[date]!.add(item);
    }
    return Scaffold(
      appBar: SubjectAppBar(
        title: widget.title,
        teacherName: teacher,
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: !isload
            ? SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Attention card
                    if (!dashboardController.isJoined.value)
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

                    if (dashboardController.isJoined.value)
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
                            ? Container(
                                height:
                                    300, // Set your desired fixed height here
                                child: SingleChildScrollView(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children:
                                        groupedByDate.entries.map((entry) {
                                      String date = entry.key;
                                      List<NData1> items = entry.value;

                                      return Padding(
                                        padding:
                                            const EdgeInsets.only(bottom: 16),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            // Date header with count
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Text(
                                                  date,
                                                  style: const TextStyle(
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      fontSize: 16),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 5),

                                            // Items under this date
                                            ...items.expand((item) {
                                              String type = item.type ?? "";
                                              List<Data1> dataList =
                                                  item.data ?? [];

                                              return dataList.map((dataEntry) {
                                                String topic =
                                                    dataEntry.topic ?? "";
                                                String entryType =
                                                    dataEntry.type ?? type;
                                                String publishedDate =
                                                    dataEntry.publishedDate ??
                                                        date;

                                                return GestureDetector(
                                                  onTap: () {
                                                    if (entryType ==
                                                        "homework") {
                                                      Navigator.push(
                                                        context,
                                                        MaterialPageRoute(
                                                            builder: (_) =>
                                                                HomeworkScreen()),
                                                      );
                                                    } else if (entryType ==
                                                        "test") {
                                                      Navigator.push(
                                                        context,
                                                        MaterialPageRoute(
                                                          builder: (_) =>
                                                              StuOnlineTest(
                                                            subId: item
                                                                    .subjectId
                                                                    ?.first ??
                                                                "",
                                                            classId: item
                                                                    .classId
                                                                    ?.first ??
                                                                "",
                                                          ),
                                                        ),
                                                      );
                                                    }
                                                  },
                                                  child: Padding(
                                                    padding:
                                                        const EdgeInsets.only(
                                                            bottom: 10),
                                                    child: Row(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        if (entryType ==
                                                            "homework")
                                                          SvgPicture.asset(
                                                              "assets/hw.svg")
                                                        else if (entryType ==
                                                            "test")
                                                          SizedBox(
                                                            width: 30,
                                                            height: 30,
                                                            child: Image.asset(
                                                                "assets/testq.png"),
                                                          )
                                                        else
                                                          SvgPicture.asset(
                                                              "assets/notes.svg"),
                                                        const SizedBox(
                                                            width: 10),
                                                        Expanded(
                                                          child: Text(
                                                            entryType ==
                                                                    "homework"
                                                                ? "$topic is a homework on ${formatDate(publishedDate)}"
                                                                : entryType ==
                                                                        "test"
                                                                    ? "$topic test is on ${formatDate(publishedDate)}"
                                                                    : topic,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                );
                                              });
                                            }).toList(),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ),
                              )
                            : const SizedBox(
                                height: 160,
                                child: Center(
                                    child: Text(
                                  "No Notifications",
                                  style: TextStyle(
                                      fontSize: 16,
                                      ),
                                )),
                              ),
                      ),
                    ),
                    // : dashboardController.isJoined.value
                    //     ? const SizedBox(
                    //         width: double.infinity,
                    //         height: 0,
                    //         // child: Center(
                    //         //     child: Text(
                    //         //   "Teacher not joined batch yet",
                    //         //   style: TextStyle(
                    //         //       fontSize: 16, fontWeight: FontWeight.bold),
                    //         // )),
                    //       )
                    //     : const SizedBox(
                    //         height: 0,
                    //       ),

                    const SizedBox(height: 20),
                    // Subject tiles
                    SizedBox(
                      width: double.infinity,
                      height: 160,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            // gridDelegate:
                            //     const SliverGridDelegateWithFixedCrossAxisCount(
                            //         crossAxisCount: 2, // 2 items per row
                            //         crossAxisSpacing: 12,
                            //         mainAxisSpacing: 12,
                            //         childAspectRatio:
                            //             1 // Wider cards (adjust as needed)
                            //         ),
                            shrinkWrap: true,
                            // physics: const NeverScrollableScrollPhysics(),
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
                                child: Padding(
                                  padding: EdgeInsets.only(right: 10),
                                  child: buildTile(
                                    label: booklist[index].book!,
                                    imageAsset:
                                        booklist[index].images!.isNotEmpty
                                            ? booklist[index].images![0].url!
                                            : "", // Replace with your image
                                    color: Colors.black87,
                                  ),
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
                    ),
                    const SizedBox(height: 20),

                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: SizedBox(
                        height: 160,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: noteslist.length,
                          itemBuilder: (context, index) {
                            final note =
                                noteslist[index].notes?.isNotEmpty == true
                                    ? noteslist[index].notes![0]
                                    : null;

                            return Padding(
                              padding: const EdgeInsets.only(right: 10),
                              child: Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: GestureDetector(
                                      onTap: () {
                                        if (note?.url != null) {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) => HomePage(
                                                url: note!.url!,
                                                title: note.title ?? '',
                                              ),
                                            ),
                                          );
                                        }
                                      },
                                      child: Container(
                                        width: 130,
                                        height: 160,
                                        color: const Color(0xffC80A0A),
                                        child: Center(
                                          child: Container(
                                            margin: const EdgeInsets.symmetric(
                                                horizontal: 10),
                                            padding:
                                                const EdgeInsets.only(top: 10),
                                            child: Text(
                                              note?.title ?? '',
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                  color: AppColors.white),
                                              textAlign: TextAlign.center,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    left: 60,
                                    top: 40,
                                    child: SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: Image.asset("assets/pdf.png"),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
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
      ),
      bottomNavigationBar: Obx(() => CustomBottomNavBar2(
            currentIndex: dashboardController.currentIndex1.value,
            onTap: (index) {
              if (index == 1) {
                // Assuming index 1 is for creating batch
                BatchHelper.showFollowBatchBottomSheet(context);
                //_showdoneBatchBottomSheet(context);
              } else {
                dashboardController.changeIndex1(index);
              }
            },
          )),
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
        width: 130,
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
