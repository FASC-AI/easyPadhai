import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/otp_passcode.dart';
import 'package:easy_padhai/custom_widgets/text.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class VerifyMpin extends StatefulWidget {
  const VerifyMpin({super.key});

  @override
  State<VerifyMpin> createState() => _VerifyMPinState();
}

class _VerifyMPinState extends State<VerifyMpin> {
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  final FocusNode _focusOne = FocusNode();
  final FocusNode _focusTwo = FocusNode();
  final FocusNode _focusThree = FocusNode();
  final FocusNode _focusFour = FocusNode();

  final TextEditingController _fieldOne = TextEditingController();
  final TextEditingController _fieldTwo = TextEditingController();
  final TextEditingController _fieldThree = TextEditingController();
  final TextEditingController _fieldFour = TextEditingController();

  AuthController authController = Get.find();
  final formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _focusOne.dispose();
    _focusTwo.dispose();
    _focusThree.dispose();
    _focusFour.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                      GestureDetector(
                        onTap: () {
                          Get.back();
                        },
                        child: Row(
                          children: [
                            Image.asset(
                              'assets/back.png',
                              fit: BoxFit.fill,
                              width: MediaQuery.of(context).size.width * .06,
                            ),
                            SizedBox(
                              width: MediaQuery.of(context).size.width * .02,
                            ),
                            Text(
                              "Back",
                              style: TextStyle(
                                  color: AppColors.white,
                                  fontSize:
                                      MediaQuery.of(context).size.width * .035),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.width * .1,
                      ),
                      Center(
                        child: Image.asset(
                          'assets/logo.png',
                          width: MediaQuery.of(context).size.width * .3,
                          fit: BoxFit.contain,
                        ),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .02,
                      ),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * .8,
                        child: Center(
                          child: Text(
                            textAlign: TextAlign.center,
                            "Hi, Abhishek Kumar!",
                            style: TextStyle(
                                color: AppColors.white,
                                fontWeight: FontWeight.bold,
                                fontSize:
                                    MediaQuery.of(context).size.width * .06),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .05,
                      ),

                      const CustomText(text: 'PIN'),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .035,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          OtpPasscode(_fieldOne, true, focusNode: _focusOne),
                          OtpPasscode(_fieldTwo, false, focusNode: _focusTwo),
                          OtpPasscode(_fieldThree, false,
                              focusNode: _focusThree),
                          OtpPasscode(_fieldFour, false, focusNode: _focusFour),
                        ],
                      ),

                      SizedBox(
                        height: MediaQuery.of(context).size.height * .025,
                      ),
                      Center(
                        child: CustomButton(
                          text: 'Continue',
                          onTap: () async {
                            Get.toNamed(RouteName.login);
                          },
                        ),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .03,
                      ),
                      // Row(
                      //   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      //   children: [
                      //     SizedBox(
                      //       width: MediaQuery.of(context).size.width * .35,
                      //       child: const Divider(
                      //         height: 10,
                      //         color: AppColors.backGroundColor,
                      //       ),
                      //     ),
                      //     Text('Or',
                      //         overflow: TextOverflow.ellipsis,
                      //         style: TextStyle(
                      //             color: AppColors.blue2,
                      //             fontWeight: FontWeight.w500,
                      //             fontSize: MediaQuery.of(context).size.width *
                      //                 .035)),
                      //     SizedBox(
                      //       width: MediaQuery.of(context).size.width * .35,
                      //       child: const Divider(
                      //         height: 10,
                      //         color: AppColors.backGroundColor,
                      //       ),
                      //     ),
                      //   ],
                      // ),
                      // SizedBox(
                      //   height: MediaQuery.of(context).size.height * .03,
                      // ),
                      // Container(
                      //   width: MediaQuery.of(context).size.width,
                      //   height: 45,
                      //   decoration: BoxDecoration(
                      //       borderRadius: BorderRadius.circular(
                      //           MediaQuery.of(context).size.width * .1),
                      //       color: AppColors.white),
                      //   child: Row(
                      //     mainAxisAlignment: MainAxisAlignment.center,
                      //     children: [
                      //       Image.asset(
                      //         'assets/google.png',
                      //         width: MediaQuery.of(context).size.width * .05,
                      //       ),
                      //       SizedBox(
                      //         width: MediaQuery.of(context).size.width * .01,
                      //       ),
                      //       Text(
                      //         'Continue with Google',
                      //         overflow: TextOverflow.ellipsis,
                      //         style: TextStyle(
                      //             color: AppColors.black,
                      //             fontWeight: FontWeight.w500,
                      //             fontSize:
                      //                 MediaQuery.of(context).size.width * .03),
                      //       ),
                      //     ],
                      //   ),
                      // ),
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
