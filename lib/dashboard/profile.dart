import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/custom_widgets/custum_nav_bar2.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

// ignore: must_be_immutable
class Profile extends StatelessWidget {
  DashboardController dashboardController = Get.find();
  Profile({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

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
                  backgroundImage: NetworkImage(box.read('propic') ?? ''),
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
                   // Get.toNamed(RouteName.leaderboard);
                    Get.toNamed(RouteName.registerInstitution);
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
                currentIndex: dashboardController.currentIndex.value,
                onTap: dashboardController.changeIndex1,
              ))
          : Obx(() => CustomBottomNavBar(
                currentIndex: dashboardController.currentIndex.value,
                onTap: dashboardController.changeIndex,
              )),
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
                  await box.erase();
                  Get.delete<AuthController>();
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
