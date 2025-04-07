import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class CustomMonthSwitcher extends StatelessWidget {
  final Color arrowColor;
  final DateTime currentDate;
  final Function onNext;
  final Function onPrevious;
  final DateTime firstDate;
  final DateTime lastDate;

  const CustomMonthSwitcher({
    super.key,
    required this.arrowColor,
    required this.currentDate,
    required this.onNext,
    required this.onPrevious,
    required this.firstDate,
    required this.lastDate,
  });

  @override
  Widget build(BuildContext context) {
    bool canShowPrevious = currentDate.isAfter(firstDate);
    bool canShowNext = currentDate.isBefore(lastDate);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        if (canShowPrevious)
          IconButton(
            icon: Icon(
              Icons.arrow_back_ios_rounded,
              color: arrowColor,
              size: MediaQuery.of(context).size.width * .035,
            ),
            onPressed: () {
              if (canShowPrevious) {
                onPrevious();
              }
            },
          ),
        Expanded(
          child: Text(
            DateFormat('MMMM yyyy').format(currentDate),
            style: TextStyle(color: arrowColor, fontWeight: FontWeight.w500),
            textAlign: TextAlign.center,
          ),
        ),
        if (canShowNext)
          IconButton(
            icon: Icon(
              Icons.arrow_forward_ios_rounded,
              color: arrowColor,
              size: MediaQuery.of(context).size.width * .035,
                  ),
            onPressed: () {
              if (canShowNext) {
                onNext();
              }
            },
          ),
      ],
    );
  }
}
