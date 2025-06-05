import 'dart:async';
import 'dart:math';

import 'package:easy_padhai/auth/google_signin_helper.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/custom_widgets/custum_nav_bar2.dart';
import 'package:easy_padhai/model/batch_model.dart';
import 'package:easy_padhai/model/binfo.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:lottie/lottie.dart';

// ignore: must_be_immutable
class Profile extends StatelessWidget {
  DashboardController dashboardController = Get.find();
  final GoogleSignInHelper _googleSignInHelper = GoogleSignInHelper();
  String name = "", type = "", icode = "";
  Profile({super.key});

  @override
  Widget build(BuildContext context) {
    print("picture :  ${userPic()}");
    final size = MediaQuery.of(context).size;
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;
    name = dashboardController.profileModel?.data?.userDetails?.name! ?? "";
    type = dashboardController.profileModel?.data?.type ?? "";
    String sanitizedUrl = userPic();
// For 'instituteCode' (assuming the field is actually 'instituteCode'
// - your original code shows 'instituteId' in the model)
    icode = dashboardController.profileModel?.data?.instituteCode ?? "";
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        elevation: 0,
        titleSpacing: 0,
        title: Padding(
          padding:
              EdgeInsets.only(left: MediaQuery.of(context).size.width * .05),
          child: const Text(
            'Profile',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
          ),
        ),
      ),
      body: Column(
        children: [
          Container(
            width: size.width,
            height: size.height * .28,
            color: AppColors.theme,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundImage: NetworkImage(sanitizedUrl),
                  backgroundColor: Colors.grey[400],
                  child: (sanitizedUrl.isEmpty)
                      ? Text(
                          userName().isNotEmpty
                              ? userName()[0].toUpperCase()
                              : '',
                          style: TextStyle(
                            fontSize: width * 0.08,
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                ),
                const SizedBox(height: 12),
                Text(
                  box.read('username') ?? '',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  box.read('email') ?? '',
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              children: [
                profileTile(
                  context,
                  iconPath: 'assets/editprofile.svg',
                  title: 'Edit Profile',
                  onTap: () {
                    Get.toNamed(RouteName.profileEdit);
                  },
                ),
                profileTile(
                  context,
                  iconPath: 'assets/leader.svg',
                  title: 'Leader Board',
                  onTap: () {
                    Get.toNamed(RouteName.leaderboard);
                    // Get.toNamed(RouteName.registerInstitution);
                  },
                ),
                userRole() == 'teacher'
                    ? profileTile(
                        context,
                        iconPath: 'assets/blist.svg',
                        title: 'Batch List',
                        onTap: () {
                          Get.toNamed(RouteName.batchlist);
                        },
                      )
                    : const SizedBox(
                        height: 0,
                      ),
                const Spacer(),
                profileTile(
                  context,
                  iconPath: 'assets/logout.svg',
                  title: 'Logout',
                  onTap: () {
                    showLogoutDialog(context);
                  },
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: userRole() == 'student'
          ? Obx(() => CustomBottomNavBar2(
                currentIndex: dashboardController.currentIndex1.value,
                onTap: (index) {
                  if (index == 1) {
                    // Assuming index 1 is for creating batch
                    _showFollowBatchBottomSheet(context);
                    //_showdoneBatchBottomSheet(context);
                  } else {
                    dashboardController.changeIndex1(index);
                  }
                },
              ))
          : Obx(() => CustomBottomNavBar(
                currentIndex: dashboardController.currentIndex.value,
                onTap: (index) {
                  if (index == 1) {
                    // Assuming index 1 is for creating batch
                    _showCreateBatchBottomSheet(context);
                    //_showdoneBatchBottomSheet(context);
                  } else if (index == 2) {
                    // Assuming index 1 is for creating batch
                    _showFollowBatchBottomSheetTeacher(context);
                    //_showdoneBatchBottomSheet(context);
                  } else {
                    dashboardController.changeIndex(index);
                  }
                },
              )),
    );
  }

  void _showFollowBatchBottomSheetTeacher(BuildContext context) {
    TextEditingController tb_controller = TextEditingController();
    TextEditingController batchController = TextEditingController();

    bool isLoading = false;
    bool isVisible = false;
    String institution = '';
    String className = '';
    String section = '';
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
                        _showdoneBatchBottomSheet(context);
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

  String generateBatchCode(String sessionYear, String className, String type,
      String section, String code) {
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

  void _showCreateBatchBottomSheet(BuildContext context) {
    AuthController authController = Get.find();
    String bclass = "";
    String bsec = "";
    late String selectedClass = "";
    late String sec = "";
    bool isload = false;
    TextEditingController batchController = TextEditingController();

    bool isLoading = false;
    // Fetch class and section data if not already loaded
    if (authController.classesdataList.isEmpty) {
      authController.getClassList('');
    }
    if (authController.sectiondataList.isEmpty) {
      authController.getsectionList('');
    }

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
                    if (!selectedClass.isEmpty && !sec.isEmpty) {
                      int? cls = extractClassNumber(selectedClass);
                      String bcode = generateBatchCode(
                          '2025', cls.toString(), type, sec, icode);
                      batchController.text = bcode;
                    }
                  }
                },
              ),
            ),
            const SizedBox(height: 20),
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
                items: dashboardController.profileModel?.data?.sectionDetail!
                    .map((e) => DropdownMenuItem(
                          value: e.sId,
                          child: Text(e.section ?? ''),
                        ))
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    controller.toggleSectionSelection(value);
                    bsec = value;
                    final selectedsec = dashboardController
                        .profileModel?.data?.sectionDetail!
                        .firstWhere(
                      (e) => e.sId == value,
                    );
                    sec = selectedsec!.section!;
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
                  if (bsec.isEmpty) {
                    Get.snackbar("Message", "Section is required!",
                        snackPosition: SnackPosition.BOTTOM);
                    return;
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

  int? extractClassNumber(String input) {
    // Extract Roman part (e.g. 'IX')
    final match =
        RegExp(r'Class\s+([IVXLCDM]+)', caseSensitive: false).firstMatch(input);
    if (match == null) return null;

    String roman = match.group(1)!.toUpperCase();

    // Convert Roman numeral to integer
    return _romanToInt(roman);
  }

  int _romanToInt(String s) {
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

  void _showFollowBatchBottomSheet(BuildContext context) {
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

  void _showRollBottomSheet(BuildContext context, String type, String code) {
    // Fetch class and section data if not already loaded
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
                initialValue: name,
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
                  BinfoModel dta =
                      await dashboardController.postbatchreq(code, name, roll);

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

  void _showdoneBatchBottomSheet(BuildContext context) {
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

  Future<void> showLogoutDialog(BuildContext context) async {
    return showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            backgroundColor: AppColors.theme,
            title: const Text('Logout Confirmation',
                style: TextStyle(color: Colors.white)),
            content: const Text(
              'Are you sure you want to logout?',
              style: TextStyle(color: Colors.white),
            ),
            actions: <Widget>[
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child:
                    const Text('Cancel', style: TextStyle(color: Colors.white)),
              ),
              ElevatedButton(
                onPressed: () async {
                  await _googleSignInHelper.signOutGoogle();
                  await box.erase();
                  await GetStorage().erase();

                  Get.delete<AuthController>();
                  Get.delete<DashboardController>();
                  Get.lazyPut(() => AuthController());
                  Get.lazyPut(() => DashboardController());

                  Get.offAllNamed(RouteName.login);
                },
                child: const Text('Logout',
                    style: TextStyle(color: AppColors.theme)),
              ),
            ],
          );
        });
  }

  Widget buildClassCard(String title, String subtitle, String imagePath) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 160,
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage(imagePath),
            fit: BoxFit.cover,
          ),
        ),
        padding: const EdgeInsets.all(12),
        alignment: Alignment.bottomLeft,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold)),
            if (subtitle.isNotEmpty)
              Text(subtitle,
                  style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget profileTile(BuildContext context,
      {required String iconPath,
      required String title,
      required VoidCallback onTap}) {
    final size = MediaQuery.of(context).size;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(
            horizontal: size.width * .05, vertical: size.height * 0.015),
        child: Row(
          children: [
            SvgPicture.asset(
              iconPath,
              width: size.width * .055,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                    fontSize: size.width * .04,
                    fontWeight: FontWeight.w600,
                    color: AppColors.grey5),
              ),
            ),
            Icon(Icons.arrow_forward_ios,
                size: size.width * .04, color: AppColors.grey5),
          ],
        ),
      ),
    );
  }
}
