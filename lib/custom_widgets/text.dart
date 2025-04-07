import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';

class CustomText extends StatelessWidget {
  final String text;
  final bool isw500;
  const CustomText({super.key, this.text = '', this.isw500 = false});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      overflow: TextOverflow.ellipsis,
      style: TextStyle(
          color:  AppColors.white,
          fontWeight: isw500 ? FontWeight.w500 : FontWeight.normal,
          fontSize: MediaQuery.of(context).size.width * .03),
    );
  }
}
