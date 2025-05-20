import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/model/home_noti_model.dart';
import 'package:easy_padhai/model/homework_model2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

class HomeworkScreen extends StatefulWidget {
  @override
  _HomeworkScreenState createState() => _HomeworkScreenState();
}

class _HomeworkScreenState extends State<HomeworkScreen> {
  List<HomeworkModel2Data> homeworkData = [];
  DashboardController dashboardController = Get.find();
  bool isExpanded = false;
  @override
  void initState() {
    super.initState();
    getData();
  }

  void getData() {
    homeworkData = dashboardController.homeworkList;
  }

  String formatDate(String isoDate) {
    DateTime parsedDate = DateTime.parse(isoDate);
    String formattedDate = DateFormat('EEE, dd MMMM yyyy').format(parsedDate);
    return formattedDate;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        text: "Homework",
      ),
      body: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(10)),
        child: ListView(
          children: homeworkData.map((data) {
            String date = formatDate(data.publishedDate!);

            return ExpansionTile(
              tilePadding: const EdgeInsets.symmetric(horizontal: 16.0),
              collapsedBackgroundColor: const Color(0xffC5D5E1),
              collapsedIconColor: !isExpanded ? Colors.black : Colors.white,
              backgroundColor: const Color(0xff186BA5),
              title: Text(
                date,
                style:
                    TextStyle(color: !isExpanded ? Colors.black : Colors.white),
              ),
              initiallyExpanded: false,
              onExpansionChanged: (bool expanded) {
                setState(() {
                  isExpanded = expanded;
                });
              },
              children: data.homework!.asMap().entries.map((entry) {
                int index = entry.key + 1; // S.No starts from 1
                var questiondata = entry.value;

                return Container(
                  padding: const EdgeInsets.all(20),
                  color: const Color(0xffF6F9FF),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          CircleAvatar(
                            backgroundColor: const Color(0xff186BA5),
                            child: Text(
                              "$index",
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                          const SizedBox(
                            height: 10,
                          ),
                          RotatedBox(
                            quarterTurns: 1,
                            child: ElevatedButton(
                              onPressed: () {
                                // Add your Answer logic here
                                _showBottomSheet(
                                    context, questiondata.hint ?? "");
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                shape: const StadiumBorder(),
                                side:
                                    const BorderSide(color: Color(0xff186BA5)),
                              ),
                              child: const Text(
                                'Answer',
                                style: TextStyle(color: Color(0xff186BA5)),
                              ),
                            ),
                          ),
                        ],
                      ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10),
                          child: Text(questiondata.question!),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            );
          }).toList(),
        ),
      ),
    );
  }

  // 👉 Function to show the BottomSheet
  void _showBottomSheet(BuildContext context, String hint) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Answer",
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black),
              ),
              const SizedBox(height: 10),
              Html(
                data: hint.isNotEmpty ? hint : "No hint available.",
                //  style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 20),
              Center(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // Close BottomSheet
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      side: BorderSide(color: AppColors.theme),
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: const Text("Solutions"),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
