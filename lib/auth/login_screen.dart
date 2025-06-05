import 'package:easy_padhai/auth/google_signin_helper.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  final GoogleSignInHelper _googleSignInHelper = GoogleSignInHelper();
  bool _isGoogleLoading = false;
  AuthController authController = Get.find();
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
                          SizedBox(
                            height: MediaQuery.of(context).size.height * .02,
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
                                "Sign In",
                                style: TextStyle(
                                    color: AppColors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize:
                                        MediaQuery.of(context).size.width *
                                            .06),
                              ),
                            ),
                          ),
                          SizedBox(
                            height: MediaQuery.of(context).size.height * .12,
                          ),

                          GestureDetector(
                            onTap: () async {
                              if (_isGoogleLoading)
                                return; // Prevent multiple taps

                              setState(() {
                                _isGoogleLoading = true;
                              });

                              try {
                                final User? user = await _googleSignInHelper
                                    .signInWithGoogle();
                                if (user != null) {
                                  await authController.googleSignin('google');
                                }
                              } catch (e) {
                                // Handle error if needed
                                print('Google sign in error: $e');
                              } finally {
                                if (mounted) {
                                  setState(() {
                                    _isGoogleLoading = false;
                                  });
                                }
                              }
                            },
                            child: Opacity(
                              opacity: _isGoogleLoading ? 0.7 : 1.0,
                              child: Container(
                                width: MediaQuery.of(context).size.width,
                                height:
                                    MediaQuery.of(context).size.height * .07,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(
                                    MediaQuery.of(context).size.width * .1,
                                  ),
                                  color: AppColors.white,
                                ),
                                child: _isGoogleLoading
                                    ? Center(
                                        child: SizedBox(
                                          width: MediaQuery.of(context)
                                                  .size
                                                  .width *
                                              .06,
                                          height: MediaQuery.of(context)
                                                  .size
                                                  .width *
                                              .06,
                                          child:
                                              const CircularProgressIndicator(
                                            strokeWidth: 3,
                                            valueColor:
                                                AlwaysStoppedAnimation<Color>(
                                                    AppColors.black),
                                          ),
                                        ),
                                      )
                                    : Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Image.asset(
                                            'assets/google.png',
                                            width: MediaQuery.of(context)
                                                    .size
                                                    .width *
                                                .06,
                                          ),
                                          SizedBox(
                                            width: MediaQuery.of(context)
                                                    .size
                                                    .width *
                                                .01,
                                          ),
                                          Text(
                                            'Continue with Google',
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontFamily: 'Roboto',
                                              color: AppColors.black,
                                              fontWeight: FontWeight.w600,
                                              fontSize: MediaQuery.of(context)
                                                      .size
                                                      .width *
                                                  .033,
                                            ),
                                          ),
                                        ],
                                      ),
                              ),
                            ),
                          ),
                          SizedBox(
                            height: MediaQuery.of(context).size.height * .02,
                          ),

                          GestureDetector(
                            onTap: () async {
                              Get.toNamed(RouteName.email);
                            },
                            child: Container(
                              width: MediaQuery.of(context).size.width,
                              height: MediaQuery.of(context).size.height * .07,
                              decoration: BoxDecoration(
                                  border: Border.all(color: Colors.white),
                                  borderRadius: BorderRadius.circular(
                                      MediaQuery.of(context).size.width * .1),
                                  color: Colors.transparent),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Image.asset(
                                    'assets/gmail.png',
                                    width:
                                        MediaQuery.of(context).size.width * .05,
                                  ),
                                  SizedBox(
                                    width:
                                        MediaQuery.of(context).size.width * .02,
                                  ),
                                  Text(
                                    'Continue with Email',
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                        color: AppColors.white,
                                        fontWeight: FontWeight.w600,
                                        fontSize:
                                            MediaQuery.of(context).size.width *
                                                .033),
                                  ),
                                ],
                              ),
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
