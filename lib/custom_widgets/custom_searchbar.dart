import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';

class SearchWidget extends StatefulWidget {
  final String? text;
  final ValueChanged<String>? onChanged;
  final String? hintText;
  const SearchWidget({Key? key, this.text, this.onChanged, this.hintText})
      : super(key: key);

  @override
  State<SearchWidget> createState() => _SearchWidgetState();
}

class _SearchWidgetState extends State<SearchWidget> {
  final controller = TextEditingController();
  @override
  Widget build(BuildContext context) {
    TextStyle styleActive = const TextStyle(color: Colors.black);
    TextStyle styleHint = const TextStyle(color: Colors.black54);
    // ignore: unused_local_variable
    final style = widget.text!.isEmpty ? styleHint : styleActive;
    return Container(
      height: MediaQuery.of(context).size.height * .06,
      margin: EdgeInsets.fromLTRB(MediaQuery.of(context).size.width * .01, 12,
          MediaQuery.of(context).size.width * .01, 12),
      decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: const Color(0x19626262).withOpacity(0.1),
              offset: const Offset(0, 0),
            ),
          ],
          color: Colors.white,
          border: Border.all(
              color: widget.text!.isEmpty
                  ? const Color.fromARGB(255, 244, 243, 243)
                  : AppColors.grey)),
      padding: EdgeInsets.symmetric(
          horizontal: MediaQuery.of(context).size.width * .025),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Icon(Icons.search, color: AppColors.grey),
          SizedBox(
            width: MediaQuery.of(context).size.width * .025,
          ),
          Expanded(
            child: TextField(
              controller: controller,
              textAlignVertical: TextAlignVertical.center,
              decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  errorBorder: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  disabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  focusedErrorBorder: InputBorder.none,
                  suffixIcon: widget.text!.isNotEmpty
                      ? GestureDetector(
                          child: const Icon(Icons.close, color: AppColors.grey),
                          onTap: () {
                            controller.clear();
                            widget.onChanged!('');
                            FocusManager.instance.primaryFocus?.unfocus();
                            setState(() {});
                          },
                        )
                      : null,
                  hintText: 'Search',
                  hintStyle:
                      const TextStyle(color: AppColors.grey, fontSize: 14),
                  border: InputBorder.none),
              // style: style,
              onChanged: widget.onChanged,
            ),
          ),
        ],
      ),
    );
  }
}
