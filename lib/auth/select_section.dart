import 'package:easy_padhai/auth/section_view.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

// ignore: must_be_immutable
class SelectSection extends StatelessWidget {
  SelectSection({super.key});
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
            fit: BoxFit.contain,
            width: MediaQuery.of(context).size.width * .07,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        titleSpacing: 0,
        title: Text(
          'Select Your Section',
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
            child: SectionView(),
          ),
          Positioned(
            left: MediaQuery.of(context).size.width * .125,
            bottom: MediaQuery.of(context).size.width * .05,
            right: MediaQuery.of(context).size.width * .125,
            child: CustomButton(
              text: 'Confirm Section',
              onTap: () async {
                authController.selectedSectionIds.isNotEmpty
                    ? {
                        await authController.getsubjectList(''),
                        await authController.postUpdateAuthInfo('section')
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
          ),
        ],
      ),
    );
  }
}
