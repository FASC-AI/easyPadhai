import 'package:easy_padhai/auth/class_view.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

// ignore: must_be_immutable
class SelectClass extends StatelessWidget {
  SelectClass({super.key});
  AuthController authController = Get.find();

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
            fontSize: MediaQuery.of(context).size.width * .045,
            fontWeight: FontWeight.bold,
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
                child: ClassView()),
          ),
          Positioned(
              left: MediaQuery.of(context).size.width * .125,
              bottom: MediaQuery.of(context).size.width * .05,
              right: MediaQuery.of(context).size.width * .125,
              child: CustomButton(
                text: 'Confirm Class',
                onTap: () async {
                  authController.selectedClassIds.isNotEmpty
                      ? {
                          await authController.getsectionList(''),
                          Get.toNamed(RouteName.sectionSelect)
                        }
                      : Get.snackbar(
                          '',
                          '',
                          snackPosition: SnackPosition.BOTTOM,
                          backgroundColor: AppColors.red,
                          titleText: const SizedBox.shrink(),
                          messageText: const Text(
                            'Please select atleast 1 class',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                            ),
                          ),
                        );
                },
              ))
        ],
      ),
    );
  }
}
