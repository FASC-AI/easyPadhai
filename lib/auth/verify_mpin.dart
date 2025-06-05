import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/otp_passcode.dart';
import 'package:easy_padhai/custom_widgets/text.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class VerifyMpin extends StatefulWidget {
  const VerifyMpin({super.key});

  @override
  State<VerifyMpin> createState() => _VerifyMPinState();
}

class _VerifyMPinState extends State<VerifyMpin> {
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  AuthController authController = Get.find();
  final formKey = GlobalKey<FormState>();
  final FocusNode lastPinNode = FocusNode();
  String mPin = "";

  void handleOtpSubmit(String otp) {
    mPin = otp;
  }

  @override
  void dispose() {
    lastPinNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
          preferredSize: const Size.fromHeight(0.0),
          child: AppBar(
            backgroundColor: AppColors.theme,
            systemOverlayStyle: SystemUiOverlayStyle.light,
          )),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Form(
            key: formKey,
            child: Stack(
              children: [
                SizedBox(
                  width: MediaQuery.of(context).size.width,
                  height: MediaQuery.of(context).size.height,
                  child: Image.asset(
                    'assets/bg.png',
                    fit: BoxFit.fill,
                  ),
                ),
                Padding(
                  padding: EdgeInsets.only(
                      top: MediaQuery.of(context).size.width * .04,
                      left: MediaQuery.of(context).size.width * .08,
                      right: MediaQuery.of(context).size.width * .08),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // GestureDetector(
                      //   onTap: () {
                      //     Get.back();
                      //   },
                      //   child: Row(
                      //     children: [
                      //       Image.asset(
                      //         'assets/back.png',
                      //         fit: BoxFit.fill,
                      //         width: MediaQuery.of(context).size.width * .065,
                      //       ),
                      //       SizedBox(
                      //         width: MediaQuery.of(context).size.width * .02,
                      //       ),
                      //       Text(
                      //         "Back",
                      //         style: TextStyle(
                      //             color: AppColors.white,
                      //             fontSize:
                      //                 MediaQuery.of(context).size.width * .035),
                      //       ),
                      //     ],
                      //   ),
                      // ),
                      SizedBox(
                        height: MediaQuery.of(context).size.width * .1,
                      ),
                      Center(
                        child: Image.asset(
                          'assets/logo.png',
                          width: MediaQuery.of(context).size.width * .2,
                          fit: BoxFit.contain,
                        ),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .02,
                      ),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * .8,
                        child: Center(
                          child: Obx(
                            () => Text(
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                              "Hi, ${authController.userName.isNotEmpty ? authController.userName : userName()}",
                              style: TextStyle(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize:
                                      MediaQuery.of(context).size.width * .06),
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .05,
                      ),
                      const Center(
                        child: CustomText(text: 'Enter your PIN to continue'),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .025,
                      ),
                      OtpPasscode(
                        onCompleted: handleOtpSubmit,
                        digits: 4,
                        lastFocusNode: lastPinNode,
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .02,
                      ),
                      GestureDetector(
                          onTap: () {
                            Get.toNamed(RouteName.forgotPinEmail);
                          },
                          child: SizedBox(
                            width: MediaQuery.of(context).size.width * .85,
                            child: Text(
                              "Forgot PIN?",
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.end,
                              style: TextStyle(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.w600,
                                  fontSize:
                                      MediaQuery.of(context).size.width * .032),
                            ),
                          )),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .02,
                      ),
                      Center(
                        child: CustomButton(
                          text: 'Continue',
                          onTap: () async {
                            await authController.postSetVerifymPin(mPin);
                          },
                        ),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .03,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
