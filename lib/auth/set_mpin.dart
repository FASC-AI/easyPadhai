import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/otp_passcode.dart';
import 'package:easy_padhai/custom_widgets/text.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SetMPin extends StatefulWidget {
  const SetMPin({super.key});

  @override
  State<SetMPin> createState() => _SetMPinState();
}

class _SetMPinState extends State<SetMPin> {
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

  final TextEditingController _fieldOneC = TextEditingController();
  final TextEditingController _fieldTwoC = TextEditingController();
  final TextEditingController _fieldThreeC = TextEditingController();
  final TextEditingController _fieldFourC = TextEditingController();

  AuthController authController = Get.find();
  final formKey = GlobalKey<FormState>();

  final FocusNode _focusOneC = FocusNode();
  final FocusNode _focusTwoC = FocusNode();
  final FocusNode _focusThreeC = FocusNode();
  final FocusNode _focusFourC = FocusNode();

  @override
  void dispose() {
    _focusOne.dispose();
    _focusTwo.dispose();
    _focusThree.dispose();
    _focusFour.dispose();

    _focusOneC.dispose();
    _focusTwoC.dispose();
    _focusThreeC.dispose();
    _focusFourC.dispose();
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
                      Padding(
                        padding: EdgeInsets.only(
                          left: MediaQuery.of(context).size.width * .04,
                        ),
                        child: const CustomText(text: 'PIN'),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .015,
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
                        height: MediaQuery.of(context).size.height * .035,
                      ),
                      Padding(
                        padding: EdgeInsets.only(
                          left: MediaQuery.of(context).size.width * .04,
                        ),
                        child: const CustomText(text: 'Confirm PIN'),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .015,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          OtpPasscode(
                            _fieldOneC,
                            true,
                            focusNode: _focusOneC,
                          ),
                          OtpPasscode(
                            _fieldTwoC,
                            false,
                            focusNode: _focusTwoC,
                          ),
                          OtpPasscode(
                            _fieldThreeC,
                            false,
                            focusNode: _focusThreeC,
                          ),
                          OtpPasscode(
                            _fieldFourC,
                            false,
                            focusNode: _focusFourC,
                          ),
                        ],
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .025,
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
