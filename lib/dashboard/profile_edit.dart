import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ProfileEdit extends StatelessWidget {
  const ProfileEdit({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;

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
                top: height * 0.1,
                left: (width - (width * 0.05)) / 2,
                child: Container(decoration: BoxDecoration( ), child: Icon(Icons.edit))),
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
                    _buildLabel('Full name', width),
                    _buildTextField(hint: 'Abhishek Kumar Jha'),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Class', width),
                    _buildClassChips(width),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Institutions', width),
                    _buildDropdown(width),
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
                    _buildLabel('Phone', width),
                    _buildTextField(hint: '+91-8882130397'),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Email', width),
                    _buildTextField(hint: 'abhishek.kj@gmail.com'),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Address', width),
                    _buildTextField(hint: 'C-1/502, Phase-4, Aya Nagar,'),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Address 2', width),
                    _buildTextField(hint: ''),
                    SizedBox(height: height * 0.015),
                    _buildLabel('State', width),
                    _buildTextField(hint: 'Haryana'),
                    SizedBox(height: height * 0.015),
                    _buildLabel('District', width),
                    _buildTextField(hint: 'Gurugram'),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Pin Code', width),
                    _buildTextField(hint: '110047'),
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

  Widget _buildLabel(String text, double width) {
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

  Widget _buildTextField({required String hint}) {
    return TextFormField(
      initialValue: hint,
      decoration: InputDecoration(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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

  Widget _buildDropdown(double width) {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
          borderSide: const BorderSide(color: Colors.blue),
        ),
      ),
      items: ['Institution 1', 'Institution 2']
          .map((e) => DropdownMenuItem(value: e, child: Text(e)))
          .toList(),
      onChanged: (value) {},
    );
  }
}
