import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CustomInput2 extends StatefulWidget {
  final String label;
  final String hint;
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
    Key? key,
    required this.label,
    this.hint = '',
    this.controller,
    this.isPassword = false,
    this.onChange,
    this.isPrefixText = false,
    this.prefixText = '',
    this.prefixIconSized = 25,
    this.labelColor = AppColors.black2,
    this.fillColor = Colors.white,
    this.textFiledColor = AppColors.grey,
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
  }) : super(key: key);

  @override
  State<CustomInput2> createState() => _CustomInputState();
}

class _CustomInputState extends State<CustomInput2> {
  bool isHide = true;
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    isHide = widget.isPassword;
    _controller = widget.controller ?? TextEditingController();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != '')
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: Colors.white,
              border: Border.all(
                color: AppColors.grey7,
                width: 1.0,
              ),
            ),
            padding: EdgeInsets.all(MediaQuery.of(context).size.width * .015),
            child: Stack(
              children: [
                Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        widget.isPrefix
                            ? widget.isPrefixText == false
                                ? Center(
                                    child: Padding(
                                      padding: EdgeInsets.only(
                                          left: MediaQuery.of(context)
                                                  .size
                                                  .width *
                                              .015),
                                      child: Icon(
                                        widget.icon,
                                        size: widget.prefixIconSized,
                                        color: AppColors.grey,
                                      ),
                                    ),
                                  )
                                : Center(
                                    child: Text(widget.prefixText,
                                        style: const TextStyle(
                                            color: Color.fromARGB(
                                                255, 175, 169, 169))),
                                  )
                            : const SizedBox(),
                        widget.isPrefix
                            ? const SizedBox(width: 5)
                            : const SizedBox(),
                        Expanded(
                          child: TextFormField(
                            focusNode: widget.focusNode,
                            maxLength: widget.maxLength,
                            scrollPadding: EdgeInsets.only(
                                bottom:
                                    MediaQuery.of(context).viewInsets.bottom),
                            inputFormatters: widget.inputFormatters,
                            maxLines: widget.isParagraph ? null : 1,
                            minLines: widget.isParagraph ? 5 : 1,
                            enabled: widget.enable,
                            obscureText: isHide,
                            style: TextStyle(
                                color: AppColors.black,
                                fontSize:
                                    MediaQuery.of(context).size.width * .033),
                            validator: widget.validation,
                            textInputAction: TextInputAction.next,
                            autovalidateMode:
                                AutovalidateMode.onUserInteraction,
                            keyboardType: widget.inputType,
                            controller: _controller,
                            decoration: InputDecoration(
                              fillColor: widget.fillColor,
                              filled: true,
                              isDense: false,
                              errorBorder: const UnderlineInputBorder(
                                borderSide:
                                    BorderSide(color: Colors.transparent),
                              ),
                              focusedErrorBorder: const UnderlineInputBorder(
                                borderSide:
                                    BorderSide(color: Colors.transparent),
                              ),
                              contentPadding:
                                  const EdgeInsets.only(left: 10, right: 5),
                              border: const OutlineInputBorder(
                                borderSide: BorderSide(
                                    color: AppColors.white, width: 1.0),
                              ),
                              focusedBorder: const OutlineInputBorder(
                                borderSide: BorderSide(
                                    color: AppColors.white, width: 1.0),
                              ),
                              enabledBorder: const OutlineInputBorder(
                                borderSide: BorderSide(
                                    color: AppColors.white, width: 1.0),
                              ),
                              disabledBorder: const OutlineInputBorder(
                                borderSide: BorderSide(
                                    color: AppColors.white, width: 1.0),
                              ),
                              suffixIconConstraints: const BoxConstraints(
                                  maxHeight: 25, maxWidth: 30),
                              labelText: widget.label,
                              labelStyle: TextStyle(
                                  fontWeight: FontWeight.w500,
                                  color: widget.labelColor,
                                  fontSize:
                                      MediaQuery.of(context).size.width * .035),
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
                                          size: 23,
                                        ),
                                      ),
                                    )
                                  : widget.customSuffixIcon != null
                                      ? Padding(
                                          padding:
                                              const EdgeInsets.only(right: 10),
                                          child: Icon(
                                            widget.customSuffixIcon,
                                            color: AppColors.grey,
                                            size: 23,
                                          ),
                                        )
                                      : null,
                              hintText: widget.hint,
                              hintStyle: TextStyle(
                                  fontSize:
                                      MediaQuery.of(context).size.width * .03),
                              counterText: widget.isParagraph ? null : '',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
      ],
    );
  }
}
