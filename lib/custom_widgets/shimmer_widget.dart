import 'package:flutter/material.dart';

class ShimmerWidget extends StatelessWidget {
  final double width;
  final double height;
  final ShapeBorder shapeBorder;
  // ignore: use_key_in_widget_constructors
  const ShimmerWidget.rectangular({this.width = 50, this.height = 50})
      : shapeBorder = const RoundedRectangleBorder();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: ShapeDecoration(
        color: Colors.grey[400],
        shape: shapeBorder,
      ),
    );
  }
}
