import 'dart:async';

import 'package:carousel_slider/carousel_slider.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/custom_widgets/custum_nav_bar2.dart';
import 'package:easy_padhai/model/binfo.dart';
import 'package:easy_padhai/model/noti_count.dart';
import 'package:easy_padhai/model/notification_model.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:url_launcher/url_launcher.dart';

// ignore: must_be_immutable
class StudentHome extends StatefulWidget {
  const StudentHome({super.key});
  @override
  State<StudentHome> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<StudentHome> {
  DashboardController dashboardController = Get.find();

  TextEditingController batchController = TextEditingController();
  bool isLoading = false;
  bool isload = false;

  List<SubjectDetail> sublist = [];
  List<NData1> hlist = [];
  List<NotiCountData> clist = [];
  List<NotiCountData> subjectNotilist = [];
  String name = "";
  String class1 = "";

  Future<void> _loadProfileData() async {
    setState(() {
      isload = true;
    });
    ProfileModel data = await dashboardController.getProfile();
    await dashboardController.getBanners();
    await dashboardController.getNotification();
    await dashboardController.getbatchjoined();
    //await dashboardController.getBatchReq();
    if (dashboardController.isJoined.value) {
      await dashboardController.getStuNoti();
      hlist = dashboardController.stuNotilist;
      await dashboardController.countNoti();
      clist = dashboardController.countNotilist;
    }
    sublist = data.data!.subjectDetail!;
    name = data.data!.userDetails!.name!;
    homeNoti();
    class1 =
        "(${extractClassNumber(data.data!.classDetail![0].class1!).toString()})";
    setState(() {
      isload = false;
    });
  }

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _onRefresh() async {
    // Your refresh logic
    await _loadProfileData();
    //_refreshController.refreshCompleted();
  }

  void homeNoti() {
    for (int i = 0; i < sublist.length; i++) {
      for (int j = 0; j < clist.length; j++) {
        if (sublist[i].sId == clist[j].subjectId![0]) {
          if (clist[j].isReaded == false) {
            subjectNotilist.add(clist[j]);
          }
        }
      }
    }
  }

  void _launchURL(String url) async {
    final Uri uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $url';
    }
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

  String formatDate(String isoDate) {
    final dateTime = DateTime.parse(isoDate).toLocal(); // Convert to local time
    return DateFormat('EEE, dd MMM').format(dateTime);
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        elevation: 0,
        // leading: Padding(
        //   padding:
        //       EdgeInsets.only(left: MediaQuery.of(context).size.width * .05),
        //   child: Image.asset(
        //     'assets/logoh.png',
        //   ),
        // ),
        title: Text(
          'Hi, $name  $class1',
          style: const TextStyle(
              color: Colors.white, fontWeight: FontWeight.w600, fontSize: 20),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: !isload
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
                              padding:
                                  const EdgeInsets.only(top: 20, bottom: 20),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  child: Image.network(
                                    item.images![0].url!,
                                    fit: BoxFit.cover,
                                    width: size.width,
                                    loadingBuilder:
                                        (context, child, loadingProgress) {
                                      if (loadingProgress == null) return child;
                                      return const Center(
                                          child: CircularProgressIndicator());
                                    },
                                    errorBuilder: (context, error,
                                            stackTrace) =>
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
                            horizontal:
                                MediaQuery.of(context).size.width * .05),
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
                              height: 250,
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey.shade300),
                              ),
                              child: dashboardController.uNoti.isNotEmpty
                                  ? ListView.builder(
                                      // padding:
                                      //     const EdgeInsets.all(16),
                                      itemCount:
                                          dashboardController.uNoti.length,
                                      itemBuilder: (context, index) {
                                        String formatted = formatDate(
                                            dashboardController
                                                .uNoti[index].date!);

                                        return Padding(
                                          padding:
                                              const EdgeInsets.only(bottom: 8),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              if (dashboardController
                                                      .uNoti[index].message! !=
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
                                                          .uNoti[index]
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
                                    )
                                  : Center(
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
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
                            SizedBox(
                              width: double.infinity,
                              height: 180, // Adjust height based on card size
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 0, vertical: 8),
                                itemCount: sublist.length,
                                itemBuilder: (context, index) {
                                  int notificationCount =
                                      getNotificationCount(sublist[index].sId!);

                                  return Padding(
                                    padding: const EdgeInsets.only(
                                        right: 12), // spacing between cards
                                    child: GestureDetector(
                                      onTap: () {
                                        Navigator.pushNamed(
                                          context,
                                          RouteName.subdet,
                                          arguments: {
                                            'title': sublist[index].subject!,
                                            'id': sublist[index].sId!,
                                          },
                                        );
                                      },
                                      child: buildClassCard11(
                                        subject: sublist[index].subject!,
                                        imageAsset:
                                            sublist[index].images!.isNotEmpty
                                                ? sublist[index].images![0].url!
                                                : "",
                                        isSelected: false,
                                        notificationCount: notificationCount,
                                        color: Colors.black87,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            )
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
              )),
      ),
      bottomNavigationBar: Obx(() => CustomBottomNavBar2(
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
          )),
    );
  }

  int getNotificationCount(String subjectId) {
    return subjectNotilist
        .where((notification) => notification.subjectId!.contains(subjectId))
        .length;
  }

  Widget buildClassCard({
    required String label,
    required String imageAsset,
    required Color color,
    IconData? icon,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey[200], // Fallback color for better UX
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Image loader
            imageAsset.isNotEmpty
                ? Image.network(
                    imageAsset,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const Center(
                        child: CircularProgressIndicator(),
                      );
                    },
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: Colors.grey[300],
                        alignment: Alignment.center,
                        child: Icon(
                          Icons.broken_image,
                          color: Colors.grey[600],
                          size: 50,
                        ),
                      );
                    },
                  )
                : Container(
                    color: Colors.grey[300],
                    alignment: Alignment.center,
                    child: Icon(
                      Icons.image_not_supported,
                      color: Colors.grey[600],
                      size: 50,
                    ),
                  ),
            // Text and Icon overlay
            Align(
              alignment: Alignment.bottomLeft,
              child: Container(
                padding: const EdgeInsets.all(12),
                // color: Colors.black54, // Slight overlay for readability
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (icon != null) ...[
                      Icon(icon, color: Colors.white, size: 20),
                      const SizedBox(width: 4),
                    ],
                    Flexible(
                      child: Text(
                        label,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildClassCard1(String title, String subtitle, String imagePath) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        // width: 150,
        // height: 150,
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

  Widget buildClassCard11({
    required String subject,
    required String imageAsset,
    bool isSelected = false,
    int notificationCount = 0,
    required Color color,
    IconData? icon,
  }) {
    return Stack(
      children: [
        Container(
          width: 160,
          height: 120,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: isSelected
                ? Border.all(color: Colors.redAccent, width: 2)
                : null,
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.redAccent.withOpacity(0.5),
                      blurRadius: 8,
                      spreadRadius: 1,
                    ),
                  ]
                : [],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Background Image
                Container(
                  width: double.infinity,
                  height: double.infinity,
                  decoration: BoxDecoration(
                    image: imageAsset.isNotEmpty
                        ? DecorationImage(
                            image: NetworkImage(imageAsset),
                            fit: BoxFit.cover,
                            onError: (error, stackTrace) {
                              debugPrint('Image load failed: $error');
                            },
                          )
                        : null,
                    color: Colors.grey[300], // Background color if no image
                  ),
                ),
                // Gradient Overlay on Bottom Half
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60, // Half of the card height (120/2)
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.8),
                        ],
                      ),
                    ),
                  ),
                ),
                // Text Content
                Positioned(
                  bottom: 12,
                  left: 12,
                  right: 12,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        subject,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        if (notificationCount > 0)
          Positioned(
            right: 4,
            bottom: 4,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SvgPicture.asset(
                  "assets/bell.svg",
                  height: 30,
                ),
                Positioned(
                  right: 0,
                  bottom: 12,
                  child: Container(
                    padding: const EdgeInsets.all(1),
                    // decoration: const BoxDecoration(
                    //   color: Colors.red,
                    //   shape: BoxShape.circle,
                    // ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      '$notificationCount',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
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
              height: 90,
              width: 150,
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
