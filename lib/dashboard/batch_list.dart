import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/dashboard/teacher_bottomsheet.dart';
import 'package:easy_padhai/model/batchlist_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

class BatchListScreen extends StatefulWidget {
  const BatchListScreen({super.key});
  @override
  State<BatchListScreen> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<BatchListScreen> {
  List<BbData> batches = [];
  DashboardController dashboardController = Get.find();
  bool isload = false;
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getData();
  }

  Future<void> getData() async {
    setState(() {
      isload = true;
    });
    await dashboardController.getBatch();
    batches = dashboardController.batchlist;
    setState(() {
      isload = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        text: 'Batch List',
      ),
      body: !isload
          ? ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: batches.length,
              itemBuilder: (context, index) {
                final batch = batches[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    // color:
                    //     batch['highlight'] ? const Color(0xFF037DD6) : Colors.white,
                    gradient: batch.classTeacher!
                        ? const LinearGradient(
                            colors: [AppColors.grad1, AppColors.grad2],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : const LinearGradient(
                            colors: [Colors.white, Colors.white],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                    borderRadius: BorderRadius.circular(12),
                    border: batch.classTeacher!
                        ? null
                        : Border.all(color: Colors.black12),
                  ),
                  child: Stack(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: batch.classTeacher!
                                      ? AppColors.white
                                      : Colors.black12, // Border color
                                  width: 1, // Border width
                                ),
                              ),
                              child: CircleAvatar(
                                backgroundColor: batch.classTeacher!
                                    ? AppColors.grad1
                                    : AppColors.white,
                                child: Text(
                                  '${index + 1}',
                                  style: TextStyle(
                                      color: batch.classTeacher!
                                          ? Colors.white
                                          : Colors.black),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    batch.createdAt!,
                                    style: TextStyle(
                                      color: batch.classTeacher!
                                          ? Colors.white70
                                          : Colors.black54,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    batch.code!,
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: batch.classTeacher!
                                          ? Colors.cyanAccent
                                          : Colors.blue,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    batch.institute!,
                                    style: TextStyle(
                                      color: batch.classTeacher!
                                          ? Colors.white70
                                          : Colors.black54,
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Text(
                                        batch.class1!,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18,
                                          color: batch.classTeacher!
                                              ? Colors.white
                                              : Colors.black,
                                        ),
                                      ),
                                      Text(
                                        " ",
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18,
                                          color: batch.classTeacher!
                                              ? Colors.white
                                              : Colors.black,
                                        ),
                                      ),
                                      Text(
                                        batch.section!,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18,
                                          color: batch.classTeacher!
                                              ? Colors.white
                                              : Colors.black,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Positioned(
                        right: 0,
                        top: 0,
                        bottom: 0,
                        child: Container(
                          width: 60,
                          decoration: BoxDecoration(
                            color: batch.classTeacher!
                                ? const Color(0xFF07FFB9)
                                : const Color(0xFF00DFFF),
                            borderRadius: const BorderRadius.only(
                              topRight: Radius.circular(12),
                              bottomRight: Radius.circular(12),
                            ),
                            border: Border.all(
                              color: batch.classTeacher!
                                  ? const Color(0xFF07FFB9)
                                  : const Color(0xFF00DFFF),
                            ),
                          ),
                          alignment: Alignment.center,
                          child: RotatedBox(
                            quarterTurns: 1,
                            child: Text(
                              batch.classTeacher!
                                  ? "Class Teacher"
                                  : "Joined Teacher",
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ),
                        ),
                      )
                    ],
                  ),
                );
              },
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
}
