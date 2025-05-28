import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar3.dart';
import 'package:easy_padhai/dashboard/lesson.dart';
import 'package:easy_padhai/dashboard/offline_question_paper.dart';
import 'package:easy_padhai/dashboard/popup1.dart';
import 'package:easy_padhai/dashboard/popup2.dart';
import 'package:easy_padhai/dashboard/popup3.dart';
import 'package:easy_padhai/dashboard/question_paper.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/bstudent_model.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:easy_padhai/model/test_marks_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';

class TeacherClassScreen extends StatefulWidget {
  String title;
  String id;
  String sub_id;
  String sec_id;
  TeacherClassScreen(
      {super.key,
      required this.title,
      required this.id,
      required this.sub_id,
      required this.sec_id});

  @override
  State<TeacherClassScreen> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<TeacherClassScreen> {
  int selectedTabIndex = 0;
  DashboardController dashboardController = Get.find();
  List<OnlineTestModel1Data> testList = [];
  List<Books> booklist = [];
  List<StudentModelData> students = [];
  List<TestMarksModelData> markList = [];
  bool isload = false;
  String id = "";
  String batchClassId = "";
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
    // id = widget.sub_id;
    batchClassId = widget.id;
    id = dashboardController.profileModel?.data?.subjectDetail![0].sId! ?? "";
    await dashboardController.getBook(id, widget.id);
    booklist = dashboardController.booklist;
    await dashboardController.getAllPubTest();
    testList = dashboardController.testList;
    await dashboardController.getStudentfromBatch(batchClassId, widget.sec_id);
    students = dashboardController.studentList;
    await dashboardController.getStuTestMarks(batchClassId, id);
    markList = dashboardController.marksList;
    setState(() {
      isload = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        text: widget.title,
      ),
      body: !isload
          ? SafeArea(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                      height: 100,
                      decoration: const BoxDecoration(color: AppColors.theme),
                      child: Container(
                        margin: const EdgeInsets.fromLTRB(20, 30, 20, 20),
                        decoration: BoxDecoration(
                          color: AppColors.theme,
                          border: Border.all(
                              color: Colors.white), // Theme background
                          borderRadius:
                              BorderRadius.circular(30), // Full pill shape
                        ),
                        child: Row(
                          children: [
                            buildTab("Assignments", 0),
                            buildTab("Tests", 1),
                            buildTab("Students", 2),
                          ],
                        ),
                      )),
                  const SizedBox(height: 16),

                  // Tab Content
                  Expanded(
                    child: Container(
                        padding: const EdgeInsets.all(12),
                        child: selectedTabIndex == 0
                            ? AssignmentsTab(booklist, id)
                            : selectedTabIndex == 1
                                ? TestsTab(
                                    markList: markList,
                                  )
                                : selectedTabIndex == 2
                                    ? StudentSelectionScreen(
                                        students: students,
                                      )
                                    : null),
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
            )),
      bottomNavigationBar: Obx(() => CustomBottomNavBar3(
            currentIndex: dashboardController.currentIndex.value,
            onTap: (index) {
              if (index == 1) {
                // Assuming index 1 is for creating batch
                //_showCreateBatchBottomSheet(context);
                //_showdoneBatchBottomSheet(context);
                showModeSelectionPopup(context);
              } else {
                dashboardController.changeIndex3(index);
              }
            },
          )),
    );
  }

  void showModeSelectionPopup(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return ModeSelectionPopup(
          onQuestionPaper: () {
            //print("Question Paper Selected");
            Navigator.of(context).pop();
            showOfflineTestListPopup(context);
          },
          onOnlineTest: () {
            //print("Online Test Selected");
            Navigator.of(context).pop();
            showOnlineTestListPopup(context);
          },
        );
      },
    );
  }

  void showOnlineTestListPopup(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return OnlineTestListPopup(
          testList: testList,
          onCreateNew: () {
            Navigator.of(context).pop();
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => CreateTestScreen(
                        bClassId: batchClassId,
                      )),
            );
          },
          onOptionSelect: (test) {
            print("Options for $test");
          },
        );
      },
    );
  }

  void showOfflineTestListPopup(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return OfflineTestListPopup(
          testList: testList,
          onCreateNew: () {
            Navigator.of(context).pop();
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => CreateOfflineTestScreen(
                        bClassId: batchClassId,
                      )),
            );
          },
          onOptionSelect: (test) {
            print("Options for $test");
          },
        );
      },
    );
  }

  Widget buildTab(String title, int index) {
    final bool isSelected = selectedTabIndex == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => selectedTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius:
                isSelected ? BorderRadius.circular(30) : BorderRadius.zero,
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              color: isSelected ? AppColors.theme : Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

class AssignmentsTab extends StatelessWidget {
  final List<Books> booklist;
  final String id;
  final DashboardController dashboardController = Get.find();

  // 🔄 Corrected the constructor to initialize the class variables
  AssignmentsTab(this.booklist, this.id, {super.key});

  String formatDate(String isoDate) {
    final dateTime = DateTime.parse(isoDate).toLocal(); // Convert to local time
    return DateFormat('EEE, dd MMM').format(dateTime);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.only(left: 10, right: 10),
      children: [
        Container(
          width: double.infinity,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: List.generate(
              dashboardController.tNoti.length,
              (index) {
                String formatted =
                    formatDate(dashboardController.tNoti[index].date!);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (dashboardController.tNoti[index].message! != "")
                        Text(
                          formatted,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      const SizedBox(height: 8),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Html(
                              data: dashboardController.tNoti[index].message!,
                              style: {
                                "body": Style(
                                  margin: Margins.zero,
                                  fontSize: FontSize.medium,
                                ),
                                "p": Style(
                                  margin: Margins.zero,
                                ),
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2, // 2 items per row
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1, // Adjust as needed
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
                      subId: id,
                      bookId: booklist[index].sId!,
                    ),
                  ),
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
          },
        ),
      ],
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
          color: Colors.black87,
          image: imageAsset.isNotEmpty
              ? DecorationImage(
                  image: NetworkImage(imageAsset),
                  fit: BoxFit.cover,
                )
              : null, // Show only if there's an image
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

class TestsTab extends StatelessWidget {
  final List<TestMarksModelData> markList;

  TestsTab({required this.markList});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.all(16),
      children: markList.map((testData) {
        final date = formatDate(testData.publishedDate ?? "");
        final submissions = testData.submissions ?? [];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(date, style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            ...submissions.map((submission) => studentScoreRow(
                  submission.name ?? "Unknown",
                  submission.result ?? "Ab",
                )),
            SizedBox(height: 16),
          ],
        );
      }).toList(),
    );
  }

  Widget studentScoreRow(String name, String score) {
    final isAbsent = score.toLowerCase() == "ab";
    return ListTile(
      contentPadding: EdgeInsets.symmetric(vertical: 0),
      title: Text(name),
      trailing: Container(
        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isAbsent ? Colors.red : Color(0xFF186BA5),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          score,
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  String formatDate(String dateStr) {
    try {
      DateTime dt = DateTime.parse(dateStr);
      return "${_getWeekday(dt.weekday)}, ${dt.day} ${_getMonth(dt.month)}";
    } catch (e) {
      return dateStr;
    }
  }

  String _getWeekday(int day) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days[(day - 1) % 7];
  }

  String _getMonth(int month) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    return months[(month - 1) % 12];
  }
}

class StudentSelectionScreen extends StatefulWidget {
  List<StudentModelData> students;
  StudentSelectionScreen({required this.students});
  @override
  _StudentSelectionScreenState createState() => _StudentSelectionScreenState();
}

class _StudentSelectionScreenState extends State<StudentSelectionScreen> {
  List<StudentModelData> students = [];
  DashboardController dashboardController = Get.find();

  bool get isAllSelected => students.every((s) => s.isSelected);
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getData();
  }

  Future<void> getData() async {
    students = widget.students;
    students = widget.students.map((student) {
      student.isSelected = false; // manually set
      return student;
    }).toList();
    setState(() {});
  }

  void toggleSelectAll(bool? val) {
    setState(() {
      for (var student in students) {
        student.isSelected = val ?? false;
      }
    });
  }

  void toggleStudent(int index, bool? val) {
    setState(() {
      students[index].isSelected = val ?? false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // backgroundColor: Color(0xffF6F8FC),
      body: Column(
        children: [
          // Tabs (if you want)
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Text("Select All",
                    style: TextStyle(fontWeight: FontWeight.bold)),
                Spacer(),
                Checkbox(
                  value: isAllSelected,
                  onChanged: toggleSelectAll,
                  checkColor: Colors.white, // white tick
                  activeColor: Color(0xff186BA5), // blue background
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(4), // Optional: rounded square
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: ListView.builder(
              itemCount: students.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(students[index].name!),
                  leading: Text("${index + 1}."),
                  trailing: Checkbox(
                    value: students[index].isSelected,
                    onChanged: (val) => toggleStudent(index, val),
                    checkColor: Colors.white, // white tick
                    activeColor: Color(0xff186BA5), // blue background
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(4), // Optional: rounded square
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Box
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              maxLines: 4,
              decoration: InputDecoration(
                hintText: "Type your message...",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide:
                      const BorderSide(color: AppColors.grey, width: 1.0),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide:
                      const BorderSide(color: AppColors.grey, width: 1.0),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide:
                      const BorderSide(color: AppColors.red, width: 1.0),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide:
                      const BorderSide(color: AppColors.grey, width: 1.0),
                ),
                disabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide:
                      const BorderSide(color: AppColors.grey, width: 1.0),
                ),
              ),
            ),
          ),

          // Buttons
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    style:
                        ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    onPressed: () async {
                      List<String> selectedStudentIds = students
                          .where((student) => student.isSelected)
                          .map((student) => student.sId!)
                          .toList();

                      print("Selected Student IDs: $selectedStudentIds");
                      var res = await dashboardController
                          .removeStu(selectedStudentIds);
                      if (res != null) {
                        Navigator.pop(context);
                      }
                    },
                    child: const Text(
                      "Remove Student",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xff186BA5)),
                    onPressed: () {},
                    child: Text("Send Message",
                        style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
