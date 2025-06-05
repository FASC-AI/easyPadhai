import 'dart:async';
import 'dart:math';

import 'package:carousel_slider/carousel_slider.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/dashboard/batch_req.dart';
import 'package:easy_padhai/dashboard/class_teacher_assign.dart';
import 'package:easy_padhai/model/batch_model.dart';
import 'package:easy_padhai/model/batchlist_model.dart';
import 'package:easy_padhai/model/binfo.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_html/flutter_html.dart';

// ignore: must_be_immutable
class TeacherHome extends StatefulWidget {
  const TeacherHome({super.key});
  @override
  State<TeacherHome> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<TeacherHome> {
  DashboardController dashboardController = Get.find();
  AuthController authController = Get.find();
  TextEditingController batchController = TextEditingController();
  List<SubjectDetail> sublist = [];
  bool isLoading = false;
  String type = "";
  String icode = "";
  String bclass = "";
  String bsec = "";
  late String selectedClass = "";
  late String sec = "";
  bool isload = false;
  List<BbData> batches = [];

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    setState(() {
      isload = true;
    });
    ProfileModel data = await dashboardController.getProfile();
    await dashboardController.getBanners();
    await dashboardController.getNotification();
    await dashboardController.getBatch();
    await dashboardController.getBatchReq();
    await dashboardController.getProfile();
    sublist = data.data!.subjectDetail!;
    batches = dashboardController.batchlist;
    type = dashboardController.profileModel?.data?.type! ?? "";
    icode = dashboardController.profileModel?.data?.instituteCode! ?? "";
    setState(() {
      isload = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        elevation: 0,
        leading: Padding(
          padding:
              EdgeInsets.only(left: MediaQuery.of(context).size.width * .05),
          child: Image.asset(
            'assets/logoh.png',
          ),
        ),
        title: const Text(
          'Easy Padhai',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ),
      body: !isload
          ? SafeArea(
              child: SingleChildScrollView(
                // padding: EdgeInsets.symmetric(
                //     horizontal: MediaQuery.of(context).size.width * .05),
                child: Column(
                  children: [
                    CarouselSlider(
                      options: CarouselOptions(
                        height: size.height * 0.28,
                        autoPlay: true,
                        enlargeCenterPage: true,
                        viewportFraction: 0.9,
                      ),
                      items: dashboardController.Bannerlist.map((item) {
                        return GestureDetector(
                          onTap: () => _launchURL(item.redirectPath!),
                          child: Container(
                            padding: const EdgeInsets.only(top: 20, bottom: 20),
                            width: size.width,
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12)),
                                child: Image.network(
                                  item.images![0].url!,
                                  fit: BoxFit.cover,
                                  loadingBuilder:
                                      (context, child, loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return const Center(
                                        child: CircularProgressIndicator());
                                  },
                                  errorBuilder: (context, error, stackTrace) =>
                                      const Center(child: Icon(Icons.error)),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(
                          horizontal: MediaQuery.of(context).size.width * .05),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // ClipRRect(
                          //   borderRadius: BorderRadius.circular(20),
                          //   child: Image.asset(
                          //     'assets/banner.png',
                          //     height: size.height * 0.25,
                          //     width: size.width,
                          //     fit: BoxFit.cover,
                          //   ),
                          // ),

                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                            child: dashboardController.tNoti.isNotEmpty
                                ? Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: List.generate(
                                      dashboardController.tNoti.length,
                                      (index) {
                                        String formatted = formatDate(
                                            dashboardController
                                                .tNoti[index].date!);
                                        return Padding(
                                          padding:
                                              const EdgeInsets.only(bottom: 8),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              if (dashboardController
                                                      .tNoti[index].message! !=
                                                  "")
                                                Text(
                                                  formatted,
                                                  style: const TextStyle(
                                                      fontWeight:
                                                          FontWeight.bold),
                                                ),
                                              const SizedBox(height: 8),
                                              Row(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  const Icon(
                                                      Icons.notifications,
                                                      color: Colors.blue),
                                                  const SizedBox(width: 10),
                                                  Expanded(
                                                    child: Html(
                                                      data: dashboardController
                                                          .tNoti[index]
                                                          .message!,
                                                      style: {
                                                        "body": Style(
                                                          margin: Margins.zero,
                                                          fontSize:
                                                              FontSize.medium,
                                                        ),
                                                        "p": Style(
                                                          margin: Margins.zero,
                                                        ),
                                                      },
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        );
                                      },
                                    ),
                                  )
                                : Center(
                                    child: Column(
                                      children: [
                                        SizedBox(
                                            width: 100,
                                            height: 130,
                                            child: Image.asset(
                                                "assets/no_notification.png")),
                                        Text(
                                          "No messages yet. Your notifications will appear here.",
                                          textAlign: TextAlign.center,
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: AppColors.black
                                                .withOpacity(0.5),
                                          ),
                                        )
                                      ],
                                    ),
                                  ),
                          ),

                          const SizedBox(height: 20),
                          Container(
                              color: Colors.white,
                              width: MediaQuery.of(context).size.width,
                              height: 250,
                              child: const RequestsScreen()),
                          const SizedBox(height: 20),
                          SizedBox(
                            height: 120, // Slightly increased height if needed
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: batches.length,
                              itemBuilder: (context, index) {
                                String cls =
                                    "${extractClassNumber(batches[index].class1!).toString()}-${batches[index].section}";
                                return Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8.0), // spacing between items
                                  child: GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (_) => TeacherClassScreen(
                                                  title: cls,
                                                  id: batches[index].classId!,
                                                  sub_id: batches[index]
                                                      .subject!
                                                      .sId!,
                                                  sec_id:
                                                      batches[index].sectionId!,
                                                  isClassteacher: batches[index]
                                                      .classTeacher!,
                                                )),
                                      );
                                    },
                                    child: buildClassCard(
                                        cls,
                                        batches[index].institute!,
                                        batches[index]
                                                .subject!
                                                .images!
                                                .isNotEmpty
                                            ? batches[index]
                                                .subject!
                                                .images![0]
                                                .url!
                                            : ""),
                                  ),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
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
      bottomNavigationBar: Obx(() => CustomBottomNavBar(
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

  String formatDate(String isoDate) {
    final dateTime = DateTime.parse(isoDate).toLocal(); // Convert to local time
    return DateFormat('EEE, dd MMM').format(dateTime);
  }

  void _showFollowBatchBottomSheetTeacher(BuildContext context) {
    TextEditingController tb_controller = TextEditingController();
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

  void _launchURL(String url) async {
    final Uri uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $url';
    }
  }

  Widget buildClassCard(String title, String subtitle, String imagePath) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 160,
        decoration: BoxDecoration(
          image: imagePath.isNotEmpty
              ? DecorationImage(
                  image: NetworkImage(imagePath),
                  fit: BoxFit.cover,
                  onError: (error, stackTrace) {
                    debugPrint('Image load failed: $error'); // Error logging
                  },
                )
              : null,
          color: Colors.grey[300], // Background color if no image
        ),
        padding: const EdgeInsets.all(12),
        alignment: Alignment.bottomLeft,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (subtitle.isNotEmpty)
              Text(
                subtitle,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
