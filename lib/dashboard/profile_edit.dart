import 'package:easy_padhai/auth/popups/institutes_popup2.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/custom_widgets/custom_input2.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProfileEdit extends StatefulWidget {
  const ProfileEdit({super.key});

  @override
  State<ProfileEdit> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<ProfileEdit> {
  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;
    TextEditingController instituteController = TextEditingController();
    DashboardController dashboardController = Get.find();

    return Scaffold(
        backgroundColor: Colors.white,
        appBar: const CustomAppBar(
          text: 'Edit Profile',
        ),
        body: Stack(
          children: [
            Column(
              children: [
                Container(
                  height: height * 0.09,
                  color: AppColors.theme,
                ),
                Expanded(
                  child: Container(
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            Positioned(
              top: height * 0.015,
              left: (width - (width * 0.24)) / 2,
              child: CircleAvatar(
                radius: width * 0.12,
                backgroundImage: const AssetImage('assets/pic.png'),
              ),
            ),
            Positioned(
                top: height * 0.085,
                left: (width - (width * 0.18)) / 1.5,
                child: Container(
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(50),
                        border: Border.all(color: Colors.white)),
                    child: Padding(
                      padding: EdgeInsets.all(
                          MediaQuery.of(context).size.width * .01),
                      child: const Icon(
                        Icons.edit_outlined,
                        color: AppColors.theme,
                      ),
                    ))),
            Positioned.fill(
              top: height * 0.135,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.symmetric(horizontal: width * 0.05),
                child: Column(
                  children: [
                    SizedBox(height: height * 0.03),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Personal Info',
                        style: TextStyle(
                          fontSize: width * 0.045,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    SizedBox(height: height * 0.02),
                    _buildLabel('Full name', width, context: context),
                    _buildTextField(
                        hint: 'Abhishek Kumar Jha', context: context),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Class', width, context: context),
                    _buildClassChips(width),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Instituton', width, context: context),
                    GestureDetector(
                      onTap: () async {
                        await dashboardController.getInstitutes();
                        bool? result = await showDialog(
                          // ignore: use_build_context_synchronously
                          context: context,
                          builder: (BuildContext context) {
                            return const InstitutesPopup2();
                          },
                          barrierDismissible: true,
                        );
                        if (result == true) {
                          setState(() {
                            instituteController.text = dashboardController
                                .instituteName.value
                                .toString();
                          });
                        }
                      },
                      child: CustomInput2(
                        label: 'Select Your Institution',
                        enable: false,
                        controller: instituteController,
                        validation: (value) {
                          if (value!.isEmpty) {
                            return 'Institution is required';
                          }
                          return null;
                        },
                        inputType: TextInputType.text,
                        customSuffixIcon: Icons.keyboard_arrow_down,
                        wholeBackground: AppColors.white,
                        isPrefix: false,
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.only(top: width * .02),
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: Text(
                          'Change Your Institution',
                          style: TextStyle(
                            color: AppColors.theme,
                            fontWeight: FontWeight.w600,
                            fontSize: width * 0.032,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: height * 0.015),
                    _buildLabel(
                      'Phone',
                      width,
                      context: context,
                    ),
                    _buildTextField(
                        hint: '+91-8882130397',
                        context: context,
                        isPin: true,
                        maxNum: 10),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Email', width, context: context),
                    _buildTextField(
                        hint: 'abhishek.kj@gmail.com', context: context),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Address', width, context: context),
                    _buildTextField(
                        hint: 'C-1/502, Phase-4, Aya Nagar,', context: context),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Address 2', width, context: context),
                    _buildTextField(hint: '', context: context),
                    SizedBox(height: height * 0.015),
                    _buildLabel('State', width, context: context),
                    _buildTextField(hint: 'Haryana', context: context),
                    SizedBox(height: height * 0.015),
                    _buildLabel('District', width, context: context),
                    _buildTextField(hint: 'Gurugram', context: context),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Pin Code', width, context: context),
                    _buildTextField(
                        hint: '110047',
                        context: context,
                        isPin: true,
                        maxNum: 6),
                    SizedBox(height: height * 0.12),
                  ],
                ),
              ),
            ),
          ],
        ),
        bottomNavigationBar: Padding(
          padding: EdgeInsets.symmetric(
              horizontal: width * 0.05, vertical: height * 0.01),
          child: CustomButton(
            text: 'Update',
          ),
        ));
  }

  Widget _buildLabel(String text, double width,
      {required BuildContext context}) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 5),
        child: Text(
          text,
          style: TextStyle(
            fontSize: width * 0.035,
            color: Colors.grey[700],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
      {required String hint,
      required BuildContext context,
      bool? isPin,
      int? maxNum}) {
    return TextFormField(
      initialValue: hint,
      keyboardType: isPin == true ? TextInputType.number : null,
      maxLength: isPin == true ? maxNum : null,
      decoration: InputDecoration(
        contentPadding: EdgeInsets.symmetric(
            horizontal: MediaQuery.of(context).size.width * .035,
            vertical: MediaQuery.of(context).size.width * .02),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.grey),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.grey),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.theme),
        ),
      ),
    );
  }

  Widget _buildClassChips(double width) {
    final classes = ['XI', 'XII', 'X', 'IX'];
    return Wrap(
      spacing: width * 0.025,
      children: classes
          .map((c) => Chip(
                label: Text(c),
                deleteIcon: Icon(Icons.close, size: width * 0.035),
                onDeleted: () {},
              ))
          .toList(),
    );
  }
}
