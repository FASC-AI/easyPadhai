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
                  // Hint text based on class selection
                  Obx(() {
                    int selectedClassCount = authController.selectedClassIds.length;
                    String hintText = '';
                    Color hintColor = Colors.blue;
                    
                    if (selectedClassCount > 1) {
                      hintText = '📚 Multiple classes selected: You can choose exactly 1 subject';
                      hintColor = Colors.orange;
                    } else if (selectedClassCount == 1) {
                      hintText = '📚 Single class selected: Choose 5-7 subjects';
                      hintColor = Colors.green;
                    } else {
                      hintText = '📚 Please select classes first';
                      hintColor = Colors.grey;
                    }
                    
                    return Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: hintColor.withOpacity(0.1),
                        border: Border.all(color: hintColor.withOpacity(0.3)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        hintText,
                        style: TextStyle(
                          color: hintColor,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    );
                  }),
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
                // Get the number of selected classes
                int selectedClassCount = authController.selectedClassIds.length;
                
                // Apply different validation rules based on class count
                if (selectedClassCount > 1) {
                  // Multiple classes selected - can only select 1 subject
                  if (authController.selectedSubjectIds.length != 1) {
                    Get.snackbar(
                        "Message", "When selecting multiple classes, you can only choose exactly 1 subject",
                        snackPosition: SnackPosition.BOTTOM);
                    return;
                  }
                } else if (selectedClassCount == 1) {
                  // Single class selected - min 5, max 7 subjects
                  if (authController.selectedSubjectIds.length < 5) {
                    Get.snackbar(
                        "Message", "When selecting 1 class, you must choose at least 5 subjects",
                        snackPosition: SnackPosition.BOTTOM);
                    return;
                  }
                  if (authController.selectedSubjectIds.length > 7) {
                    Get.snackbar(
                        "Message", "When selecting 1 class, you can choose maximum 7 subjects",
                        snackPosition: SnackPosition.BOTTOM);
                    return;
                  }
                }
                
                // Validation passed - proceed with subject confirmation
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
