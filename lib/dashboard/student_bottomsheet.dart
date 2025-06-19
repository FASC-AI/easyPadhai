import 'dart:async';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/model/binfo.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

class BatchHelper {
  static showFollowBatchBottomSheet(BuildContext context) {
    DashboardController dashboardController = Get.find();
    TextEditingController tb_controller = TextEditingController();
    bool isVisible = false;
    String institution = '';
    String className = '';
    String section = '';
    String type = '';
    Timer? _debounce;
    bool isLoading = false;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) => Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 20,
              right: 20,
              top: 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Type Your Batch Code',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: tb_controller,
                  onChanged: (value) {
                    if (_debounce?.isActive ?? false) _debounce!.cancel();
                    _debounce =
                        Timer(const Duration(milliseconds: 500), () async {
                      if (value.isNotEmpty) {
                        // 👇 Call your API here to get batch info
                        BinfoModel dta =
                            await dashboardController.postbatchinfo(
                                tb_controller.text.toString().trim());

                        if (dta != null && dta.status == true) {
                          setState(() {
                            isVisible = true;
                            institution = dta.data!.institute!;
                            className = dta.data!.class1!;
                            section = dta.data!.section ?? "";
                            type = dta.data!.type!;
                          });
                        } else {
                          setState(() {
                            isVisible = false;
                          });
                        }
                      } else {
                        setState(() {
                          isVisible = false;
                        });
                      }
                    });
                  },
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 18,
                    ),
                    hintText: 'Type Batch Code',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.grey),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.grey),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.grey),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                if (isVisible)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text('Institution',
                              style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(width: 20),
                          Expanded(child: Text(institution)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          const Text('Class',
                              style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(width: 20),
                          Text(className),
                          const SizedBox(width: 20),
                          const Text('Section',
                              style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(width: 20),
                          Text(section),
                        ],
                      ),
                    ],
                  ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (tb_controller.text.isEmpty) {
                        Get.snackbar("Message", "Batch code is required!",
                            snackPosition: SnackPosition.BOTTOM);
                        return;
                      }

                      isLoading = true;
                      Navigator.pop(context);
                      if (institution.isNotEmpty && className.isNotEmpty) {
                        _showRollBottomSheet(context, type,
                            tb_controller.text.toString().trim());
                      } else {
                        Get.snackbar("Message", "Enter a valid Batch code",
                            snackPosition: SnackPosition.BOTTOM);
                        return;
                      }

                      // BinfoModel dta = await dashboardController
                      //     .postbatchreq(tb_controller.text.toString().trim());

                      // if (dta != null && dta.status == true) {
                      //   isLoading = false;
                      //   Navigator.pop(context);
                      //   _showdoneBatchBottomSheet(context);
                      // } else {
                      //   isLoading = false;
                      //   Navigator.pop(context);
                      // }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.theme,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                    child: isLoading
                        ? CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'Submit',
                            style: TextStyle(color: Colors.white),
                          ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        );
      },
    );
  }

  static void _showRollBottomSheet(
      BuildContext context, String type, String code) {
    // Fetch class and section data if not already loaded
    DashboardController dashboardController = Get.find();
    TextEditingController rollController = TextEditingController();
    bool isLoading = false;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              type == 'School'
                  ? 'Please tell the teacher your name and roll number'
                  : "Please tell the teacher your name",
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            GetBuilder<DashboardController>(
              builder: (controller) => TextFormField(
                initialValue: userName(),
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 18,
                  ),
                  hintText: 'Enter your name',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Colors.grey),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Colors.grey),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Colors.grey),
                  ),
                ),
                readOnly: true,
              ),
            ),
            const SizedBox(height: 20),
            if (type == 'School')
              GetBuilder<DashboardController>(
                builder: (controller) => TextFormField(
                  controller: rollController,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 18,
                    ),
                    hintText: 'Enter your roll number',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.grey),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.grey),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.grey),
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  //  Navigator.pop(context);

                  if (type == 'School' && rollController.text.isEmpty) {
                    Get.snackbar("Message", "Roll number is required!",
                        snackPosition: SnackPosition.BOTTOM);
                    return;
                  }
                  isLoading = true;
                  String roll = rollController.text.isEmpty
                      ? ""
                      : rollController.text.toString().trim();
                  BinfoModel dta = await dashboardController.postbatchreq(
                      code, userName(), roll);

                  if (dta != null && dta.status == true) {
                    isLoading = false;
                    Navigator.pop(context);
                    _showdoneBatchBottomSheet(context);
                  } else {
                    isLoading = false;
                    Navigator.pop(context);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.theme,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                ),
                child: isLoading
                    ? Lottie.asset(
                        'assets/loading.json', // Replace with your animation file path
                        width: MediaQuery.of(context).size.width,
                        height: MediaQuery.of(context).size.height,
                        repeat: true, // Check play state for repeat
                        animate: true,
                        reverse: false,
                      )
                    : const Text(
                        'Submit',
                        style: TextStyle(color: Colors.white),
                      ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  static void _showdoneBatchBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              alignment: Alignment.center,
              height: 150,
              width: 200,
              child: Image.asset("assets/batch.png"),
            ),
            const SizedBox(height: 10),
            const Text(
              textAlign: TextAlign.center,
              'Request sent! The teacher will review and accept it shortly.',
              style: TextStyle(
                  fontSize: 18,
                  color: AppColors.theme,
                  fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 20),
            Align(
              alignment: Alignment.center,
              child: SizedBox(
                width: 200,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.white,
                    side: const BorderSide(
                      color: AppColors.theme,
                      width: 1,
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 15),
                  ),
                  child: const Text(
                    'Ok',
                    style: TextStyle(color: AppColors.theme),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
