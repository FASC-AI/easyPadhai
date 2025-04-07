import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';


class CustomMasterList extends StatelessWidget {
  final String title;
  final String icon;
  final String text;

  final Function()? onTap;
  CustomMasterList(
      {super.key, this.title = '', this.icon = '', this.text = '', this.onTap});
  final AuthController authController = Get.find();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).size.height * .018),
          child: Text(
            title,
            style: TextStyle(
                fontSize: MediaQuery.of(context).size.width * .032,
                color: AppColors.black,
                fontWeight: FontWeight.w500),
          ),
        ),
        Container(
          padding: EdgeInsets.all(MediaQuery.of(context).size.width * .022),
          decoration: BoxDecoration(
              border: Border.all(color: AppColors.grey7, width: 1)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  SvgPicture.asset(
                    icon,
                    width: MediaQuery.of(context).size.width * .03,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * .05,
                  ),
                  Text(
                    text,
                    style: TextStyle(
                        fontSize: MediaQuery.of(context).size.width * .03,
                        color: AppColors.grey4,
                        fontWeight: FontWeight.normal),
                  ),
                ],
              ),
              const Icon(
                Icons.keyboard_arrow_down_rounded,
                color: AppColors.blue,
              )
            ],
          ),
        ),
      ],
    );
  }
}
