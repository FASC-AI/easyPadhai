import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class LessonScreen extends StatefulWidget {
  const LessonScreen({super.key});

  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> {
  int expandedIndex = -1;
  List<List<bool>> subtopicStatus = [
    [true, true, false],
    [true, false, false],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ];

  final List<String> lessons = [
    'Lesson 1: The Portrait of a Lady by Kh...',
    'Lesson 2: The Browning Version by Ter...',
    'Lesson 3: The Doll\'s House by Henrik Ibsen',
    'Lesson 4: The Adventure by Jayant Na...',
    'Lesson 5: The Merchant of Venice by...',
    'Lesson 6: The Doll\'s House by Henrik Ibsen',
    'Lesson 7: The Voice of the Rain by Wal...',
    'Lesson 8: A Tiger in the Zoo by Leslie...',
    'Lesson 9: The Portrait of a Lady by Kh...',
  ];

  final List<List<String>> subtopics = [
    [
      "Act 1: Introduction to Nora’s Life and Family",
      "Act 2: Conflict Between Nora and Torvald",
      "Act 3: Nora’s Realization and Decision",
    ],
    [
      "Scene 1: First Impressions",
      "Scene 2: The Conversation",
      "Scene 3: The Ending",
    ],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        text: 'Fundamental of Physics',
      ),
      body: ListView.builder(
        itemCount: lessons.length,
        padding: const EdgeInsets.all(12),
        itemBuilder: (context, index) {
          final isExpanded = expandedIndex == index;
          final isCompleted = subtopicStatus[index].isNotEmpty &&
              subtopicStatus[index].every((e) => e);

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: () {
                  setState(() {
                    expandedIndex = isExpanded ? -1 : index;
                  });
                },
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 6),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                  decoration: BoxDecoration(
                    color: isCompleted ? Colors.green : Color(0x0D186BA5),
                    border: Border.all(
                        color: isCompleted ? Colors.green : AppColors.lesson),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          lessons[index],
                          style: TextStyle(
                            color:
                                isCompleted ? Colors.white : AppColors.lesson,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      Icon(
                        isExpanded ? Icons.expand_less : Icons.expand_more,
                        color: isCompleted ? Colors.white : AppColors.lesson,
                      )
                    ],
                  ),
                ),
              ),
              if (isExpanded && subtopics[index].isNotEmpty)
                Container(
                  padding: const EdgeInsets.only(left: 16),
                  child: Column(
                    children: List.generate(
                      subtopics[index].length,
                      (subIndex) {
                        return ListTile(
                          // value: subtopicStatus[index][subIndex],
                          // onChanged: (value) {
                          //   setState(() {
                          //     subtopicStatus[index][subIndex] = value ?? false;
                          //   });
                          // },
                          leading: isCompleted
                              ? SvgPicture.asset('assets/chk1.svg')
                              : SvgPicture.asset('assets/chk2.svg'),
                          title: Text(subtopics[index][subIndex]),
                          // controlAffinity: ListTileControlAffinity.leading,
                        );
                      },
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
