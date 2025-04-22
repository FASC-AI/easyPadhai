import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/otp_passcode.dart';
import 'package:easy_padhai/custom_widgets/text.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SetMPin extends StatefulWidget {
  const SetMPin({super.key});

  @override
  State<SetMPin> createState() => _SetMPinState();
}

class _SetMPinState extends State<SetMPin> {
  AuthController authController = Get.find();
  final formKey = GlobalKey<FormState>();

  String firstPin = "";
  String confirmPin = "";

  final FocusNode _lastFirstPinNode = FocusNode();
  final FocusNode _firstConfirmPinNode = FocusNode();
  final FocusNode _lastConfirmPinNode = FocusNode();

  void handleFirstPinSubmit(String pin) {
    setState(() {
      firstPin = pin;
    });
    _firstConfirmPinNode.requestFocus();
  }

  void handleConfirmPinSubmit(String pin) {
    setState(() {
      confirmPin = pin;
    });
    FocusManager.instance.primaryFocus?.unfocus();

    if (firstPin == confirmPin) {
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("PINs don't match. Please try again.")));
    }
  }

  @override
  void dispose() {
    _lastFirstPinNode.dispose();
    _firstConfirmPinNode.dispose();
    _lastConfirmPinNode.dispose();
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
                              width: MediaQuery.of(context).size.width * .065,
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
                            overflow: TextOverflow.ellipsis,
                            "Hi, ${authController.userName}",
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
                          left: MediaQuery.of(context).size.width * .025,
                        ),
                        child: const CustomText(text: 'PIN'),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .01,
                      ),
                      OtpPasscode(
                        onCompleted: handleFirstPinSubmit,
                        digits: 4,
                        lastFocusNode: _lastFirstPinNode,
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .035,
                      ),
                      Padding(
                        padding: EdgeInsets.only(
                          left: MediaQuery.of(context).size.width * .025,
                        ),
                        child: const CustomText(text: 'Confirm PIN'),
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .01,
                      ),
                      OtpPasscode(
                        onCompleted: handleConfirmPinSubmit,
                        digits: 4,
                        firstFocusNode: _firstConfirmPinNode,
                        lastFocusNode: _lastConfirmPinNode,
                        autoFocusFirst: false,
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height * .05,
                      ),
                      Center(
                        child: CustomButton(
                          text: 'Continue',
                          onTap: () async {
                            if (firstPin.isNotEmpty && firstPin == confirmPin) {
                              await authController.postSetVerifymPin(firstPin);
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                      content:
                                          Text("Please enter matching PINs")));
                            }
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
