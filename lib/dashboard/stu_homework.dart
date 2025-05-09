import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:flutter/material.dart';

class HomeworkScreen extends StatefulWidget {
  @override
  _HomeworkScreenState createState() => _HomeworkScreenState();
}

class _HomeworkScreenState extends State<HomeworkScreen> {
  Map<String, List<Map<String, String>>> homeworkData = {
    "Tue, 21 December 2024": [],
    "Tue, 20 December 2024": [
      {
        "question":
            "State which of the following situations are possible and give an example for each of these:\n\n(a) an object with a constant acceleration but with zero velocity\n(b) an object moving with an acceleration but with uniform speed.\n(c) an object moving in a certain direction with an acceleration in the perpendicular direction.",
        "answer": "Sample Answer for Question 9"
      },
      {
        "question":
            "State which of the following situations are possible and give an example for each of these:\n\n(a) an object with a constant acceleration but with zero velocity\n(b) an object moving with an acceleration but with uniform speed.\n(c) an object moving in a certain direction with an acceleration in the perpendicular direction.",
        "answer": "Sample Answer for Question 10"
      },
    ],
    "Mon, 17 December 2024": [],
    "Fri, 16 December 2024": [],
    "Mon, 15 December 2024": [],
    "Tue, 13 December 2024": [],
  };

  Map<String, bool> expandedSections = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        text: "Homework",
      ),
      body: ListView(
        children: homeworkData.keys.map((date) {
          return ExpansionTile(
            tilePadding: EdgeInsets.symmetric(horizontal: 16.0),
            collapsedBackgroundColor:
                Color(0xffC5D5E1), // Background color when collapsed
            backgroundColor: Color(0xff186BA5),
            title: Text(date),
            initiallyExpanded: expandedSections[date] ?? false,
            onExpansionChanged: (value) {
              setState(() {
                expandedSections[date] = value;
              });
            },
            children: homeworkData[date]!.map((questionData) {
              return Container(
                padding: EdgeInsets.all(20),
                color: Color(0xffF6F9FF),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          backgroundColor: Color(0xff186BA5),
                          child: Text(
                            "${homeworkData[date]!.indexOf(questionData) + 9}",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                        SizedBox(
                          height: 10,
                        ),
                        RotatedBox(
                          quarterTurns: 1,
                          child: ElevatedButton(
                            onPressed: () {
                              // Add your Answer logic here
                            },
                            style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                shape: StadiumBorder(),
                                side: BorderSide(color: Color(0xff186BA5))),
                            child: const Text(
                              'Answer',
                              style: TextStyle(color: AppColors.theme),
                            ),
                          ),
                        ),
                      ],
                    ),
                    Expanded(child: Padding(
                      padding: const EdgeInsets.only(left: 10),
                      child: Text(questionData['question'] ?? ""),
                    )),
                  ],
                ),
              );
            }).toList(),
          );
        }).toList(),
      ),
    );
  }
}
