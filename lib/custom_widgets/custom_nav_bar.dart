import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class CustomBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const CustomBottomNavBar({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  BottomNavigationBarItem _buildNavItem({
    required String iconPath,
    required String activeIconPath,
    required String label,
    required bool isActive,
  }) {
    return BottomNavigationBarItem(
      icon: SvgPicture.asset(
        isActive ? activeIconPath : iconPath,
        height: 24,
        width: 24,
      ),
      label: label,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      type: BottomNavigationBarType.fixed,
      selectedFontSize: 12,
      unselectedFontSize: 12,
      selectedItemColor: Colors.blue,
      unselectedItemColor: Colors.black,
      items: [
        _buildNavItem(
          iconPath: 'assets/home.svg',
          activeIconPath: 'assets/homeb.svg',
          label: 'Home',
          isActive: currentIndex == 0,
        ),
        _buildNavItem(
          iconPath: 'assets/create.svg',
          activeIconPath: 'assets/add.svg',
          label: 'Create Batch',
          isActive: currentIndex == 1,
        ),
        _buildNavItem(
          iconPath: 'assets/join_grey.svg',
          activeIconPath: 'assets/addb.svg',
          label: 'Join Batch',
          isActive: currentIndex == 2,
        ),
        _buildNavItem(
          iconPath: 'assets/support.svg',
          activeIconPath: 'assets/supportb.svg',
          label: 'Support',
          isActive: currentIndex == 3,
        ),
        _buildNavItem(
          iconPath: 'assets/personnavb.svg',
          activeIconPath: 'assets/personnav.svg',
          label: 'Profile',
          isActive: currentIndex == 4,
        ),
      ],
    );
  }
}
