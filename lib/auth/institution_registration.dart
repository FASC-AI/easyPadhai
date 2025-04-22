import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_button.dart';
import 'package:easy_padhai/route/route_name.dart';

class InstitutionRegistration extends StatefulWidget {
  const InstitutionRegistration({super.key});

  @override
  State<InstitutionRegistration> createState() =>
      _InstitutionRegistrationState();
}

class _InstitutionRegistrationState extends State<InstitutionRegistration> {
  String? _institutionType = "School";
  String? selectedState;
  String? selectedDistrict;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: AppColors.bgColor,
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        leadingWidth: MediaQuery.of(context).size.width * .13,
        leading: IconButton(
          padding: EdgeInsets.zero,
          icon: Image.asset(
            'assets/back.png',
            fit: BoxFit.fill,
            width: width * 0.07,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        titleSpacing: 0,
        title: Text(
          'Institution Registration Request',
          style: TextStyle(
            color: AppColors.white,
            fontSize: width * 0.045,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: width * 0.04),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: height * 0.02),
            Text(
              "Institution Info",
              style: TextStyle(
                fontSize: width * 0.045,
                fontWeight: FontWeight.bold,
                color: AppColors.black,
              ),
            ),
            SizedBox(height: height * 0.02),
            _buildLabel("Institution name", width),
            _buildTextField(""),
            SizedBox(height: height * 0.02),
            _buildLabel("Type", width),
            Row(
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Radio<String>(
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      visualDensity: VisualDensity.compact,
                      value: "School",
                      groupValue: _institutionType,
                      onChanged: (value) {
                        setState(() => _institutionType = value);
                      },
                    ),
                    Text("School", style: TextStyle(fontSize: width * 0.04)),
                  ],
                ),
                const SizedBox(width: 20),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Radio<String>(
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      visualDensity: VisualDensity.compact,
                      value: "Coaching",
                      groupValue: _institutionType,
                      onChanged: (value) {
                        setState(() => _institutionType = value);
                      },
                    ),
                    Text("Coaching", style: TextStyle(fontSize: width * 0.04)),
                  ],
                ),
              ],
            ),
            SizedBox(height: height * 0.02),
            _buildLabel("Address 1", width),
            _buildTextField(""),
            SizedBox(height: height * 0.02),
            _buildLabel("Address 2", width),
            _buildTextField(""),
            SizedBox(height: height * 0.02),
            _buildLabel("State", width),
            _buildDropdown(selectedState, (value) {
              setState(() => selectedState = value);
            }),
            SizedBox(height: height * 0.02),
            _buildLabel("District", width),
            _buildDropdown(selectedDistrict, (value) {
              setState(() => selectedDistrict = value);
            }),
            SizedBox(height: height * 0.02),
            _buildLabel("Pincode", width),
            _buildTextField("", inputType: TextInputType.number),
            SizedBox(height: height * 0.12),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: EdgeInsets.all(width * 0.04),
        child: CustomButton(
          text: 'Submit',
          onTap: () {
            Get.lazyPut(() => DashboardController());
            Get.offAllNamed(RouteName.teacherHome);
          },
        ),
      ),
    );
  }

  Widget _buildLabel(String text, double width) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Text(
        text,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          color: AppColors.grey,
          fontWeight: FontWeight.normal,
          fontSize: width * 0.03,
        ),
      ),
    );
  }

  Widget _buildTextField(String hint,
      {TextInputType inputType = TextInputType.text}) {
    return TextFormField(
      keyboardType: inputType,
      decoration: InputDecoration(
        hintText: hint,
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
          borderSide: const BorderSide(color: Colors.grey, width: 1.5),
        ),
      ),
    );
  }

  Widget _buildDropdown(
      String? selectedValue, void Function(String?)? onChanged) {
    return DropdownButtonFormField<String>(
      icon: const Icon(
        Icons.keyboard_arrow_down,
        color: AppColors.grey,
      ),
      value: selectedValue,
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
          borderSide: const BorderSide(color: Colors.grey, width: 1.5),
        ),
      ),
      items: ['Option 1', 'Option 2', 'Option 3']
          .map((item) => DropdownMenuItem(value: item, child: Text(item)))
          .toList(),
      onChanged: onChanged,
    );
  }
}
