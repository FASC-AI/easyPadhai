import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_input.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/dashboard/teacher_bottomsheet.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/editTestModel.dart';
import 'package:easy_padhai/model/lesson_model.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:easy_padhai/model/question_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
// replace with actual model import

// class TestQuestionListScreen extends StatelessWidget {
//   final List<Tests> testList;

//   const TestQuestionListScreen({Key? key, required this.testList})
//       : super(key: key);

//   @override
//   Widget build(BuildContext context) {
//     //print(testList.length);
//     return Scaffold(
//       appBar: const CustomAppBar(
//         text: 'Edit Test',
//       ),
//       body: ListView.builder(
//         itemCount: testList.length,
//         itemBuilder: (context, index) {
//           final test = testList[index];
//           return Card(
//             margin: const EdgeInsets.all(8.0),
//             child: Padding(
//               padding: const EdgeInsets.all(12.0),
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text("Question ${index + 1}: ",
//                       style: const TextStyle(
//                           fontSize: 16, fontWeight: FontWeight.bold)),
//                   Html(
//                     data: "${test.description ?? 'No description'}",
//                     style: {
//                       "body": Style(
//                         fontSize: FontSize(16.0),
//                         margin: Margins.zero, // Remove default margins
//                         //  padding: Margins.zero, // Remove default padding
//                       ),
//                     },
//                   ),
//                   const SizedBox(height: 8),
//                   // if (test.optionText1 != null) Text("A: ${test.optionText1}"),
//                   // if (test.optionText2 != null) Text("B: ${test.optionText2}"),
//                   // if (test.optionText3 != null) Text("C: ${test.optionText3}"),
//                   // if (test.optionText4 != null) Text("D: ${test.optionText4}"),
//                   // const SizedBox(height: 8),
//                   // Text("Type: ${test.questionType ?? 'N/A'}"),
//                 ],
//               ),
//             ),
//           );
//         },
//       ),
//     );
//   }
// }

class EditTestScreen extends StatefulWidget {
  final Tests test;
  // Your test model containing existing test data
  List<Tests>? tests;
  final String bClassId;

  EditTestScreen({
    Key? key,
    required this.test,
    required this.tests,
    required this.bClassId,
  }) : super(key: key);

  @override
  _EditTestScreenState createState() => _EditTestScreenState();
}

class _EditTestScreenState extends State<EditTestScreen> {
  List<LData> lessonList = [];
  List<ClassDetail> classes = [];
  List<Books> booklist = [];
  List<Topics> topics = [];
  ClassDetail? selectedClass;
  Books? selectedBook;
  LData? selectedLesson;
  Topics? selectedTopic;
  DateTime selectedDate = DateTime.now();
  TimeOfDay? selectedTime;
  Duration testDuration = Duration.zero;

  final TextEditingController _dateController = TextEditingController();
  final TextEditingController _timeController = TextEditingController();
  final TextEditingController _durationController = TextEditingController();

  String subId = "";
  String classId = "";

  List<OnlineQuesmodelData> allQuestions = [];
  List<String> selectedQuestionIds = [];
  List<EData> selectTestList = [];
  String bookid = "";
  String lessonId = "";
  String topicId = "";
  DashboardController dashboardController = Get.find();

  Duration parseDuration(String duration) {
    List<String> parts = duration.split(':');
    int hours = int.parse(parts[0]);
    int minutes = int.parse(parts[1]);
    return Duration(hours: hours, minutes: minutes);
  }

  DateTime _getTodayDateTime(String timeStr) {
    final now = DateTime.now();
    final parts = timeStr.split(RegExp(r'[:\s]'));
    int hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);
    final period = parts[2].toLowerCase();

    if (period == 'pm' && hour != 12) hour += 12;
    if (period == 'am' && hour == 12) hour = 0;

    return DateTime(now.year, now.month, now.day, hour, minute);
  }

  void _initializeWithTestData() {
    // Parse date
    selectedDate =
        DateTime.tryParse(widget.test.publishedDate ?? '') ?? DateTime.now();

    // Parse time (format: "HH:mm")
    // if (widget.test.publishedTime != null) {
    //   final parts = widget.test.publishedTime!.split(":");
    //   if (parts.length == 2) {
    //     selectedTime =
    //         TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
    //   }
    // }
    // String publishedTime = widget.test.publishedTime!;
    // TimeOfDay time = parseTimeOfDay(publishedTime);
    // selectedTime = time;
    // print(selectedTime);

    // Duration
    testDuration = parseDuration(widget.test.duration ?? "00:00");

    // Set controllers
    _dateController.text = DateFormat('dd-MM-yyyy').format(selectedDate);
    _timeController.text = selectedTime?.format(context) ?? '';
    _durationController.text =
        "${testDuration.inHours.toString().padLeft(2, '0')}:${(testDuration.inMinutes % 60).toString().padLeft(2, '0')}";

    // Set selected question IDs (initial)
    // selectedQuestionIds = widget.test.questions?.map((q) => q.sId ?? '').toList() ?? [];
  }

  TimeOfDay parseTimeOfDay(String timeStr) {
    // Remove all types of invisible/non-breaking spaces
    String cleaned = timeStr
        .replaceAll(RegExp(r'[\u00A0\u2007\u202F\uFEFF]+'),
            ' ') // common non-breaking and invisible spaces
        .replaceAll(
            RegExp(r'\s+'), ' ') // collapse multiple spaces to a single space
        .trim();

    // Use intl to parse
    final DateTime dateTime = DateFormat.jm().parse(cleaned);
    return TimeOfDay(hour: dateTime.hour, minute: dateTime.minute);
  }

  @override
  void initState() {
    super.initState();
    classId = widget.bClassId;
    subId = dashboardController.profileModel?.data?.subjectDetail?[0].sId ?? "";

    // Initialize with existing test data
    _initializeWithTestData();
    getData();
  }

  Future<void> getData() async {
    classes = dashboardController.profileModel?.data?.classDetail ?? [];
    if (classId != null) {
      classes.retainWhere((classDetail) => classDetail.sId == classId);
    }

    selectedClass = classes.firstWhere(
      (c) => c.sId == widget.bClassId,
      orElse: () => classes.isNotEmpty ? classes.first : ClassDetail(),
    );

    bookid =
        widget.test.book?.isNotEmpty == true ? widget.test.book![0].sId! : "";
    lessonId = widget.test.lesson?.isNotEmpty == true
        ? widget.test.lesson![0].sId!
        : "";
    if (widget.test.topic != null && widget.test.topic!.isNotEmpty) {
      topicId = widget.test.topic![0].sId ?? "";
    } else {
      topicId = "";
    }

    // await dashboardController.getOnTest(
    //   widget.bClassId,
    //   subId,
    //   bookid,
    //   lessonId,
    //   topicId,
    //   widget.test.publishedDate!,
    //   widget.test.publishedTime!,
    // );

    // selectTestList = dashboardController.qList;
    // selectedQuestionIds =
    //     selectTestList.map((eData) => eData.sId?.trim() ?? '').toList();
    selectedQuestionIds =
        widget.tests!.map((q) => q.sId?.trim() ?? '').toList();
    // print(selectTestList);
    // print(selectedQuestionIds);
    // print(allQuestions.map((q) => q.sId));
    if (selectedClass != null) {
      await _loadBooks();
      await _loadLessons();
      await _loadTopics();
      await _loadQuestions();
    }
  }

  Future<void> _loadBooks() async {
    await dashboardController.getBook(subId, selectedClass!.sId!);
    setState(() {
      booklist = dashboardController.booklist;
      selectedBook = booklist.firstWhere(
        (b) => b.sId == bookid,
        orElse: () => booklist.isNotEmpty ? booklist.first : Books(),
      );
    });
  }

  Future<void> _loadLessons() async {
    if (selectedBook != null) {
      await dashboardController.getLesson(selectedBook!.sId!, subId);
      setState(() {
        lessonList = dashboardController.lessonlist;
        selectedLesson = lessonList.firstWhere(
          (l) => l.sId == lessonId,
          orElse: () => lessonList.isNotEmpty ? lessonList.first : LData(),
        );
      });
    }
  }

  Future<void> _loadTopics() async {
    if (selectedLesson != null) {
      setState(() {
        topics = selectedLesson?.topics ?? [];
        selectedTopic = topics.firstWhere(
          (t) => t.sId == topicId,
          orElse: () => topics.isNotEmpty ? topics.first : Topics(),
        );
      });
    }
  }

  Future<void> _loadQuestions() async {
    if (selectedClass != null && selectedBook != null) {
      await dashboardController.getOnlineQ1(
        selectedClass!.sId!,
        subId,
        selectedBook!.sId!,
        selectedLesson?.sId ?? "",
        selectedTopic?.sId ?? "",
      );

      setState(() {
        allQuestions = dashboardController.quesList;
        for (var question in allQuestions) {
          question.isPublished =
              selectedQuestionIds.contains(question.sId?.trim());
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(0.0),
        child: AppBar(
          backgroundColor: AppColors.theme,
          systemOverlayStyle: SystemUiOverlayStyle.light,
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Header Section
            Container(
              decoration: const BoxDecoration(color: AppColors.theme),
              padding: const EdgeInsets.only(
                  top: 30, left: 16, right: 16, bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Image.asset(
                          'assets/back.png',
                          width: MediaQuery.of(context).size.width * 0.09,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        "Edit Test",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const Spacer(),
                      SizedBox(
                        width: 100,
                        child: GestureDetector(
                          onTap: _selectDuration,
                          child: AbsorbPointer(
                            child: CustomInput(
                              readOnly: true,
                              label: 'Time',
                              controller: _durationController,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Main Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Class, Book, Lesson, Topic Dropdowns
                    _buildDropdownSelectors(),
                    const SizedBox(height: 20),

                    // Questions Section
                    _buildQuestionsSection(),
                    const SizedBox(height: 20),

                    // Submit Button
                    Center(
                      child: SizedBox(
                        width: 200,
                        child: ElevatedButton(
                          onPressed: _updateTest,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.theme,
                          ),
                          child: const Text(
                            "Update Test",
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Obx(() => CustomBottomNavBar(
            currentIndex: dashboardController.currentIndex.value,
            onTap: (index) {
              if (index == 1) {
                // Assuming index 1 is for creating batch
                BatchHelperTeacher.showCreateBatchBottomSheet(context);
                //_showdoneBatchBottomSheet(context);
              } else if (index == 2) {
                // Assuming index 1 is for creating batch
                BatchHelperTeacher.showFollowBatchBottomSheetTeacher(context);
                //_showdoneBatchBottomSheet(context);
              } else {
                dashboardController.changeIndex(index);
              }
            },
          )),
    );
  }

  Widget _buildDropdownSelectors() {
    return Column(
      children: [
        // Class Dropdown
        SizedBox(
          width: double.infinity,
          child: InputDecorator(
            decoration: _dropdownDecoration(),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<ClassDetail>(
                hint: const Text('Select class'),
                style: TextStyle(
                    fontSize: 12,
                    color: Colors.black,
                    overflow: TextOverflow.ellipsis),
                value: selectedClass,
                onChanged: (ClassDetail? value) async {
                  if (value != null) {
                    setState(() => selectedClass = value);
                    await _loadBooks();
                  }
                },
                items: classes
                    .map((cls) => DropdownMenuItem(
                          value: cls,
                          child: Text(cls.class1 ?? 'Unknown'),
                        ))
                    .toList(),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Book Dropdown
        if (selectedClass != null)
          SizedBox(
            width: double.infinity,
            child: InputDecorator(
              decoration: _dropdownDecoration(),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<Books>(
                  hint: const Text('Select book'),
                  style: TextStyle(
                      fontSize: 12,
                      color: Colors.black,
                      overflow: TextOverflow.ellipsis),
                  value: selectedBook,
                  onChanged: (Books? value) async {
                    if (value != null) {
                      setState(() => selectedBook = value);
                      await _loadLessons();
                    }
                  },
                  items: booklist
                      .map((book) => DropdownMenuItem(
                            value: book,
                            child: Text(book.book ?? 'Unknown'),
                          ))
                      .toList(),
                ),
              ),
            ),
          ),
        const SizedBox(height: 10),

        // Lesson Dropdown
        if (selectedBook != null)
          SizedBox(
            width: double.infinity,
            child: InputDecorator(
              decoration: _dropdownDecoration(),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<LData>(
                  hint: const Text('Select lesson'),
                  style: TextStyle(
                      fontSize: 12,
                      color: Colors.black,
                      overflow: TextOverflow.ellipsis),
                  value: selectedLesson,
                  onChanged: (LData? value) async {
                    if (value != null) {
                      setState(() => selectedLesson = value);
                      await _loadTopics();
                    }
                  },
                  items: lessonList
                      .map((lesson) => DropdownMenuItem(
                            value: lesson,
                            child: Text(lesson.lesson ?? 'Unknown'),
                          ))
                      .toList(),
                ),
              ),
            ),
          ),
        const SizedBox(height: 10),

        // Topic Dropdown
        if (selectedLesson != null && topics.isNotEmpty)
          SizedBox(
            width: double.infinity,
            child: InputDecorator(
              decoration: _dropdownDecoration(),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<Topics>(
                  hint: const Text('Select topic'),
                  style: TextStyle(
                      fontSize: 12,
                      color: Colors.black,
                      overflow: TextOverflow.ellipsis),
                  value: selectedTopic,
                  onChanged: (Topics? value) async {
                    if (value != null) {
                      setState(() => selectedTopic = value);
                      await _loadQuestions();
                    }
                  },
                  items: topics
                      .map((topic) => DropdownMenuItem(
                            value: topic,
                            child: Text(topic.topic ?? 'Unknown'),
                          ))
                      .toList(),
                ),
              ),
            ),
          ),
      ],
    );
  }

  InputDecoration _dropdownDecoration() {
    return const InputDecoration(
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: AppColors.grey7, width: 1.0),
        borderRadius: BorderRadius.all(Radius.circular(12)),
      ),
      contentPadding: EdgeInsets.only(left: 10, right: 10),
      filled: true,
      fillColor: Colors.white,
    );
  }

  Widget _buildQuestionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              "Test Questions",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            OutlinedButton.icon(
              onPressed: _showPublishDatePopup,
              icon: SvgPicture.asset('assets/publish.svg'),
              label: const Text(
                "Publish Date",
                style: TextStyle(
                    color: Color(0xff2180C3), fontWeight: FontWeight.bold),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xff2180C3)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Questions List
        Container(
          height: 300,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(5),
            border: Border.all(color: AppColors.grey7),
          ),
          child: Column(
            children: [
              // Header
              Container(
                width: double.infinity,
                padding:
                    const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
                decoration: const BoxDecoration(
                  color: Color(0xff4186B6),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(5),
                    topRight: Radius.circular(5),
                  ),
                ),
                child: Text(
                  "Questions (${selectedQuestionIds.length})",
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),

              // Questions List
              Expanded(
                child: allQuestions.isNotEmpty
                    ? ListView.separated(
                        itemCount: allQuestions.length,
                        separatorBuilder: (_, __) => const Divider(
                          color: Colors.grey,
                          thickness: 0.5,
                          height: 10,
                        ),
                        itemBuilder: (context, index) {
                          final question = allQuestions[index];
                          return CheckboxListTile(
                            checkColor: Colors.white,
                            activeColor: const Color(0xff186BA5),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4),
                            ),
                            title: Html(data: question.description ?? ''),
                            value: question.isPublished,
                            onChanged: (bool? value) {
                              setState(() {
                                question.isPublished = value ?? false;
                                if (value == true) {
                                  selectedQuestionIds.add(question.sId ?? '');
                                } else {
                                  selectedQuestionIds
                                      .remove(question.sId ?? '');
                                }
                              });
                            },
                          );
                        },
                      )
                    : _buildNoQuestionsUI(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNoQuestionsUI() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Image.asset(
          'assets/no_notification.png',
          height: 80,
        ),
        const SizedBox(height: 10),
        const Text(
          "No Questions Available",
          style: TextStyle(color: Colors.grey, fontSize: 16),
        ),
      ],
    );
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime(2101),
    );

    if (picked != null && picked != selectedDate) {
      setState(() {
        selectedDate = picked;
        _dateController.text = DateFormat('dd-MM-yyyy').format(selectedDate);
      });
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: selectedTime ?? TimeOfDay.now(),
    );

    if (picked != null && picked != selectedTime) {
      setState(() {
        selectedTime = picked;
        _timeController.text = picked.format(context);
      });
    }
  }

  Future<void> _selectDuration() async {
    final Duration? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(
        hour: testDuration.inHours,
        minute: testDuration.inMinutes % 60,
      ),
      builder: (BuildContext context, Widget? child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
          child: child ?? Container(),
        );
      },
    ).then((value) {
      if (value != null) {
        return Duration(hours: value.hour, minutes: value.minute);
      }
      return null;
    });

    if (picked != null) {
      setState(() {
        testDuration = picked;
        _durationController.text =
            "${picked.inHours.toString().padLeft(2, '0')}:${(picked.inMinutes % 60).toString().padLeft(2, '0')}";
      });
    }
  }

  void _showPublishDatePopup() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.white,
        title: const Text(
          "Update Test Publish Date",
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            GestureDetector(
              onTap: () => _selectDate(context),
              child: TextFormField(
                controller: _dateController,
                readOnly: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  hintText: "Pick a Date",
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.calendar_month,
                        color: Color(0xFF2765CA)),
                    onPressed: () => _selectDate(context),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            GestureDetector(
              onTap: () => _selectTime(context),
              child: TextFormField(
                controller: _timeController,
                readOnly: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  hintText: "Pick a Time",
                  suffixIcon: IconButton(
                    icon:
                        const Icon(Icons.access_time, color: Color(0xFF2765CA)),
                    onPressed: () => _selectTime(context),
                  ),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              if (_dateController.text.isNotEmpty &&
                  _timeController.text.isNotEmpty) {
                Navigator.pop(context);
                Get.snackbar(
                  "Success",
                  "Publish date updated to ${_dateController.text} at ${_timeController.text}",
                );
              } else {
                Get.snackbar("Error", "Please select both date and time.");
              }
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  Future<void> _updateTest() async {
    // Validation
    if (selectedQuestionIds.isEmpty) {
      Get.snackbar("Message", "Please select questions.",
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    if (_dateController.text.isEmpty) {
      Get.snackbar("Message", "Please select publish date.",
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    if (_timeController.text.isEmpty) {
      Get.snackbar("Message", "Please select publish time.",
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    if (_durationController.text.isEmpty) {
      Get.snackbar("Message", "Please enter test duration.",
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    // Prepare date with time
    final date = DateFormat('dd-MM-yyyy').parse(_dateController.text);

    // Format to ISO with offset (as in your original code)
    String isoDate = formatToISOWithOffset(date);

    // Call update API
    var success = await dashboardController.updateTest(
      selectedQuestionIds,
      isoDate,
      _timeController.text,
      _durationController.text,
    );

    if (success != null && success != false) {
      await dashboardController.getAllPubTest(classId, subId);

      Navigator.pop(context);
    }
  }

  String formatToISOWithOffset(DateTime date) {
    // Add 5 hours and 30 minutes to the date
    DateTime adjustedDate = date.add(const Duration(hours: 5, minutes: 30));
    // Convert to UTC and format as ISO 8601 string
    return adjustedDate.toUtc().toIso8601String();
  }
}
