import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class TeacherClassScreen extends StatefulWidget {
  String title;
  TeacherClassScreen({super.key, required this.title});

  @override
  State<TeacherClassScreen> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<TeacherClassScreen> {
  int selectedTabIndex = 0;
  DashboardController dashboardController = Get.find();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: CustomAppBar(
          text: widget.title,
        ),
        body: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                  height: 100,
                  decoration: const BoxDecoration(color: AppColors.theme),
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(20, 30, 20, 20),
                    decoration: BoxDecoration(
                      color: AppColors.theme,
                      border:
                          Border.all(color: Colors.white), // Theme background
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
                        ? AssignmentsTab()
                        : selectedTabIndex == 1
                            ? TestsTab()
                            : selectedTabIndex == 2
                                ? StudentSelectionScreen()
                                : null),
              ),
            ],
          ),
        ));
  }

  Widget buildTab(String title, int index) {
    final bool isSelected = selectedTabIndex == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => selectedTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
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
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

class AssignmentsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.all(16),
      children: [
        Text("Tue, 21 Dec", style: TextStyle(fontWeight: FontWeight.bold)),
        SizedBox(height: 8),
        Text(
          "9. State which of the following situations are possible and give an example for each...",
        ),
        SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Column(
                children: [
                  Image.asset("assets/subject.png", height: 100),
                  Text("Physics I"),
                ],
              ),
            ),
            SizedBox(width: 10),
            Expanded(
              child: Container(
                height: 100,
                decoration: BoxDecoration(
                  border: Border.all(color: Color(0xFF186BA5)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.add, size: 30, color: Color(0xFF186BA5)),
                      Text("Add Note",
                          style: TextStyle(color: Color(0xFF186BA5))),
                      Text("(Pdf Only)",
                          style: TextStyle(color: Colors.red, fontSize: 12)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class TestsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.all(16),
      children: [
        Text("Tue, 21 Dec", style: TextStyle(fontWeight: FontWeight.bold)),
        ...List.generate(
            6,
            (i) => studentScoreRow(
                "Student ${i + 1}", i == 4 ? "Ab" : "${12 + i}/20")),
        SizedBox(height: 16),
        Text("Mon, 20 Dec", style: TextStyle(fontWeight: FontWeight.bold)),
        ...List.generate(
            6,
            (i) => studentScoreRow(
                "Student ${i + 1}", i == 4 ? "Ab" : "${12 + i}/20")),
      ],
    );
  }

  Widget studentScoreRow(String name, String score) {
    final isAbsent = score == "Ab";
    return ListTile(
      contentPadding: EdgeInsets.only(top: 0, bottom: 0),
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
}

class Student {
  final String name;
  bool isSelected;

  Student({required this.name, this.isSelected = false});
}

class StudentSelectionScreen extends StatefulWidget {
  @override
  _StudentSelectionScreenState createState() => _StudentSelectionScreenState();
}

class _StudentSelectionScreenState extends State<StudentSelectionScreen> {
  List<Student> students = [
    Student(name: 'Abhishek Kumar Jha'),
    Student(name: 'Archana Sharma'),
    Student(name: 'Bharti Kapoor'),
    Student(name: 'Chandni Yadav'),
    Student(name: 'Kunal Bhardwaj'),
    Student(name: 'Sushil Yadav'),
  ];

  bool get isAllSelected => students.every((s) => s.isSelected);

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
      // backgroundColor: Color(0xffF6F8FC),
      body: Column(
        children: [
          // Tabs (if you want)
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
                  checkColor: Colors.white, // white tick
                  activeColor: Color(0xff186BA5), // blue background
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(4), // Optional: rounded square
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: ListView.builder(
              itemCount: students.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(students[index].name),
                  leading: Text("${index + 1}."),
                  trailing: Checkbox(
                    value: students[index].isSelected,
                    onChanged: (val) => toggleStudent(index, val),
                    checkColor: Colors.white, // white tick
                    activeColor: Color(0xff186BA5), // blue background
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(4), // Optional: rounded square
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Box
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              maxLines: 4,
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
                disabledBorder: OutlineInputBorder(
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
                Expanded(
                  child: ElevatedButton(
                    style:
                        ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    onPressed: () {},
                    child: Text("Remove Student"),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xff186BA5)),
                    onPressed: () {},
                    child: Text("Send Message"),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
