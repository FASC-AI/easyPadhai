import 'package:easy_padhai/auth/section_view.dart';
import 'package:easy_padhai/auth/subject_view.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class SelectSection extends StatelessWidget {
  const SelectSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgColor,
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        leading: IconButton(
          icon: Image.asset(
            'assets/back.png',
            fit: BoxFit.fill,
            width: MediaQuery.of(context).size.width * .06,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text(
          'Select Your Section',
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
                child: const SectionView()),
          ),
          Positioned(
            left: MediaQuery.of(context).size.width * .125,
            bottom: MediaQuery.of(context).size.width * .05,
            right: MediaQuery.of(context).size.width * .125,
            child: CustomButton(
              text: 'Confirm Section',
              onTap: () {
                Get.toNamed(RouteName.subjectSelect);
              },
            ),
          )
        ],
      ),
    );
  }
}
