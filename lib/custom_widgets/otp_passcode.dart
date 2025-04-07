import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class OtpPasscode extends StatelessWidget {
  final TextEditingController controller;
  final bool autoFocus;
  final FocusNode? focusNode;

  const OtpPasscode(
    this.controller,
    this.autoFocus, {
    this.focusNode,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * .06,
      width: MediaQuery.of(context).size.width * .14,
      child: TextField(
          autofocus: autoFocus,
          focusNode: focusNode,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          controller: controller,
          maxLength: 1,
          cursorColor: Colors.white,
          style: const TextStyle(
              color: AppColors.white, fontWeight: FontWeight.bold),
          decoration: const InputDecoration(
            border: OutlineInputBorder(
              borderSide: BorderSide(color: AppColors.grey7, width: 1.0),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: AppColors.grey7, width: 1.0),
            ),
            enabledBorder: OutlineInputBorder(
              borderSide: BorderSide(color: AppColors.grey7, width: 1.0),
            ),
            disabledBorder: OutlineInputBorder(
              borderSide: BorderSide(color: AppColors.grey7, width: 1.0),
            ),
            counterText: '',
            floatingLabelBehavior: FloatingLabelBehavior.never,
            contentPadding: EdgeInsets.symmetric(vertical: 0.0),
          ),
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(1),
          ],
          onChanged: (value) {
            if (value.isNotEmpty) {
              Future.delayed(const Duration(milliseconds: 50), () {
                FocusScope.of(context).nextFocus();
              });
            } else {
              Future.delayed(const Duration(milliseconds: 50), () {
                FocusScope.of(context).previousFocus();
              });
            }
          }),
    );
  }
}
