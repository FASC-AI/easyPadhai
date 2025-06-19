import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/custom_input.dart';
import 'package:easy_padhai/custom_widgets/text.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class ForgotPinEmail extends StatefulWidget {
  const ForgotPinEmail({super.key});

  @override
  State<ForgotPinEmail> createState() => _ForgotPinEmailState();
}

class _ForgotPinEmailState extends State<ForgotPinEmail> {
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  AuthController dashController = Get.find();
  final formKey = GlobalKey<FormState>();

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
                          child: Text(
                            textAlign: TextAlign.center,
                            "Forgot Pin",
                            style: TextStyle(
                                color: AppColors.white,
                                fontWeight: FontWeight.w600,
                                fontSize:
                                    MediaQuery.of(context).size.width * .06),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .15,
                      ),

                      const CustomText(text: 'Email'),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .005,
                      ),
                      CustomInput(
                        label: 'Enter Email',
                        controller: emailController,
                        validation: (value) {
                          bool isEmail =
                              RegExp(r"^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")
                                  .hasMatch(value!);

                          if (!isEmail) {
                            return "Please enter a valid email";
                          }
                          return null;
                        },
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
                            if (formKey.currentState!.validate()) {
                              emailController.text.isNotEmpty
                                  ? {
                                      dashController.forgetEmail.value =
                                          emailController.text
                                              .toString()
                                              .trim(),
                                      Get.toNamed(RouteName.forgotPin),
                                    }
                                  : Get.snackbar(
                                      '',
                                      '',
                                      snackPosition: SnackPosition.BOTTOM,
                                      backgroundColor: AppColors.red,
                                      titleText: const SizedBox.shrink(),
                                      messageText: const Text(
                                        'Enter email Id',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 16,
                                        ),
                                      ),
                                    );
                            }
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

void showCustomPopup(BuildContext context) {
  showDialog(
    context: context,
    barrierDismissible: true,
    builder: (context) {
      final screenSize = MediaQuery.of(context).size;
      final popupWidth = screenSize.width * 0.9;
      final popupHeight = screenSize.height * 0.425;

      return Dialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: SizedBox(
          width: popupWidth,
          height: popupHeight,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Align(
                alignment: Alignment.topLeft,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
              SizedBox(
                width: MediaQuery.of(context).size.width * .3,
                height: MediaQuery.of(context).size.height * .15,
                child: Image.asset('assets/warning.png'),
              ),
              Padding(
                padding: EdgeInsets.symmetric(
                    vertical: MediaQuery.of(context).size.height * .02,
                    horizontal: MediaQuery.of(context).size.width * .05),
                child: Text(
                  "New here? This email isn’t registered yet.\nJoin us faster with Google!",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: MediaQuery.of(context).size.width * .035,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.symmetric(
                    vertical: MediaQuery.of(context).size.height * .01,
                    horizontal: MediaQuery.of(context).size.width * .05),
                child: GestureDetector(
                  onTap: () async {
                    Get.toNamed(RouteName.setMPin);
                  },
                  child: Container(
                    width: MediaQuery.of(context).size.width,
                    height: MediaQuery.of(context).size.height * .06,
                    decoration: BoxDecoration(
                        border: Border.all(color: AppColors.greyLite),
                        borderRadius: BorderRadius.circular(
                            MediaQuery.of(context).size.width * .1),
                        color: AppColors.white),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.asset(
                          'assets/google.png',
                          width: MediaQuery.of(context).size.width * .05,
                        ),
                        SizedBox(
                          width: MediaQuery.of(context).size.width * .01,
                        ),
                        Text(
                          'Continue with Google',
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                              color: AppColors.black,
                              fontWeight: FontWeight.w600,
                              fontSize:
                                  MediaQuery.of(context).size.width * .035),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              SizedBox(height: MediaQuery.of(context).size.height * .025),
            ],
          ),
        ),
      );
    },
  );
}
