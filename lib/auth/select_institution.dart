import 'package:easy_padhai/auth/popups/institutes_popup.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/custom_input2.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class SelectInstitution extends StatefulWidget {
  const SelectInstitution({super.key});

  @override
  State<SelectInstitution> createState() => _SelectInstitutionState();
}

class _SelectInstitutionState extends State<SelectInstitution> {
  TextEditingController instituteController = TextEditingController();
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
            width: MediaQuery.of(context).size.width * .065,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        titleSpacing: 0,
        title: Text(
          'Select Your Institute',
          style: TextStyle(
            color: AppColors.white,
            fontSize: MediaQuery.of(context).size.width * .045,
            fontWeight: FontWeight.w600,
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
            child: GestureDetector(
              onTap: () async {
                await authController.getInstitutes();
                bool? result = await showDialog(
                  // ignore: use_build_context_synchronously
                  context: context,
                  builder: (BuildContext context) {
                    return const InstitutesPopup();
                  },
                  barrierDismissible: true,
                );
                if (result == true) {
                  setState(() {
                    instituteController.text =
                        authController.instituteName.value.toString();
                  });
                }
              },
              child: CustomInput2(
                label: 'Select Your Institution',
                enable: false,
                controller: instituteController,
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
          ),
          Padding(
            padding: EdgeInsets.only(
              left: MediaQuery.of(context).size.width * .03,
              right: MediaQuery.of(context).size.width * .03,
            ),
            child: CustomButton(
              text: 'Confirm Institution',
              onTap: () async {
                await authController.postUpdateAuthInfo('institute');
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
                    fontWeight: FontWeight.w600,
                    fontSize: MediaQuery.of(context).size.width * .032),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
