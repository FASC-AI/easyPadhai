import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/model/homework_model1.dart';
import 'package:easy_padhai/model/homework_model3.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';

class AssignHomeworkScreen extends StatefulWidget {
  String lessonId;
  final String tid;
  AssignHomeworkScreen({super.key, required this.tid, required this.lessonId});

  @override
  _AssignHomeworkScreenState createState() => _AssignHomeworkScreenState();
}

class _AssignHomeworkScreenState extends State<AssignHomeworkScreen> {
  List<Homework> questions = [];
  List<HomeworkModel3Data> prevH = [];
  List<String> selectedQuestionIds = [];
  DashboardController dashboardController = Get.find();
  bool isload = false;
  DateTime selectedDate = DateTime.now();
  String selectDate = '';

  @override
  void initState() {
    super.initState();
    getData();
  }

  Future<void> getData() async {
    setState(() {
      isload = true;
    });

    await dashboardController.getHWQbyTopic(widget.lessonId, widget.tid);

    // await dashboardController.getHWQbyTopic(widget.tid);
    questions = dashboardController.queslist;
    await dashboardController.getPHWQbyTopic(widget.tid);
    prevH = dashboardController.prevHlist;
    setState(() {
      isload = false;
    });
  }

  final TextEditingController _dateController = TextEditingController();
  final List<String> previousHomework = [
    "Homework (20/12/2024)",
    "Homework (08/12/2024)",
    "Homework (01/12/2024)",
  ];

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

  void _showPublishDatePopup() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.white,
        title: const Text(
          "Test Ready for Launch",
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        content: GestureDetector(
            onTap: () {
              _selectDate(context);
            },
            child: TextFormField(
              controller: _dateController, // Bind the controller here
              readOnly: true,
              decoration: InputDecoration(
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
            )),
        // child: Container(
        //   padding: EdgeInsets.all(10),
        //   decoration: BoxDecoration(
        //       border: Border.all(
        //         color: Colors.grey,
        //       ),
        //       borderRadius: BorderRadius.circular(8)),
        //   child: Row(
        //       mainAxisAlignment: MainAxisAlignment.spaceBetween,
        //       children: [
        //         Text(
        //           selectDate,
        //           style: const TextStyle(
        //             color: Color(0xFF161621),
        //             fontSize: 14,
        //             fontFamily: 'Inter',
        //             fontWeight: FontWeight.w500,
        //             // height: 0.11,
        //           ),
        //         ),
        //         const Icon(
        //           Icons.calendar_month,
        //           color: Color(0xFF2765CA),
        //         ),
        //       ]),
        // )),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              if (selectDate != null) {
                // Implement publish logic here
                Navigator.pop(context);
                Get.snackbar("Success", "Publish date set to $selectDate");
              }
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        text: "Assign Homework",
      ),
      body: SafeArea(
        child: !isload
            ? SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "Choose Your Questions",
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          OutlinedButton.icon(
                            onPressed: _showPublishDatePopup,
                            icon: SvgPicture.asset('assets/publish.svg'),
                            label: const Text(
                              "Publish Date",
                              style: TextStyle(
                                  color: Color(0xff2180C3),
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
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              child: questions.isNotEmpty
                                  ? ListView.separated(
                                      itemCount: questions.length,
                                      shrinkWrap: true,
                                      // physics:
                                      //     const NeverScrollableScrollPhysics(),
                                      separatorBuilder: (context, index) {
                                        return const Divider(
                                          color: Colors.grey,
                                          thickness: 0.5,
                                          height: 15,
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
                                          title: Html(
                                              data: questions[index].question ??
                                                  ''),
                                          value: questions[index].isPublished,
                                          onChanged: (bool? value) {
                                            setState(() {
                                              questions[index].isPublished =
                                                  value ?? false;
                                              if (value == true) {
                                                selectedQuestionIds.add(
                                                    questions[index].id ?? '');
                                              } else {
                                                selectedQuestionIds.remove(
                                                    questions[index].id ?? '');
                                              }
                                            });
                                          },
                                        );
                                      },
                                    )
                                  : Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
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
                            onPressed: () {
                              // print("Selected Questions: $selectedQuestionIds");
                              // Handle submit logic here
                              if (selectedQuestionIds.isEmpty) {
                                Get.snackbar(
                                    "Message", "Please select questions.",
                                    snackPosition: SnackPosition.BOTTOM);
                                return;
                              } else if (selectDate.isEmpty) {
                                Get.snackbar(
                                    "Message", "Please select publish date.",
                                    snackPosition: SnackPosition.BOTTOM);
                                return;
                              } else {
                                DateTime parsedDate =
                                    DateFormat('dd-MM-yyyy').parse(selectDate);

                                // Step 2: Convert to UTC and format to ISO 8601
                                String isoDate =
                                    formatToISOWithOffset(parsedDate);

                                var res = dashboardController.updateHomework(
                                    selectedQuestionIds, isoDate);

                                if (res != null && res != false) {
                                  setState(() {
                                    // selectDate = "";
                                    // selectedQuestionIds = [];
                                    Navigator.pop(context);
                                    Navigator.pop(context);
                                  });
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
                      const SizedBox(height: 20),

                      // Previous Homework List
                      const Text(
                        "Previous homework list",
                        style: TextStyle(
                            fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      Column(
                        children: prevH.map((homework) {
                          String formatdate =
                              formatDate(homework.publishedDate!);
                          return GestureDetector(
                            onTap: () {
                              _showBottomSheet(context, prevH);
                            },
                            child: Container(
                              width: double.infinity,
                              height: 40,
                              margin: const EdgeInsets.only(bottom: 8),
                              decoration: BoxDecoration(
                                color: Color(0xff4186B6),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              padding: const EdgeInsets.all(12),
                              child: Text(
                                formatdate,
                                style: const TextStyle(color: Colors.white),
                              ),
                            ),
                          );
                        }).toList(),
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
                ),
              ),
      ),
    );
  }

  void _showBottomSheet(BuildContext context, List<HomeworkModel3Data> prevH) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true, // Added for better scrolling behavior
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height *
                0.3, // Better height calculation
          ),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Questions",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 10),
              Expanded(
                // Added Expanded for proper ListView sizing
                child: ListView.builder(
                  shrinkWrap: true,
                  physics:
                      const ClampingScrollPhysics(), // Better scrolling physics
                  itemCount: prevH.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Html(
                        data: "${index + 1}. ${prevH[index].question}",
                        style: {
                          "body": Style(
                            fontSize: FontSize(14.0),
                            margin: Margins.zero, // Remove default margins
                            // Remove default padding
                          ),
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String formatDate(String isoDate) {
    DateTime parsedDate = DateTime.parse(isoDate);
    String formattedDate = DateFormat('dd/MM/yyyy').format(parsedDate);
    return formattedDate;
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
