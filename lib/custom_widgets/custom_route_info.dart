import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';

class CustomRouteInfo extends StatelessWidget {
  final String name;
  final String value;

  const CustomRouteInfo({
    Key? key,
    required this.name,
    required this.value,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Flexible(
              child: Text(
                name,
                style: TextStyle(
                  fontSize: MediaQuery.of(context).size.width * .035,
                  color: AppColors.black,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Flexible(
              child: Text(
                value,
                textAlign: TextAlign.end,
                style: TextStyle(
                  fontSize: MediaQuery.of(context).size.width * .04,
                  color: AppColors.black,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        SizedBox(
          height: MediaQuery.of(context).size.height * .01,
        ),
      ],
    );
  }
}
