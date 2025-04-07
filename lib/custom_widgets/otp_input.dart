import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class OtpInput extends StatelessWidget {
  final TextEditingController controller;
  final bool autoFocus;
  final FocusNode? focusNode;

  const OtpInput(
    this.controller,
    this.autoFocus, {
    this.focusNode,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * .08,
      width: MediaQuery.of(context).size.width * .12,
      child: TextField(
          focusNode: focusNode,
          autofocus: autoFocus,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          controller: controller,
          maxLength: 1,
          cursorColor: Colors.white,
          style: const TextStyle(
              color: AppColors.black, fontWeight: FontWeight.bold),
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
