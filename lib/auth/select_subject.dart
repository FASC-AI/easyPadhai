import 'package:easy_padhai/auth/subject_view.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class SelectSubject extends StatelessWidget {
  const SelectSubject({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgColor,
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        title: Text(
          'Select Your Subject',
          style: TextStyle(
            color: AppColors.white,
            fontSize: MediaQuery.of(context).size.width * .04,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Padding(
                  padding:
                      EdgeInsets.all(MediaQuery.of(context).size.width * .03),
                  child: const SubjectView()),
            ),
          ),
          Padding(
              padding: EdgeInsets.only(
                  left: MediaQuery.of(context).size.width * .025,
                  bottom: MediaQuery.of(context).size.width * .025,
                  right: MediaQuery.of(context).size.width * .025),
              child: CustomButton(
                text: 'Confirm Subject',
              ))
        ],
      ),
    );
  }
}
