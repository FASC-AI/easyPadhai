import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CustomInput2 extends StatefulWidget {
  final String label;
  final TextEditingController? controller;
  final bool isPassword;
  final Color labelColor;
  final Color fillColor;
  final TextInputType inputType;
  final Color textFiledColor;
  final Color wholeBackground;
  final Function()? onChangeCompleted;
  final double prefixIconSized;
  final bool isPrefixText;
  final bool isPrefix;
  final String prefixText;
  final bool autoFocus;
  final bool enable;
  final bool readOnly;
  final String? Function(String?)? validation;
  final Function(String?)? onChange;
  final IconData? icon;
  final int? maxLength;
  final Function()? onTap;
  final List<TextInputFormatter>? inputFormatters;
  final FocusNode? focusNode;
  final IconData? customSuffixIcon;
  final bool isParagraph;

  const CustomInput2({
    super.key,
    required this.label,
    this.controller,
    this.isPassword = false,
    this.onChange,
    this.isPrefixText = false,
    this.prefixText = '',
    this.prefixIconSized = 25,
    this.labelColor = AppColors.grey,
    this.fillColor = Colors.transparent,
    this.textFiledColor = AppColors.white,
    this.inputType = TextInputType.text,
    this.wholeBackground = AppColors.white,
    this.autoFocus = false,
    this.isPrefix = true,
    this.readOnly = false,
    this.onChangeCompleted,
    this.enable = true,
    this.validation,
    this.onTap,
    this.maxLength,
    this.icon,
    this.inputFormatters,
    this.focusNode,
    this.customSuffixIcon,
    this.isParagraph = false,
  });

  @override
  State<CustomInput2> createState() => _CustomInput2State();
}

class _CustomInput2State extends State<CustomInput2> {
  bool isHide = true;

  @override
  void initState() {
    isHide = widget.isPassword;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != '')
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: SizedBox(
                  height: widget.isParagraph
                      ? MediaQuery.of(context).size.height * .2
                      : null,
                  child: TextFormField(
                    onTap: widget.onTap,
                    focusNode: widget.focusNode,
                    scrollPadding: EdgeInsets.only(
                        bottom: MediaQuery.of(context).viewInsets.bottom),
                    inputFormatters: widget.inputFormatters ??
                        [
                          LengthLimitingTextInputFormatter(widget.maxLength),
                        ],
                    maxLines: widget.isParagraph ? null : 1,
                    minLines: widget.isParagraph ? 5 : 1,
                    maxLength: widget.maxLength,
                    enabled: widget.enable,
                    obscureText: isHide,
                    style: TextStyle(
                        color: AppColors.black,
                        fontSize: MediaQuery.of(context).size.width * .033),
                    validator: widget.validation,
                    textInputAction: widget.isParagraph
                        ? TextInputAction.newline
                        : TextInputAction.next,
                    autovalidateMode: AutovalidateMode.onUserInteraction,
                    keyboardType: widget.isParagraph
                        ? TextInputType.multiline
                        : widget.inputType,
                    controller: widget.controller,
                    cursorColor: AppColors.white,
                    decoration: InputDecoration(
                        fillColor: widget.fillColor,
                        filled: true,
                        isDense: false,
                        alignLabelWithHint: true,
                        contentPadding: widget.isParagraph
                            ? const EdgeInsets.symmetric(
                                vertical: 10, horizontal: 10)
                            : const EdgeInsets.only(left: 10, right: 5),
                        counterText: widget.isParagraph ? null : '',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(
                              color: AppColors.grey, width: 1.0),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(
                              color: AppColors.grey, width: 1.0),
                        ),
                        errorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(
                              color: AppColors.red, width: 1.0),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(
                              color: AppColors.grey, width: 1.0),
                        ),
                        disabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(
                              color: AppColors.grey, width: 1.0),
                        ),
                        suffixIconConstraints:
                            const BoxConstraints(maxHeight: 25, maxWidth: 30),
                        suffixIcon: widget.isPassword
                            ? Padding(
                                padding: const EdgeInsets.only(right: 10),
                                child: InkWell(
                                  onTap: (() {
                                    setState(() {
                                      isHide = !isHide;
                                    });
                                  }),
                                  child: Icon(
                                    isHide
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                    color: AppColors.grey4,
                                    size:
                                        MediaQuery.of(context).size.width * .06,
                                  ),
                                ),
                              )
                            : widget.customSuffixIcon != null
                                ? Padding(
                                    padding: const EdgeInsets.only(right: 10),
                                    child: Icon(
                                      widget.customSuffixIcon,
                                      color: AppColors.grey4,
                                      size: MediaQuery.of(context).size.width *
                                          .06,
                                    ),
                                  )
                                : null,
                        hintText: widget.label,
                        hintStyle: TextStyle(
                            color: AppColors.grey,
                            fontSize: MediaQuery.of(context).size.width * .03)),
                  ),
                ),
              ),
            ],
          ),
      ],
    );
  }
}
