import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

class CustomButton2 extends StatelessWidget {
  final String text;
  final Function()? onTap;
  CustomButton2({super.key, this.text = '', this.onTap});
  final DashboardController authController = Get.find();

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => InkWell(
        onTap: onTap,
        child: Container(
          width: authController.isLoading.isTrue
              ? 80
              : MediaQuery.of(context).size.width,
          // height: authController.isLoading.isFalse ? 45 : 55,
          height: MediaQuery.of(context).size.height * .06,
          decoration: BoxDecoration(
              borderRadius:
                  BorderRadius.circular(MediaQuery.of(context).size.width * .1),
              color: authController.isLoading.isFalse
                  ? AppColors.blueButton
                  : null),
          child: Center(
            child: authController.isLoading.isTrue
                ? Lottie.asset(
                    'assets/loading.json',
                    width: MediaQuery.of(context).size.width,
                    height: MediaQuery.of(context).size.height,
                    repeat: true,
                    animate: true,
                    reverse: false,
                  )
                : Text(
                    text,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        color: AppColors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: MediaQuery.of(context).size.width * .032),
                  ),
          ),
        ),
      ),
    );
  }
}
