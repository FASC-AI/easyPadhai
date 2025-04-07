import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

// ignore: must_be_immutable
class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String text;
  const CustomAppBar({super.key, this.text = ''});

  @override
  Size get preferredSize => const Size.fromHeight(58);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.theme,
      systemOverlayStyle: SystemUiOverlayStyle.light,
      title: Text(
        text,
        style: TextStyle(
          color: AppColors.white,
          fontSize: MediaQuery.of(context).size.width * .05,
          fontWeight: FontWeight.w500,
        ),
      ),
      leadingWidth: MediaQuery.of(context).size.width * .09,
      leading: InkWell(
        onTap: () {
          Get.back();
        },
        child: Icon(
          Icons.arrow_back_ios_new,
          size: MediaQuery.of(context).size.width * .05,
          color: AppColors.white,
        ),
      ),
    );
  }
}
