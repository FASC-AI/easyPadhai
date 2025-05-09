import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/model/batchreq.dart';
import 'package:easy_padhai/model/simple_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class RequestsScreen extends StatefulWidget {
  const RequestsScreen({Key? key}) : super(key: key);

  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen> {
  int selectedTabIndex = 0;
  DashboardController dashboardController = Get.find();

  Widget buildTab(String title, int index) {
    final bool isSelected = selectedTabIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => selectedTabIndex = index),
        child: Container(
         // padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? Colors.blue : Colors.transparent,
            borderRadius: BorderRadius.circular(24),
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.blue,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Future<void> sendReq(bool apr, String id) async {
    SimpleModel dta = await dashboardController.Approvebatchreq(apr, id);
    if (dta != null && dta.status == true) {
      Get.snackbar("Message", dta.message!,
          snackPosition: SnackPosition.BOTTOM);

      await dashboardController.getBatchReq(); // refresh data from API

      setState(() {}); // trigger UI rebuild
    }
  }

  Widget buildRequestItem(int index, List<BRData> data) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4),
      child: Row(
        children: [
          Text('${index + 1}.', style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              data[index].roll != ""
                  ? '${data[index].name} | Roll No. ${data[index].roll} | ${data[index].class1}'
                  : '${data[index].name} | ${data[index].class1}',
              style: const TextStyle(fontSize: 16),
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () {
              sendReq(true, data[index].id!);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xff21C375),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              'Accept',
              style:
                  TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
          const SizedBox(width: 8),
          OutlinedButton(
            onPressed: () {
              sendReq(false, data[index].id!);
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: Color(0xffCF4343),
              side: const BorderSide(color: Color(0xffCF4343)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              'Reject',
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: Color(0xffCF4343)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // backgroundColor: const Color(0xFFF5F7FA),
      body: SizedBox(
        width: MediaQuery.of(context).size.width,
        height: 250,
        child: Stack(
          // crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Custom Tab Bar

            // const SizedBox(height: 16),

            // Tab Content
            Container(
              margin: EdgeInsets.only(top: 20),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(16),
              ),
              padding: const EdgeInsets.fromLTRB(10, 30, 10, 10),
              child: selectedTabIndex == 0
                  ? dashboardController.uBat.isNotEmpty
                      ? ListView.builder(
                          itemCount: dashboardController.uBat.length,
                          itemBuilder: (context, index) =>
                              buildRequestItem(index, dashboardController.uBat),
                        )
                      : const Center(
                          child: Text("No Requests"),
                        )
                  : dashboardController.tBat.isNotEmpty
                      ? ListView.builder(
                          itemCount: dashboardController.tBat.length,
                          itemBuilder: (context, index) =>
                              buildRequestItem(index, dashboardController.tBat),
                        )
                      : const Center(
                          child: Text("No Requests"),
                        ),
            ),
            Container(
              width: 280,
              height: 40,
              margin: EdgeInsets.only(
                left: 10,
              ),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(32),
                color: Colors.white,
              ),
              child: Row(
                children: [
                  buildTab('Student Requests', 0),
                  buildTab('Teacher Requests', 1),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
