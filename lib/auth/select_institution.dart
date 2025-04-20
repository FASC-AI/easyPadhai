import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/custom_input.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class SelectInstitution extends StatelessWidget {
  const SelectInstitution({super.key});

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
          'Select Your Institute',
          style: TextStyle(
            color: AppColors.white,
            fontSize: MediaQuery.of(context).size.width * .04,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: MediaQuery.of(context).size.width * .035,
              vertical: MediaQuery.of(context).size.height * .025,
            ),
            child: CustomInput(
              label: 'Select Your Institution',
              enable: false,
              validation: (value) {
                if (value!.isEmpty) {
                  return 'Vehicle is required';
                }
                return null;
              },
              inputType: TextInputType.text,
              customSuffixIcon: Icons.keyboard_arrow_down,
              wholeBackground: AppColors.white,
              isPrefix: false,
            ),
          ),
          Padding(
            padding: EdgeInsets.only(
              left: MediaQuery.of(context).size.width * .03,
              right: MediaQuery.of(context).size.width * .03,
            ),
            child: CustomButton(
              text: 'Confirm Institution',
              onTap: () {
                Get.offAllNamed(RouteName.teacherHome);
              },
            ),
          ),
          GestureDetector(
            onTap: () {
              Get.toNamed(RouteName.registerInstitution);
            },
            child: Padding(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).size.height * .015,
              ),
              child: Text(
                "Can’t Find Your Institution? Request Here",
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.end,
                style: TextStyle(
                    color: AppColors.theme,
                    fontWeight: FontWeight.normal,
                    fontSize: MediaQuery.of(context).size.width * .03),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
