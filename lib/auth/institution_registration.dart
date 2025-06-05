import 'dart:math';

import 'package:easy_padhai/auth/popups/district_list1.dart';
import 'package:easy_padhai/auth/popups/state_list1.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_input2.dart';
import 'package:easy_padhai/model/ins_model.dart';
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
  DashboardController dashboardController = Get.find();
  AuthController controller = Get.find();
  TextEditingController controllerState = TextEditingController();
  TextEditingController controllerDistrict = TextEditingController();
  TextEditingController name = TextEditingController();
  TextEditingController add1 = TextEditingController();
  TextEditingController add2 = TextEditingController();
  TextEditingController pincode = TextEditingController();
  final formKey = GlobalKey<FormState>();
  AuthController authController = Get.find();

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: AppColors.bgColor,
      appBar: const CustomAppBar(
        text: 'Institution Registration request',
      ),
      body: Form(
        key: formKey,
        child: SingleChildScrollView(
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
              // _buildTextField(""),
              CustomInput2(
                label: 'Enter Institution name',
                enable: true,
                controller: name,
                validation: (value) {
                  if (value!.isEmpty) {
                    return 'Institution name is required';
                  }
                  return null;
                },
                inputType: TextInputType.text,
                wholeBackground: AppColors.white,
                isPrefix: false,
              ),
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
                      Text("Coaching",
                          style: TextStyle(fontSize: width * 0.04)),
                    ],
                  ),
                ],
              ),
              SizedBox(height: height * 0.02),
              _buildLabel("Address 1", width),
              //  _buildTextField(""),
              CustomInput2(
                label: 'Enter Address 1',
                enable: true,
                controller: add1,
                inputType: TextInputType.text,
                wholeBackground: AppColors.white,
                isPrefix: false,
              ),
              SizedBox(height: height * 0.02),
              _buildLabel("Address 2", width),
              // _buildTextField(""),
              CustomInput2(
                label: 'Enter Address 2',
                enable: true,
                controller: add2,
                inputType: TextInputType.text,
                wholeBackground: AppColors.white,
                isPrefix: false,
              ),
              SizedBox(height: height * 0.02),
              _buildLabel("State", width),
              // _buildDropdown(selectedState, (value) {
              //   setState(() => selectedState = value);
              // }),
              GestureDetector(
                onTap: () async {
                  await controller.getStateList();
                  bool? result = await showDialog<bool>(
                    context: context,
                    barrierDismissible: true,
                    builder: (BuildContext context) {
                      return State1Popup();
                    },
                  );
                  if (result == true) {
                    setState(() {
                      controllerState.text = controller.stateName.value;
                    });
                  }
                },
                child: CustomInput2(
                  label: 'Select Your State',
                  enable: false,
                  controller: controllerState,
                  validation: (value) {
                    if (value!.isEmpty) {
                      return 'State is required';
                    }
                    return null;
                  },
                  inputType: TextInputType.text,
                  customSuffixIcon: Icons.keyboard_arrow_down,
                  wholeBackground: AppColors.white,
                  isPrefix: false,
                ),
              ),
              SizedBox(height: height * 0.02),
              _buildLabel("District", width),
              GestureDetector(
                onTap: () async {
                  await controller.getdistrictList();
                  bool? result = await showDialog<bool>(
                    context: context,
                    barrierDismissible: true,
                    builder: (BuildContext context) {
                      return District1Popup();
                    },
                  );
                  if (result == true) {
                    setState(() {
                      controllerDistrict.text = controller.districtName.value;
                    });
                  }
                },
                child: CustomInput2(
                  label: 'Select Your District',
                  enable: false,
                  controller: controllerDistrict,
                  validation: (value) {
                    if (value!.isEmpty) {
                      return 'State is required';
                    }
                    return null;
                  },
                  inputType: TextInputType.text,
                  customSuffixIcon: Icons.keyboard_arrow_down,
                  wholeBackground: AppColors.white,
                  isPrefix: false,
                ),
              ),
              SizedBox(height: height * 0.02),
              _buildLabel("Pincode", width),
              //  _buildTextField("", inputType: TextInputType.number),
              CustomInput2(
                label: 'Enter Pincode',
                enable: true,
                controller: pincode,
                inputType: TextInputType.text,
                wholeBackground: AppColors.white,
                isPrefix: false,
              ),
              SizedBox(height: height * 0.12),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Padding(
        padding: EdgeInsets.all(width * 0.04),
        child: CustomButton(
          text: 'Submit',
          onTap: () async {
            if (formKey.currentState!.validate()) {
              if (_institutionType!.isEmpty) {
                Get.snackbar("Message", "Institution type is required!",
                    snackPosition: SnackPosition.BOTTOM);
              }
              String code = generateRandomCode();

              InstituteModel res = await controller.postInstitution(
                  name.text.toString().trim(),
                  _institutionType!,
                  add1.text.toString().trim(),
                  add2.text.toString().trim(),
                  controllerState.text.toString().trim(),
                  controllerDistrict.text.toString().trim(),
                  pincode.text.toString().trim(),
                  code);
              if (res != null && res.status == true) {
                Get.snackbar("Message", "Institution added sucessfully!",
                    snackPosition: SnackPosition.BOTTOM);
                // Get.toNamed(RouteName.selectInstitution);
                authController.instituteName.value = res.data!.institutesName!;
                authController.instituteId.value = res.data!.sId!;
                await authController.postUpdateAuthInfo('institute');
              } else {
                Get.snackbar(
                    "Message", "Something went wrong please try again later!",
                    snackPosition: SnackPosition.BOTTOM);

                Get.toNamed(RouteName.selectInstitution);
              }
            }
          },
        ),
      ),
    );
  }

  String generateRandomCode({String prefix = 'INS', int digits = 2}) {
    final random = Random();
    final maxNumber = pow(10, digits).toInt();
    final number = random.nextInt(maxNumber);
    final paddedNumber = number.toString().padLeft(digits, '0');
    return '$prefix$paddedNumber';
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
        hintText: 'Enter $hint',
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
          borderSide: const BorderSide(color: AppColors.theme, width: 1.5),
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
