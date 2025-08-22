import 'package:easy_padhai/auth/subject_view.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

// ignore: must_be_immutable
class SelectSubject extends StatelessWidget {
  SelectSubject({super.key});
  AuthController authController = Get.find();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgColor,
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        leadingWidth: MediaQuery.of(context).size.width * .13,
        leading: IconButton(
          padding: EdgeInsets.zero,
          icon: Image.asset(
            'assets/back.png',
            fit: BoxFit.fill,
            width: MediaQuery.of(context).size.width * .07,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        titleSpacing: 0,
        title: Text(
          'Select Your Subject',
          style: TextStyle(
            color: AppColors.white,
            fontSize: MediaQuery.of(context).size.width * .045,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Stack(
        children: [
          Padding(
              padding: EdgeInsets.all(MediaQuery.of(context).size.width * .03),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  Expanded(child: SubjectView()),
                ],
              )),
          Positioned(
            left: MediaQuery.of(context).size.width * .125,
            bottom: MediaQuery.of(context).size.width * .05,
            right: MediaQuery.of(context).size.width * .125,
            child: CustomButton(
              text: 'Confirm Subject',
              onTap: () async {
                // Get the number of selected classes and subjects
                int selectedClassCount = authController.selectedClassIds.length;
                int selectedSubjectCount = authController.selectedSubjectIds.length;
                
                // Determine role based on selection pattern
                String userRole = '';
                
                if (selectedClassCount == 1 && selectedSubjectCount >= 5 && selectedSubjectCount <= 7) {
                  userRole = 'student';
                  print("🎓 Role determined: STUDENT (1 class, $selectedSubjectCount subjects)");
                } else if (selectedClassCount > 1 && selectedSubjectCount == 1) {
                  userRole = 'teacher';
                  print("👨‍🏫 Role determined: TEACHER ($selectedClassCount classes, 1 subject)");
                } else {
                  // Invalid selection pattern
                  if (selectedClassCount == 1) {
                    if (selectedSubjectCount < 5) {
                      Get.snackbar(
                          "Message", "When selecting 1 class, you must choose at least 5 subjects",
                          snackPosition: SnackPosition.BOTTOM);
                    } else if (selectedSubjectCount > 7) {
                      Get.snackbar(
                          "Message", "When selecting 1 class, you can choose up to 7 subjects",
                          snackPosition: SnackPosition.BOTTOM);
                    }
                  } else if (selectedClassCount > 1) {
                    if (selectedSubjectCount != 1) {
                      Get.snackbar(
                          "Message", "When selecting multiple classes, please choose exactly one subject",
                          snackPosition: SnackPosition.BOTTOM);
                    }
                  } else {
                    Get.snackbar(
                        "Message", "Please select at least 1 class",
                        snackPosition: SnackPosition.BOTTOM);
                  }
                  return;
                }
                
                // Validation passed - proceed with subject confirmation
                print("✅ Validation passed! User role: $userRole");
                
                // Store the determined role in the controller for later use
                authController.userRole.value = userRole;
                
                authController.selectedSubjectIds.isNotEmpty
                    ? {
                        await authController.getInstitutes(),
                        Get.lazyPut(() => DashboardController()),
                        await authController.postUpdateAuthInfo('subject')
                      }
                    : Get.snackbar(
                        '',
                        '',
                        snackPosition: SnackPosition.BOTTOM,
                        backgroundColor: AppColors.red,
                        titleText: const SizedBox.shrink(),
                        messageText: const Text(
                          'Please select atleast 1 subject',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                          ),
                        ),
                      );
              },
            ),
          )
        ],
      ),
    );
  }
}
