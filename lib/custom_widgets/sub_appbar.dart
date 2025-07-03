import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SubjectAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<String> teacherName;

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
      padding: const EdgeInsets.only(top: 40, left: 16, right: 16, bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row with Back Button and Title
          Row(
            children: [
              GestureDetector(
                onTap: () => Get.offAllNamed(RouteName.studentHome),
                child: Image.asset(
                  'assets/back.png',
                  fit: BoxFit.fill,
                  width: MediaQuery.of(context).size.width * 0.09,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),

          if (teacherName.isNotEmpty) const SizedBox(height: 10),

          // Horizontal teacher badges
          if (teacherName.isNotEmpty)
            SizedBox(
              height: 45,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: teacherName.length,
                itemBuilder: (context, index) {
                  return Container(
                    margin: const EdgeInsets.only(left: 12),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 15),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Center(
                      child: Text(
                        teacherName[index],
                        style: const TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(teacherName.isNotEmpty ? 120 : 80);
}
