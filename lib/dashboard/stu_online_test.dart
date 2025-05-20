import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/dashboard/test_in_prog.dart';
import 'package:easy_padhai/model/current_test_model.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class StuOnlineTest extends StatefulWidget {
  const StuOnlineTest({super.key});

  @override
  State<StuOnlineTest> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<StuOnlineTest> {
  DashboardController dashboardController = DashboardController();
  List<OnlineTestModel1Data> testList = [];
  List<bool> selectedItems = [];
  bool isload = false;

  @override
  void initState() {
    // TODO: implement initState

    getData();
  }

  Future<void> getData() async {
    setState(() {
      isload = true;
    });
    await dashboardController.getAllPubTest();
    testList = dashboardController.testList;
    setState(() {
      isload = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: const CustomAppBar(
        text: 'Test',
      ),
      body: !isload
          ? SafeArea(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(left: 10),
                      width: MediaQuery.of(context).size.width,
                      height: 50,
                      child: ListView.builder(
                        itemCount: testList.length,
                        shrinkWrap: true,
                        scrollDirection: Axis.horizontal,
                        itemBuilder: (context, index) {
                          // Access the selected state for the current item
                          bool selected = true;

                          return GestureDetector(
                            onTap: () {
                              // setState(() {
                              //   // Update the selected state of the tapped item
                              //   for (int i = 0; i < selectedItems.length; i++) {
                              //     selectedItems[i] =
                              //         false; // Unselect all items
                              //   }
                              //   selectedItems[index] =
                              //       true; // Select the current item
                              // });
                            },
                            child: Padding(
                              padding: const EdgeInsets.only(
                                  right: 10, left: 0, top: 8),
                              child: Container(
                                width: 150,
                                decoration: ShapeDecoration(
                                  color: selected
                                      ? AppColors.theme
                                      // ignore: dead_code
                                      : Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                ),
                                child: Stack(
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.only(
                                          right: 14.0, left: 14),
                                      child: Center(
                                        child: Text(
                                          testList[index].publishedDate!,
                                          style: TextStyle(
                                            color: selected
                                                ? Colors.white
                                                : const Color(0xFF002850),
                                            fontSize: 14,
                                            fontWeight: FontWeight.w400,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    const Text(
                      "Instructions for the Online Test",
                      style: TextStyle(
                          color: AppColors.black,
                          fontSize: 20,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                      height: 20,
                    ),
                    Text(
                      "1. Ensure a stable internet connection before starting the test.",
                      style: TextStyle(
                          color: AppColors.black.withOpacity(0.5),
                          fontSize: 15,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                    Text(
                      "2. The test will be automatically submitted when the timer runs out.",
                      style: TextStyle(
                          color: AppColors.black.withOpacity(0.5),
                          fontSize: 15,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                    Text(
                      "3. Switching tabs or refreshing the page may result in disqualification.",
                      style: TextStyle(
                          color: AppColors.black.withOpacity(0.5),
                          fontSize: 15,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                    Text(
                      "4. Do not use external resources, calculators, or any other aids unless explicitly allowed.",
                      style: TextStyle(
                          color: AppColors.black.withOpacity(0.5),
                          fontSize: 15,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                    Text(
                      "5. Do not use external resources, calculators, or any other aids unless explicitly allowed.",
                      style: TextStyle(
                          color: AppColors.black.withOpacity(0.5),
                          fontSize: 15,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                    Text(
                      "6. Read each question carefully before answering.",
                      style: TextStyle(
                          color: AppColors.black.withOpacity(0.5),
                          fontSize: 15,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                      height: 30,
                    ),
                    GestureDetector(
                      onTap: () async {
                        List<CurrentTestModelData> res =
                            await dashboardController.getCurrTest();
                        if (res.isNotEmpty) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => TestInProgressScreen()),
                          );
                        }
                      },
                      child: Container(
                        width: double.infinity,
                        height: 50,
                        decoration: ShapeDecoration(
                          color: AppColors.theme,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: const Center(
                          child: Text(
                            "Test Start",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                    )
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
    );
  }
}
