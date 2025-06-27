import 'dart:async';
import 'dart:math';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/model/batch_model.dart';
import 'package:easy_padhai/model/binfo.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

class BatchHelperTeacher {
  static showFollowBatchBottomSheetTeacher(BuildContext context) {
    TextEditingController tb_controller = TextEditingController();
    DashboardController dashboardController = Get.find();
    TextEditingController batchController = TextEditingController();

    bool isVisible = false;
    String institution = '';
    String className = '';
    String section = '';
    bool isLoading = false;
    Timer? _debounce;

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
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (tb_controller.text.isEmpty) {
                        Get.snackbar("Message", "Batch code is required!",
                            snackPosition: SnackPosition.BOTTOM);
                        return;
                      }
                      if (institution.isEmpty && className.isEmpty) {
                        Get.snackbar("Message", "Enter a valid Batch code",
                            snackPosition: SnackPosition.BOTTOM);
                        return;
                      }
                      isLoading = true;
                      BinfoModel dta = await dashboardController.postbatchreq(
                          tb_controller.text.toString().trim(), "", "");

                      if (dta != null && dta.status == true) {
                        isLoading = false;
                        Navigator.pop(context);
                        showdoneBatchBottomSheet(context);
                        batchController.text = "";
                      } else {
                        isLoading = false;
                        Navigator.pop(context);
                        batchController.text = "";
                      }
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

  static String generateBatchCode(String sessionYear, String className,
      String type, String section, String code) {
    final random = Random();
    const letters = 'abcdefghijklmnopqrstuvwxyz';

    // Generate 4 random letters
    String randomPart = List.generate(3, (index) {
      return letters[random.nextInt(letters.length)];
    }).join();

    // Capitalize first letter
    randomPart =
        randomPart[0].toUpperCase() + randomPart.substring(1).toUpperCase();

    // Get last 2 digits of session year
    String sessionSuffix = sessionYear.length >= 2
        ? sessionYear.substring(sessionYear.length - 2)
        : sessionYear;

    String ty = type.isNotEmpty ? type[0] : "S";

    // Combine to form batch code
    return '$sessionSuffix$ty$code${className}${section.toUpperCase()}';
  }

  static showCreateBatchBottomSheet(BuildContext context) {
    // Fetch class and section data if not already loaded
    AuthController authController = Get.find();
    DashboardController dashboardController = Get.find();
    TextEditingController batchController = TextEditingController();
    String type = "";
    String icode = "";
    String bclass = "";
    String bsec = "";
    late String selectedClass = "";
    late String sec = "";
    bool isLoading = false;
    if (authController.classesdataList.isEmpty) {
      authController.getClassList('');
    }
    if (authController.sectiondataList.isEmpty) {
      authController.getsectionList('');
    }

    type = dashboardController.profileModel?.data?.type! ?? "";
    icode = dashboardController.profileModel?.data?.instituteCode! ?? "";
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
            const Text(
              'Create A Batch',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            GetBuilder<AuthController>(
              builder: (controller) => DropdownButtonFormField<String>(
                isExpanded: true,
                icon: const SizedBox.shrink(),
                dropdownColor: Colors.white,
                //   menuMaxHeight: 300,
                decoration: InputDecoration(
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                  hintText: 'Select Class',
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
                  suffixIcon: const Icon(Icons.keyboard_arrow_down),
                ),
                items: dashboardController.profileModel?.data?.classDetail!
                    .map((e) => DropdownMenuItem(
                          value: e.sId,
                          child: Text(e.class1 ?? ''),
                        ))
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    controller.toggleClassSelection(value);
                    bclass = value;
                    // Find the selected class object by ID
                    final selectedClass1 = dashboardController
                        .profileModel?.data?.classDetail!
                        .firstWhere(
                      (e) => e.sId == value,
                    );

                    // Set batchController text
                    selectedClass = selectedClass1!.class1!;
                    if (type == 'School') {
                      if (!selectedClass.isEmpty && !sec.isEmpty) {
                        int? cls = extractClassNumber(selectedClass);
                        String bcode = generateBatchCode(
                            '2025', cls.toString(), type, sec, icode);
                        batchController.text = bcode;
                      }
                    } else {
                      if (!selectedClass.isEmpty) {
                        int? cls = extractClassNumber(selectedClass);
                        String bcode = generateBatchCode(
                            '2025', cls.toString(), type, sec, icode);
                        batchController.text = bcode;
                      }
                    }
                  }
                },
              ),
            ),
            const SizedBox(height: 20),
            if (type == 'School')
              GetBuilder<AuthController>(
                builder: (controller) => DropdownButtonFormField<String>(
                  isExpanded: true,
                  icon: const SizedBox.shrink(),
                  dropdownColor: Colors.white,
                  // menuMaxHeight: 300,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 18,
                    ),
                    hintText: 'Select Section',
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
                    suffixIcon: const Icon(Icons.keyboard_arrow_down),
                  ),
                  items: controller.sectiondataList
                      .map((e) => DropdownMenuItem(
                            value: e.sId,
                            child: Text(e.sectionsName ?? ''),
                          ))
                      .toList(),
                  onChanged: (value) {
                    if (value != null) {
                      controller.toggleSectionSelection(value);
                      bsec = value;
                      final selectedsec = controller.sectiondataList.firstWhere(
                        (e) => e.sId == value,
                      );
                      sec = selectedsec.sectionsName!;
                      int? cls = extractClassNumber(selectedClass);
                      String bcode = generateBatchCode(
                          '2025', cls.toString(), type, sec, icode);
                      batchController.text = bcode;
                    }
                  },
                ),
              ),
            const SizedBox(height: 20),
            GetBuilder<AuthController>(
              builder: (controller) => TextFormField(
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 18,
                  ),
                  hintText: 'Batch Code',
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
                controller: batchController,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  //  Navigator.pop(context);
                  if (bclass.isEmpty) {
                    Get.snackbar("Message", "Class is required!",
                        snackPosition: SnackPosition.BOTTOM);
                    return;
                  }
                  if (type == 'School') {
                    if (bsec.isEmpty) {
                      Get.snackbar("Message", "Section is required!",
                          snackPosition: SnackPosition.BOTTOM);
                      return;
                    }
                  }
                  isLoading = true;
                  BatchModel dta = await dashboardController.postbatch(
                      bclass, bsec, batchController.text);
                  if (dta != null && dta.status == true) {
                    isLoading = false;
                    Navigator.pop(context);
                    Get.snackbar("Message", "Batch code created successfully!",
                        snackPosition: SnackPosition.BOTTOM);
                    //  _showdoneBatchBottomSheet(context);
                    batchController.text = "";
                  } else {
                    isLoading = false;
                    Navigator.pop(context);
                    batchController.text = "";
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

  static int? extractClassNumber(String input) {
    // Extract Roman part (e.g. 'IX')
    final match =
        RegExp(r'Class\s+([IVXLCDM]+)', caseSensitive: false).firstMatch(input);
    if (match == null) return null;

    String roman = match.group(1)!.toUpperCase();

    // Convert Roman numeral to integer
    return _romanToInt(roman);
  }

  static int _romanToInt(String s) {
    final Map<String, int> romanMap = {
      'I': 1,
      'V': 5,
      'X': 10,
      'L': 50,
      'C': 100,
      'D': 500,
      'M': 1000
    };

    int result = 0;
    for (int i = 0; i < s.length; i++) {
      int current = romanMap[s[i]]!;
      int next = (i + 1 < s.length) ? romanMap[s[i + 1]]! : 0;

      if (current < next) {
        result -= current;
      } else {
        result += current;
      }
    }
    return result;
  }

  static showdoneBatchBottomSheet(BuildContext context) {
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
