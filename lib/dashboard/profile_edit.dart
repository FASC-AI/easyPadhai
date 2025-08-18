import 'package:easy_padhai/auth/popups/district_list1.dart';
import 'package:easy_padhai/auth/popups/institutes_popup2.dart';
import 'package:easy_padhai/auth/popups/state_list1.dart';
import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';

import 'package:easy_padhai/custom_widgets/custom_button2.dart';
import 'package:easy_padhai/custom_widgets/custom_input.dart';
import 'package:easy_padhai/custom_widgets/custom_input2.dart';
import 'package:easy_padhai/model/pro_update_model.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'dart:io';

class ProfileEdit extends StatefulWidget {
  const ProfileEdit({super.key});

  @override
  State<ProfileEdit> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<ProfileEdit> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController classController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController pinController = TextEditingController();
  final TextEditingController instituteController = TextEditingController();
  final TextEditingController add1Controller = TextEditingController();
  final TextEditingController add2Controller = TextEditingController();
  TextEditingController controllerState = TextEditingController();
  TextEditingController controllerDistrict = TextEditingController();
  DashboardController dashboardController = Get.find();
  String stateId = "", distId = "", insId = "";
  AuthController controller = Get.find();
  File? _imageFile;
  final ImagePicker _picker = ImagePicker();
  bool isVisible = false;
  final formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    await dashboardController.getProfile();
    // print("picture :  ${userPic()}");
    setState(() {
      nameController.text =
          dashboardController.profileModel?.data?.userDetails?.name ?? '';
      emailController.text =
          dashboardController.profileModel?.data?.userDetails?.email ?? '';
      classController.text =
          dashboardController.profileModel?.data?.classDetail?[0].class1 ?? '';
      instituteController.text =
          dashboardController.profileModel?.data?.institute ?? '';
      phoneController.text =
          dashboardController.profileModel?.data?.userDetails?.mobile ?? '';
      add1Controller.text =
          dashboardController.profileModel?.data?.address1 ?? '';
      add2Controller.text =
          dashboardController.profileModel?.data?.address2 ?? '';
      pinController.text =
          dashboardController.profileModel?.data?.pincode ?? '';
      if (dashboardController.profileModel?.data?.state != null) {
        controllerState.text =
            dashboardController.profileModel!.data!.state!.name?.english ?? '';
        stateId = dashboardController.profileModel!.data!.state!.sId ?? '';
      } else {
        controllerState.text = '';
        stateId = '';
        // debugPrint('State data not available in API response');
      }

// Check if district exists in the response
      if (dashboardController.profileModel?.data?.district != null) {
        controllerDistrict.text =
            dashboardController.profileModel!.data!.district!.name?.english ??
                '';
        distId = dashboardController.profileModel!.data!.district!.sId ?? '';
      } else {
        controllerDistrict.text = '';
        distId = '';
        // debugPrint('District data not available in API response');
      }
      insId = dashboardController.profileModel?.data?.instituteId ?? '';
    });
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(source: source);
      if (pickedFile != null) {
        _cropImage(pickedFile.path);
      }
    } catch (e) {
      print(e);
      Get.snackbar(
        'Error',
        'Failed to pick image: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.red,
        colorText: Colors.white,
      );
    }
  }

  Future<void> _cropImage(String imagePath) async {
    try {
      final croppedFile = await ImageCropper().cropImage(
        sourcePath: imagePath,

        uiSettings: [
          AndroidUiSettings(
            toolbarTitle: 'Crop Image',
            toolbarColor: AppColors.theme,
            toolbarWidgetColor: Colors.white,
            initAspectRatio: CropAspectRatioPreset.square,
            lockAspectRatio: true,
          ),
          // IOSUiSettings(
          //   title: 'Crop Image',
          //   aspectRatioPresets: [
          //     CropAspectRatioPreset.square,
          //     CropAspectRatioPreset.ratio3x2,
          //     CropAspectRatioPreset.original,
          //     CropAspectRatioPreset.ratio4x3,
          //     CropAspectRatioPreset.ratio16x9
          //   ],
          //   aspectRatioLockEnabled: true,
          // ),
        ],
      );

      if (croppedFile != null) {
        setState(() {
          _imageFile = File(croppedFile.path);
        });
        List<File> profileImage = [];
        profileImage.add(File(croppedFile.path));
        await dashboardController.uploadImage(profileImage);
        // TODO: Upload the cropped image to server
      } else {
        List<File> profileImage = [];

        profileImage.add(File(imagePath));
        await dashboardController.uploadImage(profileImage);
      }
    } catch (e) {
      print(e);
      Get.snackbar(
        'Error',
        'Failed to crop image: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.red,
        colorText: Colors.white,
      );
    }
  }

  void _showImagePickerModal() {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Wrap(
            children: <Widget>[
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Choose from Gallery'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_camera),
                title: const Text('Take a Photo'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.camera);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    instituteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        leadingWidth: MediaQuery.of(context).size.width * .13,
        leading: IconButton(
          padding: const EdgeInsets.only(
            left: 20,
          ),
          icon: Image.asset(
            'assets/back.png',
            fit: BoxFit.fill,
            width: MediaQuery.of(context).size.width * 0.09,
          ),
          onPressed: () {
            Get.offNamed(RouteName.profile);
          },
        ),
        titleSpacing: 10,
        title: Text(
          "Edit Profile",
          style: TextStyle(
            color: AppColors.white,
            fontSize: MediaQuery.of(context).size.width * 0.045,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Form(
        key: formKey,
        child: Stack(
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
              child: GestureDetector(
                onTap: _showImagePickerModal,
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: width * 0.12,
                      backgroundImage: _imageFile != null
                          ? FileImage(_imageFile!)
                          : (userPic().isNotEmpty
                              ? NetworkImage(userPic())
                              : null),
                      backgroundColor: Colors.grey[400],
                      child: (_imageFile == null && userPic().isEmpty)
                          ? Text(
                              userName().isNotEmpty
                                  ? userName()[0].toUpperCase()
                                  : '',
                              style: TextStyle(
                                fontSize: width * 0.08,
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            )
                          : null,
                      onBackgroundImageError:
                          _imageFile != null || userPic().isNotEmpty
                              ? (exception, stackTrace) {
                                  setState(() {
                                    _imageFile = null;
                                  });
                                }
                              : null,
                    ),
                  ],
                ),
              ),
            ),
            Positioned(
              top: height * 0.085,
              left: (width - (width * 0.18)) / 1.5,
              child: GestureDetector(
                onTap: _showImagePickerModal,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(50),
                    border: Border.all(color: Colors.white),
                  ),
                  child: Padding(
                    padding:
                        EdgeInsets.all(MediaQuery.of(context).size.width * .01),
                    child: const Icon(
                      Icons.edit_outlined,
                      color: AppColors.theme,
                    ),
                  ),
                ),
              ),
            ),
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
                    // _buildTextField(
                    //   controller: nameController,
                    //   hint: 'Enter your name',
                    //   context: context,

                    // ),
                    TextFormField(
                      keyboardType: TextInputType.text,
                      textInputAction: TextInputAction.next,
                      autovalidateMode: AutovalidateMode.onUserInteraction,
                      decoration: InputDecoration(
                          fillColor: AppColors.white,
                          filled: true,
                          isDense: false,
                          contentPadding: EdgeInsets.only(left: 10),
                          counterText: '',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: Colors.grey, width: 1.0),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: Colors.grey, width: 1.0),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: Colors.grey, width: 1.0),
                          ),
                          disabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: AppColors.grey7, width: 1.0),
                          ),
                          suffixIconConstraints:
                              BoxConstraints(maxHeight: 25, maxWidth: 30),
                          hintText: "Enter your name",
                          hintStyle:
                              TextStyle(fontSize: 14, color: Colors.grey)),
                      controller: nameController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a name';
                        }

                        // Regex: Only alphabets (A-Z, a-z) and spaces allowed
                        final nameRegExp = RegExp(r'^[a-zA-Z ]+$');

                        if (!nameRegExp.hasMatch(value)) {
                          return 'Only alphabets and spaces are allowed';
                        }

                        return null;
                      },
                    ),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Class', width, context: context),
                    (dashboardController
                                .profileModel?.data?.userDetails!.role! !=
                            'student')
                        ? Container(
                            alignment: Alignment.topLeft,
                            child: _buildClassChips(width))
                        : _buildTextField(
                            controller: classController,
                            hint: 'Enter your class',
                            context: context,
                            enabled: false,
                          ),
                    SizedBox(height: height * 0.015),
                    if (dashboardController
                            .profileModel?.data?.userDetails!.role! !=
                        'student') ...[
                      _buildLabel('Institution', width, context: context),
                      GestureDetector(
                        onTap: () async {
                          await dashboardController.getInstitutes();
                          bool? result = await showDialog<bool>(
                            context: context,
                            barrierDismissible: true,
                            builder: (BuildContext context) {
                              return InstitutesPopup2();
                            },
                          );
                          if (result == true) {
                            setState(() {
                              instituteController.text =
                                  dashboardController.instituteName.value;
                              insId = dashboardController.instituteId.value;
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
                      // Padding(
                      //   padding: EdgeInsets.only(top: width * .02),
                      //   child: Align(
                      //     alignment: Alignment.centerRight,
                      //     child: Text(
                      //       'Change Your Institution',
                      //       style: TextStyle(
                      //         color: AppColors.theme,
                      //         fontWeight: FontWeight.w600,
                      //         fontSize: width * 0.032,
                      //       ),
                      //     ),
                      //   ),
                      // ),
                      SizedBox(height: height * 0.015),
                    ],
                    _buildLabel(
                      'Phone',
                      width,
                      context: context,
                    ),
                    // _buildTextField(
                    //   hint: 'Enter your phone number',
                    //   context: context,
                    //   isPin: true,
                    //   maxNum: 10,
                    // ),
                    TextFormField(
                      maxLength: 10,
                      keyboardType: TextInputType.phone,
                      textInputAction: TextInputAction.next,
                      autovalidateMode: AutovalidateMode.onUserInteraction,
                      decoration: InputDecoration(
                          fillColor: AppColors.white,
                          filled: true,
                          isDense: false,
                          contentPadding: EdgeInsets.only(left: 10),
                          counterText: '',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: Colors.grey, width: 1.0),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: Colors.grey, width: 1.0),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: Colors.grey, width: 1.0),
                          ),
                          disabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: AppColors.grey7, width: 1.0),
                          ),
                          suffixIconConstraints:
                              BoxConstraints(maxHeight: 25, maxWidth: 30),
                          hintText: "Enter your phone number",
                          hintStyle:
                              TextStyle(fontSize: 14, color: Colors.grey)),
                      controller: phoneController,
                      validator: (value) {
                        // bool isEmail =
                        //     RegExp(r"^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")
                        //         .hasMatch(value);
                        if (phoneController.text.isNotEmpty) {
                          bool isPhoneNumber = value!.length == 10 &&
                              int.tryParse(value) != null;

                          if (!isPhoneNumber) {
                            return "Please enter a valid phone number";
                          }
                        }

                        return null;
                      },
                    ),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Email', width, context: context),
                    _buildTextField(
                      controller: emailController,
                      hint: 'Enter your email',
                      context: context,
                      enabled: false,
                    ),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Address', width, context: context),
                    _buildTextField(
                      hint: 'Enter address',
                      context: context,
                      controller: add1Controller,
                    ),
                    // CustomInput(
                    //   label: 'Address 1',
                    //   controller: add1Controller,
                    //   inputType: TextInputType.text,
                    //   wholeBackground: AppColors.white,
                    //   isPrefix: false,
                    // ),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Address 2', width, context: context),
                    _buildTextField(
                      hint: 'Enter address 2',
                      context: context,
                      controller: add2Controller,
                    ),
                    // CustomInput(
                    //   label: 'Address 2',
                    //   controller: add2Controller,
                    //   inputType: TextInputType.text,
                    //   wholeBackground: AppColors.white,
                    //   isPrefix: false,
                    // ),
                    SizedBox(height: height * 0.015),
                    _buildLabel('State', width, context: context),
                    GestureDetector(
                      onTap: () async {
                        // await controller.getStateList();
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
                            stateId = controller.stateId.value;
                            controllerDistrict.text = "";
                            distId = "";
                          });
                        }
                      },
                      child: CustomInput2(
                        label: 'Select Your State',
                        enable: false,
                        controller: controllerState,
                        validation: (value) {
                          // if (value!.isEmpty) {
                          //   return 'State is required';
                          // }
                          return null;
                        },
                        inputType: TextInputType.text,
                        customSuffixIcon: Icons.keyboard_arrow_down,
                        wholeBackground: AppColors.white,
                        isPrefix: false,
                      ),
                    ),
                    SizedBox(height: height * 0.015),
                    _buildLabel('District', width, context: context),
                    GestureDetector(
                      onTap: () async {
                        if (controllerState.text.isEmpty) {
                          Get.snackbar("Message", "Please Select State",
                              snackPosition: SnackPosition.BOTTOM);
                        } else {
                          //   await controller.getdistrictList();
                          bool? result = await showDialog<bool>(
                            context: context,
                            barrierDismissible: true,
                            builder: (BuildContext context) {
                              return District1Popup();
                            },
                          );
                          if (result == true) {
                            setState(() {
                              controllerDistrict.text =
                                  controller.districtName.value;
                              distId = controller.districtId.value;
                            });
                          }
                        }
                      },
                      child: CustomInput2(
                        label: 'Select Your District',
                        enable: false,
                        controller: controllerDistrict,
                        validation: (value) {
                          // if (value!.isEmpty) {
                          //   return 'State is required';
                          // }
                          return null;
                        },
                        inputType: TextInputType.text,
                        customSuffixIcon: Icons.keyboard_arrow_down,
                        wholeBackground: AppColors.white,
                        isPrefix: false,
                      ),
                    ),
                    SizedBox(height: height * 0.015),
                    _buildLabel('Pin Code', width, context: context),
                    TextFormField(
                      maxLength: 10,
                      keyboardType: TextInputType.phone,
                      textInputAction: TextInputAction.next,
                      autovalidateMode: AutovalidateMode.onUserInteraction,
                      decoration: InputDecoration(
                          fillColor: AppColors.white,
                          filled: true,
                          isDense: false,
                          contentPadding: EdgeInsets.only(left: 10),
                          counterText: '',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: Colors.grey, width: 1.0),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: Colors.grey, width: 1.0),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: Colors.grey, width: 1.0),
                          ),
                          disabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: AppColors.grey7, width: 1.0),
                          ),
                          suffixIconConstraints:
                              BoxConstraints(maxHeight: 25, maxWidth: 30),
                          hintText: "Enter your pin",
                          hintStyle:
                              TextStyle(fontSize: 14, color: Colors.grey)),
                      controller: pinController,
                      validator: (value) {
                        // bool isEmail =
                        //     RegExp(r"^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")
                        //         .hasMatch(value);
                        if (pinController.text.isNotEmpty) {
                          bool isPhoneNumber =
                              value!.length == 6 && int.tryParse(value) != null;

                          if (!isPhoneNumber) {
                            return "Please enter a valid Pincode";
                          }
                        }
                        return null;
                      },
                    ),
                    SizedBox(height: height * 0.12),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: width * 0.05,
          vertical: height * 0.01,
        ),
        child: CustomButton2(
          text: 'Update',
          onTap: () async {
            if (formKey.currentState!.validate()) {
              if (stateId.isEmpty && distId.isNotEmpty) {
                Get.snackbar("Message", "State is required!",
                    snackPosition: SnackPosition.BOTTOM);
                return;
              }
              ProUpdateModel res = await dashboardController.updatePro(
                  nameController.text.toString().trim(),
                  phoneController.text.toString().trim(),
                  add1Controller.text.toString().trim(),
                  add2Controller.text.toString().trim(),
                  pinController.text.toString().trim(),
                  stateId,
                  distId,
                  userPic(),
                  insId);
              if (res.status == true) {
                Get.offNamed(RouteName.profile);
              }
            }
          },
        ),
      ),
    );
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

  Widget _buildTextField({
    TextEditingController? controller,
    required String hint,
    required BuildContext context,
    bool? isPin,
    int? maxNum,
    bool enabled = true,
  }) {
    return TextFormField(
      controller: controller,
      initialValue: controller == null ? hint : null,
      keyboardType: isPin == true ? TextInputType.number : null,
      maxLength: isPin == true ? maxNum : null,
      enabled: enabled,
      decoration: InputDecoration(
        contentPadding: EdgeInsets.symmetric(
          horizontal: MediaQuery.of(context).size.width * .035,
          vertical: MediaQuery.of(context).size.width * .02,
        ),
        hintStyle: TextStyle(color: Colors.black),
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
          borderSide: const BorderSide(color: AppColors.grey),
        ),
      ),
    );
  }

  Widget _buildClassChips(double width) {
    List<ClassDetail>? classes =
        dashboardController.profileModel?.data!.classDetail;
    return Wrap(
      spacing: width * 0.025,
      children: classes!
          .map((item) => Chip(
                label: Text(item.class1!),
                deleteIcon: null, // Explicitly set to null
                onDeleted: null, // Also set onDeleted to null
              ))
          .toList(),
    );
  }
  // Widget _buildClassChips(double width) {
  //   // final classes = ['XI', 'XII', 'X', 'IX'];
  //   List<ClassDetail>? classes =
  //       dashboardController.profileModel?.data!.classDetail;
  //   return Wrap(
  //     spacing: width * 0.025,
  //     children: classes!
  //         .map((item) => Chip(
  //               label: Text(item.class1!),
  //               //deleteIcon: null,
  //               onDeleted: () {},
  //             ))
  //         .toList(),
  //   );
  // }
}
