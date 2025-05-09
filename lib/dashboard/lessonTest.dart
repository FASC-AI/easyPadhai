import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:flutter/material.dart';

class LessonTestScreen extends StatefulWidget {
  @override
  _LessonTestScreenState createState() => _LessonTestScreenState();
}

class _LessonTestScreenState extends State<LessonTestScreen> {
  // Sample Questions Data
  final List<Map<String, dynamic>> questions = [
    {
      'question': 'What is the acceleration due to gravity on Earth?',
      'options': ['9.8 m/s²', '9.8 m/s²', '9.8 m/s²', '9.8 m/s²'],
      'selected': <int>{}
    },
    {
      'question': 'What is the acceleration due to gravity on Earth?',
      'options': ['9.8 m/s²', '9.8 m/s²', '9.8 m/s²', '9.8 m/s²'],
      'selected': <int>{}
    },
    {
      'question': 'What is the acceleration due to gravity on Earth?',
      'options': ['9.8 m/s²', '9.8 m/s²', '9.8 m/s²', '9.8 m/s²'],
      'selected': <int>{}
    },
    {
      'question': 'What is the acceleration due to gravity on Earth?',
      'options': ['9.8 m/s²', '9.8 m/s²', '9.8 m/s²', '9.8 m/s²'],
      'selected': <int>{}
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF6F9FF),
      appBar: CustomAppBar(
        text: 'Solve Now to Move Ahead',
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildHeader(),
            //  const SizedBox(height: 12),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                    shape: BoxShape.rectangle,
                    border: Border.all(color: Colors.grey)),
                child: ListView.separated(
                  itemCount: questions.length,
                  separatorBuilder: (context, index) {
                    return const Divider(
                      color: Colors.grey,
                      thickness: 0.5,
                      height: 24,
                    );
                  },
                  itemBuilder: (context, index) {
                    return _buildQuestionCard(index);
                  },
                ),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Save and Continue Action
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xff186BA5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                padding:
                    const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
              ),
              child: const Text(
                'Save & Continue',
                style: TextStyle(color: Colors.white, fontSize: 16),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  // Header Widget
  Widget _buildHeader() {
    return Container(
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: Color(0xff186BA5),
        borderRadius: BorderRadius.only(
            topLeft: Radius.circular(10), topRight: Radius.circular(10)),
      ),
      child: const Text(
        'Multiple Choice Questions',
        style: TextStyle(
            color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
      ),
    );
  }

  // Question Card
  Widget _buildQuestionCard(int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            Row(
              children: [
                Image.asset(
                  'assets/question.png',
                  height: 24,
                  width: 24,
                  color: const Color(0xffD56363),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    questions[index]['question'],
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildGridOptions(index),
          ],
        ),
      ),
    );
  }

  // Options Builder
  Widget _buildGridOptions(int questionIndex) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 3,
      ),
      itemCount: questions[questionIndex]['options'].length,
      itemBuilder: (context, index) {
        bool isSelected = questions[questionIndex]['selected'] == index;
        return CheckboxListTile(
            activeColor: const Color(0xff186BA5),
            title: Text(questions[questionIndex]['options'][index]),
            value: questions[questionIndex]['selected'].contains(index),
            onChanged: (bool? value) {
              setState(() {
                if (value == true) {
                  questions[questionIndex]['selected'].add(index);
                } else {
                  questions[questionIndex]['selected'].remove(index);
                }
              });
            });
      },
    );
  }
}
