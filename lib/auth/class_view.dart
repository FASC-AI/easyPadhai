import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/model/class_list_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

// ignore: must_be_immutable
class ClassView extends StatelessWidget {
  ClassView({super.key});
  AuthController authController = Get.find();

  @override
  Widget build(BuildContext context) {
    return Obx(() => authController.isLoading1.isTrue
        ? authController.classesdataList.isNotEmpty
            ? ListView.builder(
                itemCount: authController.classesdataList.length,
                shrinkWrap: true,
                physics: const BouncingScrollPhysics(),
                scrollDirection: Axis.vertical,
                itemBuilder: (context, index) {
                  final ClassesData element =
                      authController.classesdataList[index];
                  return Container(
                    padding: EdgeInsets.all(
                        MediaQuery.of(context).size.width * .025),
                    margin: EdgeInsets.only(
                        bottom: authController.classesdataList[index] ==
                                authController.classesdataList.last
                            ? MediaQuery.of(context).size.width * .2
                            : MediaQuery.of(context).size.width * .03),
                    width: MediaQuery.of(context).size.width,
                    decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.all(Radius.circular(
                            MediaQuery.of(context).size.width * .025))),
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
                                Text(element.nameEn!,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                        color: AppColors.theme,
                                        fontWeight: FontWeight.w600,
                                        fontSize:
                                            MediaQuery.of(context).size.width *
                                                .042)),
                                // SizedBox(
                                //   height:
                                //       MediaQuery.of(context).size.height * .005,
                                // ),
                                // Row(
                                //   children: [
                                //     SvgPicture.asset(
                                //       'assets/person.svg',
                                //       width: MediaQuery.of(context).size.width *
                                //           .035,
                                //     ),
                                //     SizedBox(
                                //       width: MediaQuery.of(context).size.width *
                                //           .015,
                                //     ),
                                //     // Text("${element.code} Students",
                                //     //     overflow: TextOverflow.ellipsis,
                                //     //     style: TextStyle(
                                //     //         color: AppColors.grey6,
                                //     //         fontWeight: FontWeight.w500,
                                //     //         fontSize: MediaQuery.of(context)
                                //     //                 .size
                                //     //                 .width *
                                //     //             .032)),
                                //   ],
                                // ),
                              ],
                            ),
                          ],
                        ),
                        Obx(
                          () => Transform.scale(
                            scale: 1.2,
                            child: Checkbox(
                              value: authController.selectedClassIds
                                  .contains(element.sId),
                              onChanged: (_) {
                                authController
                                    .toggleClassSelection(element.sId!);
                              },
                              activeColor: Colors.green,
                              checkColor: Colors.white,
                              focusColor: Colors.grey,
                              hoverColor: Colors.grey,
                              side:
                                  const BorderSide(color: AppColors.lightblue),
                            ),
                          ),
                        )
                      ],
                    ),
                  );
                })
            : Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Lottie.asset(
                      'assets/nodata.json',
                      width: MediaQuery.of(context).size.width * .5,
                      repeat: true,
                      animate: true,
                      reverse: false,
                    ),
                    Text(
                      'No Content',
                      style: TextStyle(
                          fontSize: MediaQuery.of(context).size.width * .04,
                          color: AppColors.black,
                          fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              )
        : Center(
            child: Lottie.asset(
              'assets/loading.json',
              width: MediaQuery.of(context).size.width * .25,
              height: MediaQuery.of(context).size.height * .25,
              repeat: true,
              animate: true,
              reverse: false,
            ),
          ));
  }
}
