import 'dart:async';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/auth_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_searchbar.dart';
import 'package:easy_padhai/model/institution_list_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

class StateView extends StatefulWidget {
  const StateView({super.key});

  @override
  State<StateView> createState() => _StateViewState();
}

class _StateViewState extends State<StateView> {
  final codeController = TextEditingController();
  final formKey = GlobalKey<FormState>();
  AuthController authController = Get.find();

  late List<InstitutesList> filteredData = [];
  bool isLoading = false;
  Timer? debouncer;
  String query = '';
  int selectedIndex = -1;

  @override
  void dispose() {
    if (debouncer != null) {
      debouncer!.cancel();
    }

    super.dispose();
  }

  void debounce(
    VoidCallback callback, {
    Duration duration = const Duration(milliseconds: 1000),
  }) {
    if (debouncer != null) {
      debouncer!.cancel();
    }
    debouncer = Timer(duration, callback);
  }

  @override
  void initState() {
    getData();
    super.initState();
  }

  getData() async {
    setState(() {
      isLoading = false;
    });
    filteredData = await authController.searchInstitutes(query) ?? [];
    setState(() {
      isLoading = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    double listItemHeight = 56;
    double dialogHeight = (filteredData.length * listItemHeight)
        .clamp(100.0, MediaQuery.of(context).size.height * 0.7);

    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Expanded(
                    child: Center(
                        child: Text(
                  'Select Institute',
                  style: TextStyle(
                      color: AppColors.black,
                      fontWeight: FontWeight.w500,
                      fontSize: MediaQuery.of(context).size.width * .04),
                ))),
                GestureDetector(
                  onTap: () {
                    Get.back(result: true);
                  },
                  child: const Icon(
                    Icons.cancel_outlined,
                    color: AppColors.red,
                  ),
                ),
              ],
            ),
            SearchWidget(
              text: query,
              onChanged: searchTitle,
            ),
            isLoading
                ? SizedBox(
                    height: dialogHeight,
                    child: CustomScrollView(
                      slivers: [
                        SliverToBoxAdapter(
                            child: filteredData.isNotEmpty
                                ? ListView.separated(
                                    physics: const BouncingScrollPhysics(),
                                    itemCount: filteredData.length,
                                    shrinkWrap: true,
                                    scrollDirection: Axis.vertical,
                                    separatorBuilder: (context, index) {
                                      return const Divider(
                                        color: AppColors.bgColor,
                                        height: 0,
                                      );
                                    },
                                    itemBuilder: (context, index) {
                                      return ListTile(
                                          tileColor: index == selectedIndex
                                              ? AppColors.theme
                                              : Colors.white,
                                          onTap: () async {
                                            authController.instituteName.value =
                                                filteredData[index]
                                                    .institutesName
                                                    .toString();
                                            authController.instituteId.value =
                                                filteredData[index]
                                                    .sId
                                                    .toString();

                                            Get.back(result: true);
                                          },
                                          contentPadding:
                                              const EdgeInsets.only(left: 30),
                                          title: Text(
                                            filteredData[index]
                                                .institutesName
                                                .toString(),
                                            style: TextStyle(
                                              fontSize: MediaQuery.of(context)
                                                      .size
                                                      .width *
                                                  .035,
                                              fontWeight: FontWeight.normal,
                                              color: index == selectedIndex
                                                  ? AppColors.theme
                                                  : Colors.black,
                                            ),
                                          ),
                                          trailing: Padding(
                                            padding: const EdgeInsets.only(
                                                right: 26.0),
                                            child: Icon(
                                              Icons
                                                  .check_circle_outline_outlined,
                                              size: 16,
                                              color: index == selectedIndex
                                                  ? AppColors.theme
                                                  : Colors.white,
                                            ),
                                          ));
                                    })
                                : Center(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Lottie.asset(
                                          'assets/nodata.json',
                                          width: MediaQuery.of(context)
                                                  .size
                                                  .width *
                                              .2,
                                          repeat: true,
                                          animate: true,
                                          reverse: false,
                                        ),
                                        Text(
                                          'No Content',
                                          style: TextStyle(
                                              fontSize: MediaQuery.of(context)
                                                      .size
                                                      .width *
                                                  .04,
                                              color: AppColors.black,
                                              fontWeight: FontWeight.w500),
                                        ),
                                      ],
                                    ),
                                  ))
                      ],
                    ),
                  )
                : SizedBox(
                    height: MediaQuery.of(context).size.height * .5,
                    child: const Center(
                      child: CircularProgressIndicator(
                        backgroundColor: AppColors.theme,
                        color: AppColors.white,
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  void searchTitle(String query) async => debounce(() async {
        filteredData = await authController.searchInstitutes(query) ?? [];
        // ignore: unnecessary_null_comparison
        if (filteredData != null) {
          if (!mounted) return;
          setState(() {
            this.query = query;
            filteredData = filteredData;
          });
        }
      });
}
