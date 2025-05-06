import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String text;
  const CustomAppBar({super.key, this.text = ''});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
  @override
  Widget build(BuildContext context) {
    return AppBar(
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
          Navigator.pop(context);
        },
      ),
      titleSpacing: 10,
      title: Text(
        text,
        style: TextStyle(
          color: AppColors.white,
          fontSize: MediaQuery.of(context).size.width * 0.045,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
