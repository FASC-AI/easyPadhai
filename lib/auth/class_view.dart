import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class ClassView extends StatelessWidget {
  const ClassView({super.key});

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
                bottom: MediaQuery.of(context).size.width * .03),
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
                    SvgPicture.asset(
                      'assets/classi.svg',
                      width: MediaQuery.of(context).size.width * .125,
                    ),
                    SizedBox(
                      width: MediaQuery.of(context).size.width * .05,
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Class ',
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                color: AppColors.theme,
                                fontWeight: FontWeight.w500,
                                fontSize:
                                    MediaQuery.of(context).size.width * .04)),
                        Row(
                          children: [
                            SvgPicture.asset(
                              'assets/person.svg',
                              width: MediaQuery.of(context).size.width * .035,
                            ),
                            SizedBox(
                              width: MediaQuery.of(context).size.width * .015,
                            ),
                            Text('31 Students',
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                    color: AppColors.grey6,
                                    fontWeight: FontWeight.w500,
                                    fontSize:
                                        MediaQuery.of(context).size.width *
                                            .03)),
                          ],
                        ),
                      ],
                    ),
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
