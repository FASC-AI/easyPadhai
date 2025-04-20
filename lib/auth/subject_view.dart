import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';

class SubjectView extends StatelessWidget {
  const SubjectView({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
        itemCount: 10,
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        scrollDirection: Axis.vertical,
        itemBuilder: (context, index) {
          return Container(
            padding: EdgeInsets.all(MediaQuery.of(context).size.width * .025),
            margin: EdgeInsets.only(
              
                bottom: index == 9
                    ? MediaQuery.of(context).size.width * .2
                    : MediaQuery.of(context).size.width * .03),
            width: MediaQuery.of(context).size.width,
            decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.all(
                    Radius.circular(MediaQuery.of(context).size.width * .025))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Image.asset(
                      'assets/book.png',
                      width: MediaQuery.of(context).size.width * .1,
                    ),
                    SizedBox(
                      width: MediaQuery.of(context).size.width * .05,
                    ),
                    Text('English',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                            color: AppColors.theme,
                            fontWeight: FontWeight.w500,
                            fontSize: MediaQuery.of(context).size.width * .04)),
                  ],
                ),
                Transform.scale(
                  scale: 1.2,
                  child: Checkbox(
                    value: false,
                    onChanged: (_) {},
                    activeColor: Colors.green,
                    checkColor: Colors.white,
                    focusColor: Colors.grey,
                    hoverColor: Colors.grey,
                    side: const BorderSide(color: AppColors.lightblue),
                  ),
                )
              ],
            ),
          );
        });
  }
}
