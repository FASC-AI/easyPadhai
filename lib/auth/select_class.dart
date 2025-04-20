import 'package:easy_padhai/auth/class_view.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class SelectClass extends StatelessWidget {
  const SelectClass({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgColor,
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        automaticallyImplyLeading: false,
        title: Text(
          'Select Your Class',
          style: TextStyle(
            color: AppColors.white,
            fontSize: MediaQuery.of(context).size.width * .04,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Padding(
                padding:
                    EdgeInsets.all(MediaQuery.of(context).size.width * .03),
                child: const ClassView()),
          ),
          Positioned(
              left: MediaQuery.of(context).size.width * .125,
              bottom: MediaQuery.of(context).size.width * .05,
              right: MediaQuery.of(context).size.width * .125,
              child: CustomButton(
                text: 'Confirm Class',
                onTap: () {
                  Get.toNamed(RouteName.sectionSelect);
                },
              ))
        ],
      ),
    );
  }
}
