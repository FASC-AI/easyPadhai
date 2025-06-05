import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
// replace with actual model import

class TestQuestionListScreen extends StatelessWidget {
  final List<Tests> testList;

  const TestQuestionListScreen({Key? key, required this.testList})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    //print(testList.length);
    return Scaffold(
      appBar: const CustomAppBar(
        text: 'Test Questions',
      ),
      body: ListView.builder(
        itemCount: testList.length,
        itemBuilder: (context, index) {
          final test = testList[index];
          return Card(
            margin: const EdgeInsets.all(8.0),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Question ${index + 1}: ",
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold)),
                  Html(
                    data: "${test.description ?? 'No description'}",
                    style: {
                      "body": Style(
                        fontSize: FontSize(16.0),
                        margin: Margins.zero, // Remove default margins
                        //  padding: Margins.zero, // Remove default padding
                      ),
                    },
                  ),
                  const SizedBox(height: 8),
                  // if (test.optionText1 != null) Text("A: ${test.optionText1}"),
                  // if (test.optionText2 != null) Text("B: ${test.optionText2}"),
                  // if (test.optionText3 != null) Text("C: ${test.optionText3}"),
                  // if (test.optionText4 != null) Text("D: ${test.optionText4}"),
                  // const SizedBox(height: 8),
                  // Text("Type: ${test.questionType ?? 'N/A'}"),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
