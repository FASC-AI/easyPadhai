import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_input.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/custom_widgets/text.dart';
import 'package:easy_padhai/dashboard/HtmlLatexViewer.dart';
import 'package:easy_padhai/dashboard/instruction_popup.dart';
import 'package:easy_padhai/dashboard/teacher_bottomsheet.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/instruc_model.dart';
import 'package:easy_padhai/model/lesson_model.dart';
import 'package:easy_padhai/model/offline_test_list.dart';
import 'package:easy_padhai/model/offline_test_model.dart';
import 'package:easy_padhai/model/profile_model.dart';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

class EditOfflineTestScreen extends StatefulWidget {
  final String bClassId;
  final OfflineTestListData testToEdit;
  final List<OfflineTestListData> testList;

  EditOfflineTestScreen(
      {required this.bClassId,
      required this.testToEdit,
      required this.testList});

  @override
  _EditOfflineTestScreenState createState() => _EditOfflineTestScreenState();
}

class _EditOfflineTestScreenState extends State<EditOfflineTestScreen> {
  List<LData> lessonList = [];
  List<ClassDetail> classes = [];
  List<Books> booklist = [];
  List<Topics> topics = [];
  ClassDetail? selectedClass;
  Books? selectedbook;
  LData? selectedlesson;
  Topics? selectedtopic;
  DateTime selectedDate = DateTime.now();
  String selectDate = '';
  String sub_id = "";
  final TextEditingController _dateController = TextEditingController();
  final TextEditingController sessionController = TextEditingController();
  List<GroupedTests> questions = [];
  List<String> selectedQuestionIds = [];
  List<String> selectedQuestionTF = [];
  List<String> selectedQuestionAR = [];
  List<String> selectedQuestionDS = [];
  DashboardController dashboardController = Get.find();
  List<Tests> mcqQuestions = [];
  List<Tests> TFQuestions = [];
  List<Tests> ARQuestions = [];
  List<Tests> DSQuestions = [];
  Duration testDuration = Duration.zero;
  bool tfExpanded = false;
  bool dsExpanded = false;
  bool ds1Expanded = false;
  String ids = "";
  List<String> selectedInstructions = [];
  List<English> engIns = [];
  List<Hindi> hindiIns = [];

  final TextEditingController _durationController = TextEditingController();
  Duration _duration = const Duration(hours: 0, minutes: 0);
  TimeOfDay? selectTime;
  final TextEditingController _timeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    ids = widget.testToEdit.sId!;
    _initializeTestData();
    getdata();
  }

  void _initializeTestData() {
    // Initialize form fields with test data
    sessionController.text = widget.testToEdit.session ?? '';

    // Parse duration from test data
    if (widget.testToEdit.duration != null) {
      testDuration = parseDuration(widget.testToEdit.duration ?? "00:00");
      _durationController.text =
          "${testDuration.inHours.toString().padLeft(2, '0')}:${(testDuration.inMinutes % 60).toString().padLeft(2, '0')}";
    }

    // Initialize selected questions from test data
    if (widget.testToEdit.testIds != null) {
      selectedQuestionIds = widget.testToEdit.testIds!
          .where((q) => q.type == "MCQ")
          .map((q) => q.sId?.trim() ?? '')
          .toList();
      selectedQuestionTF = widget.testToEdit.testIds!
          .where((q) => q.type == "True/False")
          .map((q) => q.sId?.trim() ?? '')
          .toList();

      selectedQuestionAR = widget.testToEdit.testIds!
          .where((q) => q.type == "Assertion-Reason")
          .map((q) => q.sId?.trim() ?? '')
          .toList();
      selectedQuestionDS = widget.testToEdit.testIds!
          .where((q) => q.type == "Descriptive")
          .map((q) => q.sId?.trim() ?? '')
          .toList();
    }

    // Initialize other fields as needed
  }

  Duration parseDuration(String duration) {
    List<String> parts = duration.split(':');
    int hours = int.parse(parts[0]);
    int minutes = int.parse(parts[1]);
    return Duration(hours: hours, minutes: minutes);
  }

  Future<void> getdata() async {
    classes = dashboardController.profileModel?.data?.classDetail! ?? [];
    sub_id =
        dashboardController.profileModel?.data?.subjectDetail?[0].sId! ?? "";
    classes.retainWhere((classDetail) => classDetail.sId == widget.bClassId);

    // Set selected class if available
    selectedClass = classes.firstWhere(
      (c) => c.sId == widget.bClassId,
      orElse: () => classes.first,
    );

    // Load books for selected class
    if (selectedClass != null) {
      await dashboardController.getBook(sub_id, selectedClass!.sId!);
      setState(() {
        booklist = dashboardController.booklist;
      });

      // Set selected book if available
      if (widget.testToEdit.bookId != null) {
        selectedbook = booklist.firstWhere(
          (b) => b.sId == widget.testToEdit.bookId,
          orElse: () => booklist.first,
        );
      }

      // Load lessons for selected book
      if (selectedbook != null) {
        await dashboardController.getLesson(selectedbook!.sId!, sub_id);
        setState(() {
          lessonList = dashboardController.lessonlist;
        });

        // Set selected lesson if available
        if (widget.testToEdit.lessonId != null) {
          selectedlesson = lessonList.firstWhere(
            (l) => l.sId == widget.testToEdit.lessonId,
            orElse: () => lessonList.first,
          );
        }

        // Load topics for selected lesson
        if (selectedlesson != null) {
          setState(() {
            topics = selectedlesson!.topics!;
          });

          // Set selected topic if available
          if (widget.testToEdit.topicId != null) {
            selectedtopic = topics.firstWhere(
              (t) => t.sId == widget.testToEdit.topicId,
              orElse: () => topics.first,
            );
          }
        }

        // Load questions based on selections
        await _loadQuestions();
      }
    }
  }

  void showInstructionPopup(BuildContext context) async {
    selectedInstructions = await showDialog(
      context: context,
      builder: (context) => InstructionPopup(
        englishInstructions: engIns,
        hindiInstructions: hindiIns,
        preSelectedIds: selectedInstructions,
      ),
    );

    if (selectedInstructions != null) {
      // Use the selected instructions here

      print("Selected: $selectedInstructions");
    }
  }

  Future<void> _loadQuestions() async {
    if (selectedClass != null && selectedbook != null) {
      String lessonId = selectedlesson?.sId ?? "";
      String topicId = selectedtopic?.sId ?? "";

      await dashboardController.getOfflineQ1(
        selectedClass!.sId!,
        sub_id,
        selectedbook!.sId!,
        lessonId,
        topicId,
      );
      await dashboardController.getInstruction(
          selectedClass!.sId!, sub_id, "Offline Test");
      setState(() {
        engIns = dashboardController.instruction!.english!;
        hindiIns = dashboardController.instruction!.hindi!;
        // selectedInstructions = widget.testList.first.instructionId!
        //     .map((q) => q.sId?.trim() ?? '')
        //     .toList();
        questions.clear();
        ARQuestions.clear();
        DSQuestions.clear();
        mcqQuestions.clear();
        TFQuestions.clear();
        questions = dashboardController.OffquesList;

        if (questions.isNotEmpty) {
          for (int i = 0; i < questions.length; i++) {
            if (questions[i].sId == "Assertion-Reason") {
              ARQuestions = questions[i].tests!;
            } else if (questions[i].sId == "Descriptive") {
              DSQuestions = questions[i].tests!;
            } else if (questions[i].sId == "MCQ") {
              mcqQuestions = questions[i].tests!;
            } else if (questions[i].sId == "True/False") {
              TFQuestions = questions[i].tests!;
            }
          }
        }
      });
    }
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
        selectDate = DateFormat('dd-MM-yyyy')
            .format(selectedDate.toLocal())
            .split(' ')[0];
        _dateController.text = selectDate;
      });
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );

    if (picked != null && picked != selectTime) {
      setState(() {
        selectTime = picked;
        _timeController.text = picked.format(context);
      });
    }
  }

  Future<void> _selectDuration() async {
    final Duration? picked = await showTimePicker(
      context: context,
      initialTime:
          TimeOfDay(hour: _duration.inHours, minute: _duration.inMinutes % 60),
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
        _duration = picked;
        _durationController.text =
            "${picked.inHours.toString().padLeft(2, '0')}:${(picked.inMinutes % 60).toString().padLeft(2, '0')}";
      });
    }
  }

  Widget buildTypeSection({
    required String title,
    required int count,
    required bool isExpanded,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(top: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.blue.shade100,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              child: Text(
                "$count",
                style: const TextStyle(color: Colors.white, fontSize: 14),
              ),
            ),
            const SizedBox(width: 10),
            Icon(
              isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
              color: Colors.black,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
          preferredSize: const Size.fromHeight(0.0),
          child: AppBar(
            backgroundColor: AppColors.theme,
            systemOverlayStyle: SystemUiOverlayStyle.light,
          )),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              Container(
                decoration: const BoxDecoration(color: AppColors.theme),
                padding: const EdgeInsets.only(
                    top: 30, left: 16, right: 16, bottom: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        // Back Button
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Image.asset(
                            'assets/back.png',
                            fit: BoxFit.fill,
                            width: MediaQuery.of(context).size.width * 0.09,
                          ),
                        ),
                        const SizedBox(width: 12),

                        // Title
                        const Text(
                          "Edit Paper",
                          style: TextStyle(
                            overflow: TextOverflow.ellipsis,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),

                        const Spacer(),
                        SizedBox(
                          width: 70,
                          child: CustomInput(
                            label: 'Session',
                            controller: sessionController,
                            inputType: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 10),
                        SizedBox(
                          width: 70,
                          child: GestureDetector(
                            onTap: () {
                              _selectDuration();
                            },
                            child: AbsorbPointer(
                              child: CustomInput(
                                readOnly: true,
                                label: 'Time',
                                controller: _durationController,
                              ),
                            ),
                          ),
                        )
                      ],
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          child: InputDecorator(
                            decoration: const InputDecoration(
                              enabledBorder: OutlineInputBorder(
                                borderSide: BorderSide(
                                    color: AppColors.grey7, width: 1.0),
                                borderRadius:
                                    BorderRadius.all(Radius.circular(12)),
                              ),
                              contentPadding: EdgeInsets.only(
                                  left: 10, top: 0, bottom: 0, right: 10),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<ClassDetail>(
                                hint: const Text('Select class'),
                                style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.black,
                                    overflow: TextOverflow.ellipsis),
                                value: selectedClass,
                                dropdownColor: Colors.lightBlue.shade50,
                                onChanged: (ClassDetail? value) async {
                                  if (value != null) {
                                    setState(() {
                                      selectedClass = value;
                                      selectedbook = null;
                                      selectedlesson = null; // 🔥 Reset lesson
                                      selectedtopic = null;
                                    });

                                    await dashboardController.getBook(
                                        sub_id, value.sId!);
                                    setState(() {
                                      booklist = dashboardController.booklist;
                                    });

                                    if (!classes.contains(selectedClass)) {
                                      setState(() {
                                        selectedClass = null;
                                        selectedbook = null;
                                        selectedlesson = null;
                                        selectedtopic = null;
                                      });
                                    }
                                    if (!booklist.contains(selectedbook)) {
                                      setState(() {
                                        selectedbook = null;
                                        selectedlesson = null;
                                        selectedtopic = null;
                                      });
                                    }
                                    if (!lessonList.contains(selectedlesson)) {
                                      setState(() {
                                        selectedlesson = null;
                                        selectedtopic = null;
                                      });
                                    }
                                    if (!topics.contains(selectedtopic)) {
                                      setState(() {
                                        selectedtopic = null;
                                      });
                                    }
                                  }
                                },
                                items: classes.map((ClassDetail cls) {
                                  return DropdownMenuItem<ClassDetail>(
                                    value: cls,
                                    child: Text(cls.class1 ?? 'Unknown'),
                                  );
                                }).toList(),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        SizedBox(
                          width: double.infinity,
                          child: InputDecorator(
                            decoration: const InputDecoration(
                                enabledBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                        color: AppColors.grey7, width: 1.0),
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(12))),
                                contentPadding: EdgeInsets.only(
                                    left: 10, top: 0, bottom: 0, right: 10),
                                filled: true,
                                fillColor: Colors.white),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton(
                                hint: const Text('Select book'),
                                style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.black,
                                    overflow: TextOverflow.ellipsis),
                                value: selectedbook,
                                dropdownColor: Colors.lightBlue.shade50,
                                onChanged: (Books? value) async {
                                  if (value != null) {
                                    setState(() {
                                      selectedbook = value;

                                      selectedlesson = null; // 🔥 Reset lesson
                                      selectedtopic = null;
                                    });

                                    await dashboardController.getLesson(
                                        value.sId!, sub_id);
                                    setState(() {
                                      lessonList =
                                          dashboardController.lessonlist;
                                    });
                                    await _loadQuestions();

                                    if (!classes.contains(selectedClass)) {
                                      setState(() {
                                        selectedClass = null;
                                        selectedbook = null;
                                        selectedlesson = null;
                                        selectedtopic = null;
                                      });
                                    }
                                    if (!booklist.contains(selectedbook)) {
                                      setState(() {
                                        selectedbook = null;
                                        selectedlesson = null;
                                        selectedtopic = null;
                                      });
                                    }
                                    if (!lessonList.contains(selectedlesson)) {
                                      setState(() {
                                        selectedlesson = null;
                                        selectedtopic = null;
                                      });
                                    }
                                    if (!topics.contains(selectedtopic)) {
                                      setState(() {
                                        selectedtopic = null;
                                      });
                                    }
                                  }
                                },
                                items: booklist
                                    .map((cls) => DropdownMenuItem(
                                        value: cls, child: Text(cls.book!)))
                                    .toList(),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                      ],
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: InputDecorator(
                        decoration: const InputDecoration(
                            enabledBorder: OutlineInputBorder(
                                borderSide: BorderSide(
                                    color: AppColors.grey7, width: 1.0),
                                borderRadius:
                                    BorderRadius.all(Radius.circular(12))),
                            contentPadding: EdgeInsets.only(
                                left: 10, top: 0, bottom: 0, right: 10),
                            filled: true,
                            fillColor: Colors.white),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<LData>(
                            hint: const Text('Select lesson'),
                            style: const TextStyle(
                                fontSize: 12,
                                color: Colors.black,
                                overflow: TextOverflow.ellipsis),
                            value: selectedlesson,
                            dropdownColor: Colors.lightBlue.shade50,
                            onChanged: (LData? value) async {
                              if (value != null) {
                                setState(() {
                                  selectedlesson = value;

                                  selectedtopic = null;
                                });

                                setState(() {
                                  topics = value.topics!;
                                });
                                await _loadQuestions();

                                if (!classes.contains(selectedClass)) {
                                  setState(() {
                                    selectedClass = null;
                                    selectedbook = null;
                                    selectedlesson = null;
                                    selectedtopic = null;
                                  });
                                }
                                if (!booklist.contains(selectedbook)) {
                                  setState(() {
                                    selectedbook = null;
                                    selectedlesson = null;
                                    selectedtopic = null;
                                  });
                                }
                                if (!lessonList.contains(selectedlesson)) {
                                  setState(() {
                                    selectedlesson = null;
                                    selectedtopic = null;
                                  });
                                }
                                if (!topics.contains(selectedtopic)) {
                                  setState(() {
                                    selectedtopic = null;
                                  });
                                }
                              }
                            },
                            items: lessonList
                                .map((cls) => DropdownMenuItem(
                                    value: cls, child: Text(cls.lesson!)))
                                .toList(),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: InputDecorator(
                        decoration: const InputDecoration(
                            enabledBorder: OutlineInputBorder(
                                borderSide: BorderSide(
                                    color: AppColors.grey7, width: 1.0),
                                borderRadius:
                                    BorderRadius.all(Radius.circular(12))),
                            contentPadding: EdgeInsets.only(
                                left: 10, top: 0, bottom: 0, right: 10),
                            filled: true,
                            fillColor: Colors.white),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<Topics>(
                            hint: const Text('Select topics'),
                            style: const TextStyle(
                                fontSize: 12,
                                color: Colors.black,
                                overflow: TextOverflow.ellipsis),
                            value: selectedtopic,
                            dropdownColor: Colors.lightBlue.shade50,
                            onChanged: (Topics? value) async {
                              if (value != null) {
                                setState(() {
                                  selectedtopic = value;
                                });
                                await _loadQuestions();

                                if (!classes.contains(selectedClass)) {
                                  setState(() {
                                    selectedClass = null;
                                    selectedbook = null;
                                    selectedlesson = null;
                                    selectedtopic = null;
                                  });
                                }
                                if (!booklist.contains(selectedbook)) {
                                  setState(() {
                                    selectedbook = null;
                                    selectedlesson = null;
                                    selectedtopic = null;
                                  });
                                }
                                if (!lessonList.contains(selectedlesson)) {
                                  setState(() {
                                    selectedlesson = null;
                                    selectedtopic = null;
                                  });
                                }
                                if (!topics.contains(selectedtopic)) {
                                  setState(() {
                                    selectedtopic = null;
                                  });
                                }
                              }
                            },
                            items: topics
                                .map((cls) => DropdownMenuItem(
                                    value: cls, child: Text(cls.topic!)))
                                .toList(),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),
                    GestureDetector(
                      onTap: () {
                        showInstructionPopup(context);
                      },
                      child: const Text(
                        "Select Instruction",
                        style: TextStyle(
                            color: Color(0xff2180C3),
                            fontSize: 14,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Edit Your Questions",
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Questions List
                    Container(
                      height: 230,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(5),
                        border: Border.all(color: AppColors.grey7),
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                                vertical: 10, horizontal: 20),
                            decoration: const BoxDecoration(
                              color: Color(0xff4186B6),
                              borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(5),
                                topRight: Radius.circular(5),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "Multiple Choice Questions (${selectedQuestionIds.length})",
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Container(
                                  decoration: BoxDecoration(
                                    color: Colors.green,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 4, horizontal: 8),
                                  child: Text(
                                    "${mcqQuestions.length}",
                                    style: const TextStyle(
                                        color: Colors.white, fontSize: 14),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: mcqQuestions.isNotEmpty
                                ? ListView.separated(
                                    itemCount: mcqQuestions.length,
                                    separatorBuilder: (context, index) {
                                      return const Divider(
                                        color: Colors.grey,
                                        thickness: 0.5,
                                        height: 10,
                                      );
                                    },
                                    itemBuilder: (context, index) {
                                      return CheckboxListTile(
                                        checkColor: Colors.white,
                                        activeColor: const Color(0xff186BA5),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(4),
                                        ),
                                        title: HtmlLatexViewer(
                                            htmlContent: mcqQuestions[index]
                                                    .description ??
                                                ''),
                                        value: selectedQuestionIds
                                            .contains(mcqQuestions[index].sId),
                                        onChanged: (bool? value) {
                                          setState(() {
                                            final id =
                                                mcqQuestions[index].sId ?? '';
                                            if (value == true) {
                                              selectedQuestionIds.add(id);
                                            } else {
                                              selectedQuestionIds.remove(id);
                                            }
                                          });
                                        },
                                      );
                                    },
                                  )
                                : Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Image.asset(
                                        'assets/no_notification.png',
                                        height: 80,
                                      ),
                                      const SizedBox(height: 10),
                                      const Text(
                                        "No Questions Available",
                                        style: TextStyle(
                                          color: Colors.grey,
                                          fontSize: 16,
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ],
                      ),
                    ),

                    Column(
                      children: [
                        buildTypeSection(
                          title:
                              "True/False Questions (${selectedQuestionTF.length})",
                          count: TFQuestions.length,
                          isExpanded: tfExpanded,
                          onTap: () {
                            setState(() {
                              tfExpanded = !tfExpanded;
                            });
                          },
                        ),
                        if (tfExpanded)
                          ...TFQuestions.asMap().entries.map((entry) {
                            var questiondata = entry.value;
                            return CheckboxListTile(
                              checkColor: Colors.white,
                              activeColor: const Color(0xff186BA5),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(4),
                              ),
                              title: HtmlLatexViewer(
                                  htmlContent: questiondata.description ?? ''),
                              value:
                                  selectedQuestionTF.contains(questiondata.sId),
                              onChanged: (bool? value) {
                                setState(() {
                                  final id = questiondata.sId ?? '';
                                  if (value == true) {
                                    selectedQuestionTF.add(id);
                                  } else {
                                    selectedQuestionTF.remove(id);
                                  }
                                });
                              },
                            );
                          }),
                      ],
                    ),

                    buildTypeSection(
                      title: "AR Questions (${selectedQuestionAR.length})",
                      count: ARQuestions.length,
                      isExpanded: dsExpanded,
                      onTap: () {
                        setState(() {
                          dsExpanded = !dsExpanded;
                        });
                      },
                    ),
                    if (dsExpanded)
                      ...ARQuestions.asMap().entries.map((entry) {
                        var questiondata = entry.value;
                        return CheckboxListTile(
                          checkColor: Colors.white,
                          activeColor: const Color(0xff186BA5),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                          title: HtmlLatexViewer(
                              htmlContent: questiondata.description ?? ''),
                          value: selectedQuestionAR.contains(questiondata.sId),
                          onChanged: (bool? value) {
                            setState(() {
                              final id = questiondata.sId ?? '';
                              if (value == true) {
                                if (!selectedQuestionAR.contains(id)) {
                                  selectedQuestionAR.add(id);
                                }
                              } else {
                                selectedQuestionAR.remove(id);
                              }
                            });
                          },
                        );
                      }),

                    buildTypeSection(
                      title:
                          "Discriptive Questions (${selectedQuestionDS.length})",
                      count: DSQuestions.length,
                      isExpanded: ds1Expanded,
                      onTap: () {
                        setState(() {
                          ds1Expanded = !ds1Expanded;
                        });
                      },
                    ),
                    if (ds1Expanded)
                      ...DSQuestions.asMap().entries.map((entry) {
                        var questiondata = entry.value;
                        return CheckboxListTile(
                          checkColor: Colors.white,
                          activeColor: const Color(0xff186BA5),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                          title: HtmlLatexViewer(
                              htmlContent: questiondata.description ?? ''),
                          value: selectedQuestionDS.contains(questiondata.sId),
                          onChanged: (bool? value) {
                            setState(() {
                              final id = questiondata.sId ?? '';
                              if (value == true) {
                                if (!selectedQuestionDS.contains(id)) {
                                  selectedQuestionDS.add(id);
                                }
                              } else {
                                selectedQuestionDS.remove(id);
                              }
                            });
                          },
                        );
                      }),

                    // Action Buttons
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        SizedBox(
                          width: 150,
                          child: ElevatedButton(
                            onPressed: () async {
                              // Preview button logic
                              List<String> arr = selectedQuestionIds +
                                  selectedQuestionAR +
                                  selectedQuestionTF +
                                  selectedQuestionDS;
                              if (arr.isEmpty) {
                                Get.snackbar(
                                    "Message", "Please select questions.",
                                    snackPosition: SnackPosition.BOTTOM);
                                return;
                              } else if (sessionController.text.isEmpty) {
                                Get.snackbar("Message", "Please enter session.",
                                    snackPosition: SnackPosition.BOTTOM);
                                return;
                              } else if (_durationController.text.isEmpty) {
                                Get.snackbar("Message",
                                    "Please enter time duration of test.",
                                    snackPosition: SnackPosition.BOTTOM);
                                return;
                              } else {
                                String tid = "";
                                String lid = "";
                                if (selectedtopic != null &&
                                    selectedtopic!.sId != null) {
                                  tid = selectedtopic!.sId!;
                                }
                                if (selectedlesson != null &&
                                    selectedlesson!.sId != null) {
                                  lid = selectedlesson!.sId!;
                                }

                                await dashboardController.downloadAndOpenPdf(
                                    sub_id,
                                    widget.bClassId,
                                    tid,
                                    lid,
                                    arr,
                                    sessionController.text.toString().trim(),
                                    _durationController.text.toString().trim(),
                                    selectedbook!.sId!,
                                    ids,
                                    context,
                                    selectedInstructions);
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.theme,
                            ),
                            child: const Text("Preview",
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Obx(() => CustomBottomNavBar(
            currentIndex: dashboardController.currentIndex.value,
            onTap: (index) {
              if (index == 1) {
                BatchHelperTeacher.showCreateBatchBottomSheet(context);
              } else if (index == 2) {
                BatchHelperTeacher.showFollowBatchBottomSheetTeacher(context);
              } else {
                dashboardController.changeIndex(index);
              }
            },
          )),
    );
  }
}
