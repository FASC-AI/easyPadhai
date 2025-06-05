import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SubjectAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String teacherName;

  SubjectAppBar({
    super.key,
    required this.title,
    required this.teacherName,
  });
  DashboardController dashboardController = Get.find();
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(color: AppColors.theme),
      padding: const EdgeInsets.only(top: 50, left: 16, right: 16, bottom: 16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Back Button
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Image.asset(
                  'assets/back.png',
                  fit: BoxFit.fill,
                  width: MediaQuery.of(context).size.width * 0.09,
                ),
              ),
              const SizedBox(width: 12),

              // Title
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),

              //  const Spacer(),
            ],
          ),
          if (teacherName.isNotEmpty)
            const SizedBox(
              height: 20,
            ),
          // Pill-shaped teacher badge
          if (teacherName.isNotEmpty)
            Container(
              margin: EdgeInsets.only(left: 20),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
              ),
              child: Text(
                teacherName,
                style: const TextStyle(
                    color: Colors.blue, fontWeight: FontWeight.w600),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(teacherName.isNotEmpty ? 140 : 80);
}
