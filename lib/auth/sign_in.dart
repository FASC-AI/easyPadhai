import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/custom_input.dart';
import 'package:easy_padhai/custom_widgets/text.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class Email extends StatefulWidget {
  const Email({super.key});

  @override
  State<Email> createState() => _EmailState();
}

class _EmailState extends State<Email> {
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  AuthController authController = Get.find();
  final formKey = GlobalKey<FormState>();

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
                            "Sign In",
                            style: TextStyle(
                                color: AppColors.white,
                                fontWeight: FontWeight.bold,
                                fontSize:
                                    MediaQuery.of(context).size.width * .06),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .1,
                      ),
                      // const CustomText(text: 'Institutions'),
                      // SizedBox(
                      //   height: MediaQuery.of(context).size.height * .005,
                      // ),
                      // CustomInput(
                      //   label: 'Select Institution',
                      //   controller: emailController,
                      //   enable: false,
                      //   customSuffixIcon: Icons.keyboard_arrow_down_rounded,
                      // ),
                      // SizedBox(
                      //   height: MediaQuery.of(context).size.height * .025,
                      // ),
                      const CustomText(text: 'Email'),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .005,
                      ),
                      CustomInput(
                        label: 'Enter Email',
                        controller: emailController,
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .025,
                      ),
                      // Text('Password',
                      //     overflow: TextOverflow.ellipsis,
                      //     style: TextStyle(
                      //         color: AppColors.white,
                      //         fontWeight: FontWeight.normal,
                      //         fontSize:
                      //             MediaQuery.of(context).size.width * .03)),
                      // SizedBox(
                      //   height: MediaQuery.of(context).size.height * .005,
                      // ),
                      // CustomInput(
                      //   label: 'Enter Password',
                      //   isPassword: true,
                      //   controller: passwordController,
                      // ),
                      // SizedBox(
                      //   height: MediaQuery.of(context).size.height * .02,
                      // ),
                      // GestureDetector(
                      //   onTap: () {
                      //     Get.toNamed(RouteName.login);
                      //   },
                      //   child: Row(
                      //     mainAxisAlignment: MainAxisAlignment.end,
                      //     children: [
                      //       const CustomText(
                      //         text: 'Already a user?',
                      //         isw500: true,
                      //       ),
                      //       SizedBox(
                      //         width:
                      //             MediaQuery.of(context).size.width * .01,
                      //       ),
                      //       const CustomText(text: 'Sign in', isw500: true),
                      //     ],
                      //   ),
                      // ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .025,
                      ),
                      Center(
                        child: CustomButton(
                          text: 'Continue',
                          onTap: () async {
                            Get.toNamed(RouteName.verifyMpin);
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
