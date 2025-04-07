import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
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
                Column(
                  children: [
                    Padding(
                      padding: EdgeInsets.only(
                          top: MediaQuery.of(context).size.height * .1,
                          left: MediaQuery.of(context).size.width * .08,
                          right: MediaQuery.of(context).size.width * .08),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: Image.asset(
                              'assets/logo.png',
                              width: MediaQuery.of(context).size.width * .3,
                              fit: BoxFit.contain,
                            ),
                          ),

                          // const CustomText(text: 'Email'),
                          // SizedBox(
                          //   height: MediaQuery.of(context).size.height * .01,
                          // ),
                          // CustomInput(
                          //   label: 'Enter Email',
                          //   controller: emailController,
                          // ),
                          // SizedBox(
                          //   height: MediaQuery.of(context).size.height * .025,
                          // ),
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
                          //   height: MediaQuery.of(context).size.height * .025,
                          // ),
                          // Row(
                          //   mainAxisAlignment: MainAxisAlignment.end,
                          //   children: [
                          //     GestureDetector(
                          //       onTap: () {
                          //         Get.toNamed(RouteName.forgotPassword);
                          //       },
                          //       child: const CustomText(
                          //         text: 'Forgot Password?',
                          //         isw500: true,
                          //       ),
                          //     ),
                          //     SizedBox(
                          //       width: MediaQuery.of(context).size.width * .05,
                          //     ),
                          //     GestureDetector(
                          //         onTap: () {
                          //           Get.toNamed(RouteName.signUp);
                          //         },
                          //         child: const CustomText(
                          //             text: 'Sign up?', isw500: true)),
                          //   ],
                          // ),
                          SizedBox(
                            height: MediaQuery.of(context).size.height * .25,
                          ),

                          GestureDetector(
                            onTap: () async {
                              Get.toNamed(RouteName.setMPin);
                            },
                            child: Container(
                              width: MediaQuery.of(context).size.width,
                              height: MediaQuery.of(context).size.height * .06,
                              decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(
                                      MediaQuery.of(context).size.width * .1),
                                  color: AppColors.white),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Image.asset(
                                    'assets/google.png',
                                    width:
                                        MediaQuery.of(context).size.width * .05,
                                  ),
                                  SizedBox(
                                    width:
                                        MediaQuery.of(context).size.width * .01,
                                  ),
                                  Text(
                                    'Continue with Google',
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                        color: AppColors.black,
                                        fontWeight: FontWeight.w500,
                                        fontSize:
                                            MediaQuery.of(context).size.width *
                                                .03),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            height: MediaQuery.of(context).size.height * .02,
                          ),
                          Center(
                            child: CustomButton(
                              text: 'Login with Email',
                              onTap: () async {
                                Get.toNamed(RouteName.email);
                              },
                            ),
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
                          //             fontSize:
                          //                 MediaQuery.of(context).size.width *
                          //                     .035)),
                          //     SizedBox(
                          //       width: MediaQuery.of(context).size.width * .35,
                          //       child: const Divider(
                          //         height: 10,
                          //         color: AppColors.backGroundColor,
                          //       ),
                          //     ),
                          //   ],
                          // ),

                          SizedBox(
                            height: MediaQuery.of(context).size.height * .03,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
