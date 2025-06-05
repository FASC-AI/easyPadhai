import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class OtpPasscode extends StatefulWidget {
  final void Function(String) onCompleted;
  final int digits;
  final FocusNode? firstFocusNode;
  final FocusNode? lastFocusNode;
  final bool autoFocusFirst;

  const OtpPasscode({
    super.key,
    required this.onCompleted,
    this.digits = 4,
    this.firstFocusNode,
    this.lastFocusNode,
    this.autoFocusFirst = true,
  });

  @override
  State<OtpPasscode> createState() => _OtpPasscodeState();
}

class _OtpPasscodeState extends State<OtpPasscode> {
  late final List<FocusNode> _focusNodes;
  late final List<TextEditingController> _controllers;

  @override
  void initState() {
    super.initState();
    _focusNodes = List.generate(widget.digits, (_) => FocusNode());

    if (widget.firstFocusNode != null) {
      _focusNodes[0] = widget.firstFocusNode!;
    }

    if (widget.lastFocusNode != null) {
      _focusNodes[widget.digits - 1] = widget.lastFocusNode!;
    }

    _controllers = List.generate(widget.digits, (_) => TextEditingController());

    if (widget.autoFocusFirst) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_focusNodes[0].canRequestFocus) {
          _focusNodes[0].requestFocus();
        }
      });
    }
  }

  void _onOtpChanged(String value, int index) {
    if (value.length == 1 && index < widget.digits - 1) {
      _focusNodes[index + 1].requestFocus();
    } else if (index == widget.digits - 1 && value.length == 1) {
      String otp = _controllers.map((c) => c.text).join();
      widget.onCompleted(otp);
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  @override
  void dispose() {
    for (int i = 0; i < _focusNodes.length; i++) {
      if ((i == 0 && widget.firstFocusNode == null) ||
          (i == widget.digits - 1 && widget.lastFocusNode == null) ||
          (i != 0 && i != widget.digits - 1)) {
        _focusNodes[i].dispose();
      }
    }

    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final border = OutlineInputBorder(
      borderRadius:
          BorderRadius.circular(MediaQuery.of(context).size.width * .02),
      borderSide: const BorderSide(color: Colors.white, width: 1),
    );

    return Padding(
      padding: EdgeInsets.only(
        bottom:
            MediaQuery.of(context).viewInsets.bottom, // Account for keyboard
      ),
      child: Center(
        child: SingleChildScrollView(
          physics: const ClampingScrollPhysics(), // Smoother scrolling
          scrollDirection: Axis.horizontal,
          child: Container(
            // Add a container with fixed height
            height: MediaQuery.of(context).size.height * 0.15,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(widget.digits, (index) {
                return Container(
                  width: MediaQuery.of(context).size.width * .16,
                  margin: EdgeInsets.symmetric(
                    horizontal: MediaQuery.of(context).size.width * .025,
                  ),
                  child: Center(
                    child: TextField(
                      controller: _controllers[index],
                      focusNode: _focusNodes[index],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      textAlignVertical: TextAlignVertical.center,
                      cursorColor: AppColors.white,
                      style: TextStyle(
                        fontSize: MediaQuery.of(context).size.width * .06,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      maxLength: 1,
                      onChanged: (value) => _onOtpChanged(value, index),
                      decoration: InputDecoration(
                        counterText: '',
                        enabledBorder: border,
                        focusedBorder: border.copyWith(
                          borderSide:
                              const BorderSide(color: Colors.green, width: 2),
                        ),
                        filled: true,
                        fillColor: Colors.transparent,
                        contentPadding:
                            EdgeInsets.zero, // Remove default padding
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}
