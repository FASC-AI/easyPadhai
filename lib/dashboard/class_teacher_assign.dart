import 'dart:io';

import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar3.dart';
import 'package:easy_padhai/dashboard/HtmlLatexViewer.dart';
import 'package:easy_padhai/dashboard/edit_offlinetest.dart';
import 'package:easy_padhai/dashboard/lesson.dart';
import 'package:easy_padhai/dashboard/offline_question_paper.dart';
import 'package:easy_padhai/dashboard/popup1.dart';
import 'package:easy_padhai/dashboard/popup2.dart';
import 'package:easy_padhai/dashboard/popup3.dart';
import 'package:easy_padhai/dashboard/pub_read.dart';
import 'package:easy_padhai/dashboard/question_paper.dart';
import 'package:easy_padhai/dashboard/testview.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/bstudent_model.dart';
import 'package:easy_padhai/model/latest_assgn_model.dart';
import 'package:easy_padhai/model/notes_model.dart';
import 'package:easy_padhai/model/offline_test_list.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:easy_padhai/model/test_marks_model.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';

class TeacherClassScreen extends StatefulWidget {
  String batch_id;
  String title;
  String id;
  String sub_id;
  String sec_id;
  bool isClassteacher;
  TeacherClassScreen(
      {super.key,
      required this.batch_id,
      required this.title,
      required this.id,
      required this.sub_id,
      required this.sec_id,
      required this.isClassteacher});

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
  List<NotesData> noteslist = [];
  bool isload = false;
  String id = "";
  String batchClassId = "";
  LatestAssgnModelData? latestAssgnModelData;
  List<OfflineTestListData> offlinetestList = [];
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
    dashboardController.batchId.value = widget.batch_id;
    print("bId" + dashboardController.batchId.value);
    id = dashboardController.profileModel?.data?.subjectDetail![0].sId! ?? "";
    await dashboardController.getBook(id, widget.id);
    booklist = dashboardController.booklist;
    await dashboardController.getAllPubTest(batchClassId, id);
    testList = dashboardController.testList;
    await dashboardController.getStudentfromBatch(batchClassId);
    students = dashboardController.studentList;
    await dashboardController.getStuTestMarks(
        batchClassId, id, dashboardController.batchId.value);
    markList = dashboardController.marksList;
    await dashboardController.getAssignment(batchClassId, id);
    latestAssgnModelData = dashboardController.assignData;
    await dashboardController.getNotes(batchClassId, id);
    noteslist = dashboardController.notelist;
    await dashboardController.getofflinePubTest(batchClassId, id);
    offlinetestList = dashboardController.offlinetestList;
    setState(() {
      isload = false;
    });
  }

  Future<void> _onRefresh() async {
    // Your refresh logic
    await _loadProfileData();
    //_refreshController.refreshCompleted();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        text: widget.title,
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: !isload
            ? SafeArea(
                child: SizedBox(
                  width: MediaQuery.of(context).size.width,
                  height: MediaQuery.of(context).size.height,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                          height: 54,
                          decoration:
                              const BoxDecoration(color: AppColors.theme),
                          child: Container(
                            margin: const EdgeInsets.fromLTRB(20, 0, 20, 10),
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
                              ? AssignmentsTab(
                                  booklist,
                                  id,
                                  latestAssgnModelData,
                                  batchClassId,
                                  noteslist,
                                  () => setState(() {
                                    noteslist = dashboardController.notelist;
                                  }),
                                  () => setState(() {
                                    noteslist = dashboardController.notelist;
                                  }),
                                )
                              : selectedTabIndex == 1
                                  ? TestsTab(markList: markList)
                                  : selectedTabIndex == 2
                                      ? StudentSelectionScreen(
                                          students: students,
                                          isClassteacher: widget.isClassteacher,
                                          class_id: batchClassId,
                                          sub_id: id,
                                        )
                                      : null,
                        ),
                      ),
                    ],
                  ),
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
      ),
      bottomNavigationBar: Obx(() => CustomBottomNavBar3(
            currentIndex: dashboardController.currentIndex2.value,
            onTap: (index) {
              if (index == 1) {
                // Assuming index 1 is for creating batch
                //_showCreateBatchBottomSheet(context);
                //_showdoneBatchBottomSheet(context);
                showModeSelectionPopup(context);
                setState(() {
                  testList = dashboardController.testList;
                });
                setState(() {
                  offlinetestList = dashboardController.offlinetestList;
                });
              } else {
                dashboardController.changeIndex3(index);
              }
            },
          )),
    );
  }

  void showModeSelectionPopup(BuildContext context) {
    // await dashboardController.getofflinePubTest(batchClassId, id);
    setState(() {
      testList = dashboardController.testList;
      offlinetestList = dashboardController.offlinetestList;
    });

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
              setState(() {
                testList = dashboardController.testList;
              });
            },
            onEdit: (test) {
              Navigator.pop(context);
              bool editable = canEdit(test.publishedDate!);
              if (editable) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => EditTestScreen(
                      test: test.tests![0],
                      tests: test.tests,
                      bClassId: batchClassId,
                    ),
                  ),
                );
                setState(() {
                  testList = dashboardController.testList;
                });
              } else {
                Get.snackbar(
                  "Test not editable",
                  "Editable Date is passed.",
                  snackPosition: SnackPosition.BOTTOM,
                  duration: const Duration(seconds: 3),
                );
              }
            },
            onDelete: (test) {
              // Navigator.pop(context);
              _confirmDelete(context, test);
            });
        //   onOptionSelect: (testList) {
        //     //print("Options for $test");

        //     Navigator.of(context).pop();
        //     // Navigator.push(
        //     //   context,
        //     //   MaterialPageRoute(
        //     //     builder: (_) => TestQuestionListScreen(testList: testList),
        //     //   ),
        //     // );
        //   },
        // );
      },
    );
  }

  bool canEdit(String publishedDateStr) {
    // Parse the publishedDate string (e.g., "2025-06-18")
    DateTime publishedDate = DateTime.parse(publishedDateStr);

    // Get the current date without time
    DateTime today = DateTime.now();
    DateTime currentDate = DateTime(today.year, today.month, today.day);

    // Subtract one day from publishedDate
    DateTime lastEditableDate = publishedDate.subtract(const Duration(days: 1));

    // Allow editing only if today is before or equal to lastEditableDate
    return currentDate.isBefore(publishedDate);
  }

  void _confirmDelete(BuildContext context, OnlineTestModel1Data test) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.white,
        title: const Text("Delete Test"),
        content: const Text("Are you sure you want to delete this test?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () async {
              // Perform delete logic here
              // print("Deleted test ID: ${test.id}"); // replace with real logic
              await dashboardController.deleteOntest(
                  test.tests![0].duration!,
                  test.publishedDate!,
                  test.tests![0].publishedTime!,
                  batchClassId,
                  widget.sub_id,
                  context);
            },
            child: const Text("Delete", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteOff(BuildContext context, OfflineTestListData test) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.white,
        title: const Text("Delete Test"),
        content: const Text("Are you sure you want to delete this test?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () async {
              // Perform delete logic here
              // print("Deleted test ID: ${test.id}"); // replace with real logic
              await dashboardController.deleteOffline(
                  test.sId!, batchClassId, widget.sub_id, context);
            },
            child: const Text("Delete", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void showOfflineTestListPopup(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return OfflineTestListPopup(
            testList: offlinetestList,
            onCreateNew: () {
              Navigator.of(context).pop();
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => CreateOfflineTestScreen(
                          bClassId: batchClassId,
                        )),
              );
              setState(() {
                offlinetestList = dashboardController.offlinetestList;
              });
            },
            onEdit: (test) {
              Navigator.pop(context);

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => EditOfflineTestScreen(
                    testList: offlinetestList,
                    testToEdit: test,
                    bClassId: batchClassId,
                  ),
                ),
              );
              setState(() {
                offlinetestList = dashboardController.offlinetestList;
              });
            },
            onDelete: (test) {
              // Navigator.pop(context);
              _confirmDeleteOff(context, test);
            });
      },
    );
  }

  Widget buildTab(String title, int index) {
    final bool isSelected = selectedTabIndex == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => selectedTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
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
              fontSize: MediaQuery.of(context).size.width * .03,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
// replace with your controller import

class AssignmentsTab extends StatefulWidget {
  final List<Books> booklist;
  List<NotesData> noteslist;
  String id;
  String batchClassId;
  final LatestAssgnModelData? latestAssgnModelData;
  final Function() onNoteAdded;
  final Function() onNoteDeleted;

  AssignmentsTab(this.booklist, this.id, this.latestAssgnModelData,
      this.batchClassId, this.noteslist, this.onNoteAdded, this.onNoteDeleted,
      {super.key});
  @override
  State<AssignmentsTab> createState() => _ProfileEditState1();
}

class _ProfileEditState1 extends State<AssignmentsTab> {
  DashboardController dashboardController = Get.find();
  int selectedTabIndex = 0;
  String formatDate(String isoDate) {
    try {
      final dateTime = DateTime.parse(isoDate).toLocal();
      return DateFormat('EEE, dd MMM').format(dateTime);
    } catch (e) {
      return isoDate; // fallback if date format fails
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = widget.latestAssgnModelData?.publishedDate != null
        ? formatDate(widget.latestAssgnModelData!.publishedDate!)
        : "";

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Show assignment section if available
          (widget.latestAssgnModelData?.question != null &&
                  widget.latestAssgnModelData!.question!.isNotEmpty)
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      formattedDate,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    ...widget.latestAssgnModelData!.question!
                        .map((q) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: HtmlLatexViewer(
                                htmlContent: q.question ?? '',
                                minHeight: 24,
                                //  maxHeight: 50,
                                //  style: const TextStyle(fontSize: 14),
                              ),
                            )),
                    const SizedBox(height: 16),
                  ],
                )
              : const SizedBox(
                  height: 220,
                  child: Center(
                      child: Text(
                    "",
                    style: TextStyle(
                      fontSize: 16,
                    ),
                  )),
                ),

          // Always show books
          SizedBox(
            width: double.infinity,
            height: 160,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: widget.booklist.length,
              shrinkWrap: true,
              // physics: const NeverScrollableScrollPhysics(),
              // gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              //   crossAxisCount: 2,
              //   crossAxisSpacing: 12,
              //   mainAxisSpacing: 12,
              //   childAspectRatio: 1,
              // ),
              itemBuilder: (context, index) {
                final book = widget.booklist[index];
                final imageUrl = book.images != null && book.images!.isNotEmpty
                    ? book.images!.first.url ?? ""
                    : "";

                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => LessonScreen(
                          title: book.book ?? "",
                          subId: widget.id,
                          bookId: book.sId ?? "",
                        ),
                      ),
                    );
                  },
                  child: Padding(
                    padding: EdgeInsets.only(right: 10),
                    child: buildTile(
                      label: book.book ?? "",
                      imageAsset: imageUrl,
                      color: Colors.black87,
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 210,
            child: Row(
              children: [
                if (widget.noteslist.isEmpty)
                  Column(
                    children: [
                      GestureDetector(
                        onTap: () {
                          showAddNoteDialog(
                            context,
                            widget.batchClassId,
                            widget.id,
                          );
                        },
                        child: SizedBox(
                          width: 130,
                          height: 160,
                          child: Image.asset(
                            "assets/notes.png",
                            fit: BoxFit.fill,
                          ),
                        ),
                      ),
                      // const SizedBox(height: 5),
                      // const Text(
                      //   "Up to 10 mb file size\nare allowed",
                      //   style: TextStyle(color: AppColors.red, fontSize: 10),
                      //   textAlign: TextAlign.center,
                      // ),
                    ],
                  ),
                if (widget.noteslist.isEmpty) const SizedBox(width: 10),
                Expanded(
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: widget.noteslist.length,
                    itemBuilder: (context, index) {
                      final note =
                          widget.noteslist[index].notes?.isNotEmpty == true
                              ? widget.noteslist[index].notes![0]
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
                                      padding: const EdgeInsets.only(top: 10),
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
                            Positioned(
                              top: 10,
                              right: 10,
                              child: GestureDetector(
                                onTap: () {
                                  confirmDelete1(
                                    context,
                                    widget.noteslist[index].sId!,
                                    widget.noteslist,
                                  );
                                },
                                child: SvgPicture.asset(
                                  "assets/delete.svg",
                                  width: 20,
                                  height: 20,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  File? selectedPdfFile;

  void showAddNoteDialog(BuildContext context, String clsid, String subid) {
    final TextEditingController titleController = TextEditingController();
    final TextEditingController fileController = TextEditingController();
    final DashboardController dashboardController = Get.find();

    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: AppColors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Close icon
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Add Note",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      )),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.close),
                  )
                ],
              ),
              const SizedBox(height: 10),

              // Error message
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Only 1 PDF allowed (up to 10 MB). Ensure it contains the entire syllabus",
                  style: TextStyle(color: AppColors.red, fontWeight: FontWeight.w600, fontSize: 10),
                ),
              ),
              // const SizedBox(height: 5),
              // const Align(
              //   alignment: Alignment.centerLeft,
              //   child: Text(
              //     "Up to 10 mb file size\nare allowed",
              //     style: TextStyle(color: AppColors.red, fontSize: 13),
              //     textAlign: TextAlign.center,
              //   ),
              // ),
              const SizedBox(height: 16),

              // Title field
              TextField(
                controller: titleController,
                decoration: InputDecoration(
                  hintText: "Enter title",
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey, width: 1.0),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey, width: 1.0),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey, width: 1.0),
                  ),
                  disabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppColors.grey7, width: 1.0),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // File picker field (disabled TextField with upload icon)
              GestureDetector(
                onTap: () async {
                  // TODO: Implement file picker (PDF only)
                  // Example: use file_picker package
                  final result = await FilePicker.platform.pickFiles(
                      type: FileType.custom, allowedExtensions: ['pdf']);
                  if (result != null) {
                    final file = File(result.files.single.path!);
                    fileController.text = result.files.single.name;
                    selectedPdfFile = file; // <- Save for upload
                  }
                  setState(() =>
                      fileController.text = result?.files.single.name ?? '');
                },
                child: AbsorbPointer(
                  child: TextField(
                    controller: fileController,
                    decoration: InputDecoration(
                      hintText: "Choose PDF",
                      suffixIcon: SizedBox(
                          width: 15,
                          height: 15,
                          child: Image.asset("assets/up_icon.png")),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey, width: 1.0),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey, width: 1.0),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey, width: 1.0),
                      ),
                      disabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide:
                            BorderSide(color: AppColors.grey7, width: 1.0),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Submit button
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  onPressed: () async {
                    if (selectedPdfFile != null) {
                      await dashboardController.uploadPdfFile(
                          selectedPdfFile!,
                          titleController.text.toString().trim(),
                          widget.id,
                          widget.batchClassId);

                      //  Navigator.pop(context);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Please choose a PDF file first')),
                      );
                    }
                  },
                  child: const Text("Submit",
                      style: TextStyle(fontSize: 14, color: AppColors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void confirmDelete1(
      BuildContext context, String id, List<NotesData> noteslist) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.white,
        title: const Text("Delete Note"),
        content: const Text("Are you sure you want to delete Note?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () async {
              // Perform delete logic here
              // print("Deleted test ID: ${test.id}");
              var succ = await dashboardController.deleteNote(
                  id, widget.batchClassId, widget.id, context);
              if (succ != null && succ != false) {
                widget.onNoteDeleted();
                Navigator.pop(context);
                Navigator.pop(context);
                // Refresh parent widget
              }
            },
            child: const Text("Delete", style: TextStyle(color: Colors.red)),
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
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 130,
        decoration: BoxDecoration(
          color: color,
          image: imageAsset.isNotEmpty
              ? DecorationImage(
                  image: NetworkImage(imageAsset),
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
                overflow: TextOverflow.ellipsis,
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
  bool isClassteacher;
  String class_id;
  String sub_id;
  StudentSelectionScreen(
      {required this.students,
      required this.isClassteacher,
      required this.class_id,
      required this.sub_id});
  @override
  _StudentSelectionScreenState createState() => _StudentSelectionScreenState();
}

class _StudentSelectionScreenState extends State<StudentSelectionScreen> {
  List<StudentModelData> students = [];
  DashboardController dashboardController = Get.find();
  TextEditingController messageController = TextEditingController();
  bool isVisible = false;
  bool isVisible1 = false;
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
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // "Select All" Header
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
                      checkColor: Colors.white,
                      activeColor: Color(0xff186BA5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ),
              ),

              // List of Students (Use shrinkWrap with physics)
              ListView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemCount: students.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text(students[index].name!),
                    leading: Text("${index + 1}."),
                    trailing: Checkbox(
                      value: students[index].isSelected,
                      onChanged: (val) => toggleStudent(index, val),
                      checkColor: Colors.white,
                      activeColor: Color(0xff186BA5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  );
                },
              ),

              // Message Box
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: TextField(
                  maxLines: 4,
                  controller: messageController,
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
                  ),
                ),
              ),

              // Buttons
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    if (widget.isClassteacher)
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red),
                          onPressed: () async {
                            List<String> selectedStudentIds = students
                                .where((student) => student.isSelected)
                                .map((student) => student.sId!)
                                .toList();
                            if (selectedStudentIds.isEmpty) {
                              Get.snackbar("Message", "Please select students",
                                  snackPosition: SnackPosition.BOTTOM);
                              // Navigator.of(context).pop();
                              return;
                            } else {
                              showRemoveStudentDialog(context);
                            }
                          },
                          child: !isVisible
                              ? Text(
                                  "Remove Student",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize:
                                        MediaQuery.of(context).size.width * .03,
                                  ),
                                )
                              : SizedBox(
                                  width: 30,
                                  height: 30,
                                  child: Lottie.asset(
                                    'assets/loading.json',
                                    width: 30,
                                    height: 30,
                                    repeat: true,
                                    animate: true,
                                    reverse: false,
                                  ),
                                ),
                        ),
                      ),
                    SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xff186BA5)),
                        onPressed: () async {
                          List<String> selectedStudentIds = students
                              .where((student) => student.isSelected)
                              .map((student) => student.sId!)
                              .toList();
                          if (messageController.text.isEmpty) {
                            Get.snackbar(
                                "Message", "Please write any message to send",
                                snackPosition: SnackPosition.BOTTOM);
                            return;
                          }
                          if (selectedStudentIds.isEmpty) {
                            Get.snackbar("Message", "Please select students",
                                snackPosition: SnackPosition.BOTTOM);
                            return;
                          }
                          setState(() {
                            isVisible1 = true;
                          });
                          var res = await dashboardController.sendMesgStu(
                            selectedStudentIds,
                            messageController.text.toString().trim(),
                            widget.class_id,
                            widget.sub_id,
                          );
                          if (res != null) {
                            Navigator.pop(context);
                          }
                          setState(() {
                            isVisible1 = false;
                          });
                        },
                        child: !isVisible1
                            ? Text("Send Message",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize:
                                      MediaQuery.of(context).size.width * .03,
                                ))
                            : SizedBox(
                                width: 30,
                                height: 30,
                                child: Lottie.asset(
                                  'assets/loading.json',
                                  width: 30,
                                  height: 30,
                                  repeat: true,
                                  animate: true,
                                  reverse: false,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void showRemoveStudentDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: AppColors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding:
                const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Image.asset(
                  'assets/trash.png', // <-- Replace with your actual asset path
                  height: 80,
                ),
                const SizedBox(height: 24),
                const Text(
                  "Are you sure you want to remove this student? This action cannot be undone.",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // OK Button
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        minimumSize: const Size(100, 40),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                      onPressed: () async {
                        // Handle remove logic
                        //  Navigator.of(context).pop(); // Close dialog
                        List<String> selectedStudentIds = students
                            .where((student) => student.isSelected)
                            .map((student) => student.sId!)
                            .toList();
                        if (selectedStudentIds.isEmpty) {
                          Get.snackbar("Message", "Please select students",
                              snackPosition: SnackPosition.BOTTOM);
                          Navigator.of(context).pop();
                          return;
                        }
                        setState(() {
                          isVisible = true;
                        });

                        // print("Selected Student IDs: $selectedStudentIds");

                        var res = await dashboardController.removeStu(
                            selectedStudentIds, context);
                        if (res != null) {
                          Navigator.pop(context);
                          setState(() {
                            isVisible = false;
                          });
                        } else {
                          setState(() {
                            isVisible = false;
                          });
                        }
                      },
                      child: const Text(
                        "Ok",
                        style: TextStyle(color: AppColors.white),
                      ),
                    ),

                    // Cancel Button
                    OutlinedButton(
                      style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.grey),
                          minimumSize: const Size(100, 40),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          )),
                      onPressed: () {
                        Navigator.of(context).pop(); // Just close dialog
                      },
                      child: const Text(
                        "Cancel",
                        style: TextStyle(color: AppColors.grey),
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        );
      },
    );
  }
}
