import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_input.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/custom_widgets/text.dart';
import 'package:easy_padhai/dashboard/HtmlLatexViewer.dart';
import 'package:easy_padhai/dashboard/instruction_popup.dart';
import 'package:easy_padhai/dashboard/teacher_bottomsheet.dart';
import 'package:easy_padhai/model/book_model.dart';
import 'package:easy_padhai/model/homework_model1.dart';
import 'package:easy_padhai/model/instruc_model.dart';
import 'package:easy_padhai/model/lesson_model.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:easy_padhai/model/question_model.dart';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

class CreateTestScreen extends StatefulWidget {
  String bClassId = "";
  CreateTestScreen({required this.bClassId});
  @override
  _CreateTestScreenState createState() => _CreateTestScreenState();
}

class _CreateTestScreenState extends State<CreateTestScreen> {
  List<LData> lessonList = [];
  List<ClassDetail> classes = [];
  List<Books> booklist = [];
  List<Topics> topics = [];
  ClassDetail? selectedClass;
  Books? selectedbook;
  LData? selectedlesson;
  Topics? selectedtopic;
  int selectedCount = 3;
  DateTime selectedDate = DateTime.now();
  String selectDate = '';
  String sub_id = "";
  String classid = "";
  final TextEditingController _dateController = TextEditingController();
  List<OnlineQuesmodelData> questions = [];
  List<String> selectedQuestionIds = [];
  DashboardController dashboardController = Get.find();
  List<String> selectedInstructions = [];
  List<English> engIns = [];
  List<Hindi> hindiIns = [];

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
        context: context,
        initialDate: selectedDate,
        firstDate: DateTime.now(),
        lastDate: DateTime(2101));
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

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getdata();
  }

  Future<void> getdata() async {
    classes = dashboardController.profileModel?.data?.classDetail! ?? [];
    classid = widget.bClassId;
    sub_id =
        dashboardController.profileModel?.data?.subjectDetail?[0].sId! ?? "";
    classes.retainWhere((classDetail) => classDetail.sId == classid);
    await dashboardController.getInstruction(classid, sub_id, "Online Test");
    setState(() {
      engIns = dashboardController.instruction!.english!;
      hindiIns = dashboardController.instruction!.hindi!;
    });
  }

  void _showPublishDatePopup() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.white,
        title: const Text(
          "Test Ready for Launch",
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            GestureDetector(
              onTap: () {
                _selectDate(context);
              },
              child: TextFormField(
                controller: _dateController, // Bind the controller here
                readOnly: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: Colors.grey, width: 1.0),
                  ),
                  hintText: "Pick a Date",
                  suffixIcon: IconButton(
                    icon: const Icon(
                      Icons.calendar_month,
                      color: Color(0xFF2765CA),
                    ),
                    onPressed: () {
                      _selectDate(context);
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            GestureDetector(
              onTap: () {
                _selectTime(context);
              },
              child: TextFormField(
                controller: _timeController, // Controller for time
                readOnly: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: Colors.grey, width: 1.0),
                  ),
                  hintText: "Pick a Time",
                  suffixIcon: IconButton(
                    icon: const Icon(
                      Icons.access_time,
                      color: Color(0xFF2765CA),
                    ),
                    onPressed: () {
                      _selectTime(context);
                    },
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
              if (selectDate != null && selectTime != null) {
                // Implement publish logic here
                Navigator.pop(context);
                Get.snackbar("Success",
                    "Publish date set to ${_dateController.text} at ${_timeController.text}");
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

  TimeOfDay? selectTime;

  final TextEditingController _timeController = TextEditingController();

  // Future<void> _selectTime(BuildContext context) async {
  //   final TimeOfDay? picked = await showTimePicker(
  //     context: context,
  //     initialTime: TimeOfDay.now(),
  //   );
  //   if (picked != null && picked != selectTime) {
  //     setState(() {
  //       selectTime = picked;
  //       _timeController.text = picked.format(context);
  //     });
  //   }
  // }

  Future<void> _selectTime1(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (picked != null && picked != selectTime) {
      setState(() {
        selectTime = picked;
        _timeController.text = _formatTime12Hour(picked);
      });
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: selectTime ?? TimeOfDay.now(),
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context)
              .copyWith(alwaysUse24HourFormat: false), // Force 12-hour clock
          child: child!,
        );
      },
    );
    if (picked != null && picked != selectTime) {
      setState(() {
        selectTime = picked;
        _timeController.text = _formatTime12Hour(picked);
      });
    }
  }

  String _formatTime12Hour(TimeOfDay time) {
    final now = DateTime.now();
    final dt = DateTime(now.year, now.month, now.day, time.hour, time.minute);
    final format = DateFormat.jm(); // 12-hour format with AM/PM
    return format.format(dt);
  }

  final TextEditingController _durationController = TextEditingController();
  Duration _duration = const Duration(hours: 0, minutes: 0);

  void _selectDuration() async {
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
                          "Create Test",
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
                    SizedBox(
                      width: double.infinity,
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          enabledBorder: OutlineInputBorder(
                            borderSide:
                                BorderSide(color: AppColors.grey7, width: 1.0),
                            borderRadius: BorderRadius.all(Radius.circular(12)),
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

                                // Fetching books based on selected class
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
                                child: Text(cls.class1 ??
                                    'Unknown'), // Display class name
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

                                // Fetching books based on selected class
                                await dashboardController.getLesson(
                                    value.sId!, sub_id);
                                setState(() {
                                  lessonList = dashboardController.lessonlist;
                                });

                                await dashboardController.getOnlineQ1(
                                    selectedClass!.sId!,
                                    sub_id,
                                    selectedbook!.sId!,
                                    "",
                                    "");
                                // Fetching books based on selected class
                                setState(() {
                                  questions = dashboardController.quesList;
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
                            items: booklist
                                .map((cls) => DropdownMenuItem(
                                    value: cls, child: Text(cls.book!)))
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

                                // Fetching books based on selected class

                                setState(() {
                                  topics = value.topics!;
                                });
                                await dashboardController.getOnlineQ1(
                                    selectedClass!.sId!,
                                    sub_id,
                                    selectedbook!.sId!,
                                    selectedlesson!.sId!,
                                    "");
                                // Fetching books based on selected class
                                setState(() {
                                  questions = dashboardController.quesList;
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
                                await dashboardController.getOnlineQ1(
                                    selectedClass!.sId!,
                                    sub_id,
                                    selectedbook!.sId!,
                                    selectedlesson!.sId!,
                                    selectedtopic!.sId!);
                                // Fetching books based on selected class
                                setState(() {
                                  questions = dashboardController.quesList;
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
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Choose Your Questions",
                          style: TextStyle(
                              fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        OutlinedButton.icon(
                          onPressed: _showPublishDatePopup,
                          icon: SvgPicture.asset('assets/publish.svg'),
                          label: const Text(
                            "Publish Date",
                            style: TextStyle(
                                color: Color(0xff2180C3),
                                fontSize: 12,
                                fontWeight: FontWeight.bold),
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
                            child: Text(
                              "Questions (${selectedQuestionIds.length})",
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Expanded(
                            child: questions.isNotEmpty
                                ? ListView.separated(
                                    itemCount: questions.length,
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
                                            htmlContent:
                                                questions[index].description ??
                                                    ''),
                                        value: questions[index].isPublished,
                                        onChanged: (bool? value) {
                                          setState(() {
                                            questions[index].isPublished =
                                                value ?? false;
                                            if (value == true) {
                                              selectedQuestionIds.add(
                                                  questions[index].sId ?? '');
                                            } else {
                                              selectedQuestionIds.remove(
                                                  questions[index].sId ?? '');
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
                                        'assets/no_notification.png', // Change with your icon/image path
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

                    const SizedBox(height: 10),

                    // Submit Button
                    Center(
                      child: SizedBox(
                        width: 200,
                        child: ElevatedButton(
                          onPressed: () async {
                            // print("Selected Questions: $selectedQuestionIds");
                            // Handle submit logic here
                            if (selectedQuestionIds.isEmpty) {
                              Get.snackbar(
                                  "Message", "Please select questions.",
                                  snackPosition: SnackPosition.BOTTOM);
                              return;
                            }
                            // else if (selectedInstructions.isEmpty) {
                            //   Get.snackbar(
                            //       "Message", "Please select instruction.",
                            //       snackPosition: SnackPosition.BOTTOM);
                            //   return;
                            // }
                            else if (selectDate.isEmpty) {
                              Get.snackbar(
                                  "Message", "Please select publish date.",
                                  snackPosition: SnackPosition.BOTTOM);
                              return;
                            } else if (_timeController.text.isEmpty) {
                              Get.snackbar(
                                  "Message", "Please select publish time.",
                                  snackPosition: SnackPosition.BOTTOM);
                              return;
                            } else if (_durationController.text.isEmpty) {
                              Get.snackbar("Message",
                                  "Please enter time duration of test.",
                                  snackPosition: SnackPosition.BOTTOM);
                              return;
                            } else {
                              DateTime parsedDate =
                                  DateFormat('dd-MM-yyyy').parse(selectDate);

                              // Step 2: Convert to UTC and format to ISO 8601
                              String isoDate =
                                  formatToISOWithOffset(parsedDate);

                              var res =
                                  await dashboardController.updateQuestion(
                                      selectedQuestionIds,
                                      isoDate,
                                      _timeController.text,
                                      _durationController.text,
                                      selectedInstructions);

                              if (res != null && res != false) {
                                await dashboardController.getAllPubTest(
                                    widget.bClassId, sub_id);
                                Navigator.pop(context);
                              }
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.theme,
                          ),
                          child: const Text("Submit",
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold)),
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

  String formatToISOWithOffset(DateTime parsedDate) {
    // Add 5 hours and 30 minutes to the parsed date
    DateTime adjustedDate =
        parsedDate.add(const Duration(hours: 5, minutes: 30));

    // Convert to UTC and format as ISO 8601 string
    String isoDate = adjustedDate.toUtc().toIso8601String();
    return isoDate;
  }
}
