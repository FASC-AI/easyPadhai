import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class CustomBottomNavBar3 extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const CustomBottomNavBar3({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  BottomNavigationBarItem _buildNavItem({
    required String iconPath,
    required String activeIconPath,
    required String label,
    required bool isActive,
  }) {
    return BottomNavigationBarItem(
      icon: Padding(
        padding: const EdgeInsets.only(bottom: 5),
        child: SvgPicture.asset(
          isActive ? activeIconPath : iconPath,
          height: 24,
          width: 24,
        ),
      ),
      label: label,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      backgroundColor: Colors.white,
      type: BottomNavigationBarType.fixed,
      selectedFontSize: MediaQuery.of(context).size.width * .03,
      unselectedFontSize: MediaQuery.of(context).size.width * .03,
      unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
      selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
      selectedItemColor: AppColors.theme,
      unselectedItemColor: AppColors.grey5,
      items: [
        _buildNavItem(
          iconPath: 'assets/home.svg',
          activeIconPath: 'assets/homeb.svg',
          label: 'Home',
          isActive: currentIndex == 0,
        ),
        _buildNavItem(
          iconPath: 'assets/test.svg',
          activeIconPath: 'assets/testb.svg',
          label: 'Create',
          isActive: currentIndex == 1,
        ),
        _buildNavItem(
          iconPath: 'assets/support.svg',
          activeIconPath: 'assets/supportb.svg',
          label: 'Support',
          isActive: currentIndex == 2,
        ),
        _buildNavItem(
          iconPath: 'assets/personnav.svg',
          activeIconPath: 'assets/personnavb.svg',
          label: 'Profile',
          isActive: currentIndex == 3,
        ),
      ],
    );
  }
}
