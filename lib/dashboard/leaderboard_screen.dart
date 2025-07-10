import 'package:easy_padhai/common/app_storage.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/custom_widgets/custom_appbar.dart';
import 'package:easy_padhai/custom_widgets/custom_nav_bar.dart';
import 'package:easy_padhai/dashboard/teacher_bottomsheet.dart';
import 'package:easy_padhai/model/batchlist_model.dart';
import 'package:easy_padhai/model/leader_model.dart';
import 'package:easy_padhai/model/profile_model.dart';
import 'package:easy_padhai/model/test_marks_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:lottie/lottie.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({Key? key}) : super(key: key);

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  int _selectedTabIndex = 0;
  late List<ClassDetail> _tabs = [];
  List<LeaderModelData> _leaderboard = [];
  List<LeaderModelData1> _leaderboardData = [];
  DashboardController dashboardController = Get.find();
  String batch_id = "";
  List<TestMarksModelData> markList = [];
  String subId = "";
  bool isload = false;

  @override
  void initState() {
    super.initState();
    LoadData();
  }

  void LoadData() {
    setState(() {
      isload = true;
    });
    _tabs = dashboardController.profileModel?.data?.classDetail! ?? [];
    subId =
        dashboardController.profileModel?.data?.subjectDetail![0].sId! ?? "";

    getLeader();
    getAllMarks();
    setState(() {
      isload = false;
    });
  }

  Future<void> getLeader() async {
    String cls_id = _tabs[_selectedTabIndex].sId!;
    List<BbData> batches = dashboardController.batchlist;
    for (int i = 0; i < batches.length; i++) {
      if (batches[i].classId == cls_id) {
        batch_id = batches[i].id!;
        dashboardController.batchId.value = batch_id;
        await dashboardController.getleaderBoard(cls_id, subId, batch_id);
        setState(() {
          if (dashboardController.leaderList.isNotEmpty) {
            _leaderboard = dashboardController.leaderList;
            if (_leaderboard.isNotEmpty) {
              _leaderboardData = _leaderboard[0].data!;
            }
          } else {
            _leaderboard = [];
            _leaderboardData = [];
          }
        });
        break;
      } else {
        dashboardController.batchId.value = "";
        await dashboardController.getleaderBoard(cls_id, subId, batch_id);
        setState(() {
          if (dashboardController.leaderList.isNotEmpty) {
            _leaderboard = dashboardController.leaderList;
            if (_leaderboard.isNotEmpty) {
              _leaderboardData = _leaderboard[0].data!;
            }
          } else {
            _leaderboard = [];
            _leaderboardData = [];
          }
        });
      }
    }
  }

  Future<void> getAllMarks() async {
    String cls_id = _tabs[_selectedTabIndex].sId!;
    List<BbData> batches = dashboardController.batchlist;
    for (int i = 0; i < batches.length; i++) {
      if (batches[i].classId == cls_id) {
        batch_id = batches[i].id!;
        dashboardController.batchId.value = batch_id;
        await dashboardController.getStuTestMarks(cls_id, subId, batch_id);
        setState(() {
          if (dashboardController.marksList.isNotEmpty) {
            markList = dashboardController.marksList;
          } else {
            markList = [];
          }
        });
        break;
      } else {
        dashboardController.batchId.value = "";
        await dashboardController.getStuTestMarks(cls_id, subId, batch_id);
        setState(() {
          if (dashboardController.marksList.isNotEmpty) {
            markList = dashboardController.marksList;
          } else {
            markList = [];
          }
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: const CustomAppBar(
        text: "Leaderboard",
      ),
      body: !isload
          ? Column(
              children: [
                // Tab Bar
                Container(
                    margin: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Container(
                        constraints: BoxConstraints(
                          minWidth: MediaQuery.of(context)
                              .size
                              .width, // Ensure full width
                        ),
                        child: Row(
                          children: List.generate(
                            _tabs.length,
                            (index) => GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedTabIndex = index;
                                });
                                getLeader();
                                getAllMarks();
                              },
                              child: Container(
                                margin: const EdgeInsets.symmetric(
                                    horizontal: 4), // Add some spacing
                                padding: const EdgeInsets.symmetric(
                                    vertical: 12, horizontal: 16),
                                decoration: BoxDecoration(
                                  color: _selectedTabIndex == index
                                      ? const Color(0xFF1E88E5)
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(25),
                                ),
                                child: Text(
                                  _tabs[index].class1!,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    overflow: TextOverflow.ellipsis,
                                    color: _selectedTabIndex == index
                                        ? Colors.white
                                        : Colors.black87,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    )),

                // Leaderboard List - Now with dynamic height
                Expanded(
                  child: Column(
                    children: [
                      // Leaderboard List - Flexible part 1
                      Flexible(
                        flex: 4, // Takes 3 parts of available space
                        child: SingleChildScrollView(
                          padding: EdgeInsets.all(16),
                          child: Column(
                            children: List.generate(
                              _leaderboardData.length,
                              (index) {
                                final data = _leaderboardData[index];
                                String sanitizedUrl = "";
                                if (data.picture != null) {
                                  sanitizedUrl =
                                      data.picture!.replaceAll('%20', '');
                                }

                                return Column(children: [
                                  LeaderboardItem(
                                    rank: data.rank!,
                                    name: data.name!,
                                    score:
                                        "${data.totalObtained}/${data.totalPossible}",
                                    date: _leaderboard[0].publishedDate!,
                                    img: sanitizedUrl,
                                  ),
                                  if (index == 2) const SizedBox(height: 12),
                                ]);
                              },
                            ),
                          ),
                        ),
                      ),

                      // Date Filter Section - Flexible part 2
                      Flexible(
                        flex: 6, // Takes 2 parts of available space
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                offset: const Offset(0, -2),
                                blurRadius: 10,
                              ),
                            ],
                          ),
                          child: markList.isNotEmpty
                              ? Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: ListView.builder(
                                    shrinkWrap: true,
                                    itemCount: markList.length,
                                    itemBuilder: (context, index) {
                                      return Container(
                                        margin:
                                            const EdgeInsets.only(bottom: 8),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF5F5F5),
                                          borderRadius:
                                              BorderRadius.circular(12),
                                        ),
                                        child: _buildDateFilterTile(
                                          markList[index].publishedDate!,
                                          markList[index].submissions ?? [],
                                        ),
                                      );
                                    },
                                  ),
                                )
                              : Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Image.asset(
                                        'assets/no_notification.png', // Change with your icon/image path
                                        height: 80,
                                      ),
                                      const SizedBox(height: 10),
                                      const Text(
                                        "No data available",
                                        style: TextStyle(
                                          color: Colors.grey,
                                          fontSize: 16,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            )
          : Center(
              child: Lottie.asset(
                'assets/loading.json',
                width: MediaQuery.of(context).size.width * .2,
                height: MediaQuery.of(context).size.height * .2,
                repeat: true,
                animate: true,
                reverse: false,
              ),
            ),
      bottomNavigationBar: Obx(() => CustomBottomNavBar(
            currentIndex: dashboardController.currentIndex.value,
            onTap: (index) {
              if (index == 1) {
                // Assuming index 1 is for creating batch
                BatchHelperTeacher.showCreateBatchBottomSheet(context);
                //_showdoneBatchBottomSheet(context);
              } else if (index == 2) {
                // Assuming index 1 is for creating batch
                BatchHelperTeacher.showFollowBatchBottomSheetTeacher(context);
                //_showdoneBatchBottomSheet(context);
              } else {
                dashboardController.changeIndex(index);
              }
            },
          )),
    );
  }

  Widget studentScoreRow(String name, String score) {
    final isAbsent = score.toLowerCase() == "ab";

    return Visibility(
      visible: !isAbsent,
      child: ListTile(
        contentPadding: EdgeInsets.symmetric(vertical: 0),
        title: Text(
          overflow: TextOverflow.ellipsis,
          name,
          style: TextStyle(fontSize: 14),
        ),
        trailing: Container(
          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Color(0xFF186BA5),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            score,
            style: TextStyle(color: Colors.white, fontSize: 12),
          ),
        ),
      ),
    );
  }

  Widget _buildDateFilterTile(String date, List<Submissions> students) {
    return ExpansionTile(
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            date,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
          //  const Icon(Icons.keyboard_arrow_down, color: Colors.black54),
        ],
      ),
      children: [
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: students.length,
          itemBuilder: (context, index) {
            return Padding(
              padding: const EdgeInsets.only(left: 20, right: 20),
              child: studentScoreRow(
                students[index].name ?? 'Unknown',
                students[index].result ?? '0',
              ),
            );
          },
        ),
      ],
    );
  }
}

class LeaderboardItem extends StatelessWidget {
  final int rank;
  final String name;
  final String score;
  final String date;
  final String img;

  const LeaderboardItem(
      {Key? key,
      required this.rank,
      required this.name,
      required this.score,
      required this.date,
      required this.img})
      : super(key: key);

  Color _getBackgroundColor() {
    switch (rank) {
      case 1:
      case 2:
      case 3:
        return const Color(0xFF1E88E5); // Deeper blue for top 3
      default:
        return Colors.white;
    }
  }

  BorderRadius _getBorderRadius() {
    if (rank <= 3) {
      if (rank == 1) {
        // First item: round top corners only
        return const BorderRadius.only(
          topLeft: Radius.circular(12),
          topRight: Radius.circular(12),
        );
      } else if (rank == 3) {
        // Last item in top 3: round bottom corners only
        return const BorderRadius.only(
          bottomLeft: Radius.circular(12),
          bottomRight: Radius.circular(12),
        );
      } else {
        // Middle items: no rounded corners
        return BorderRadius.zero;
      }
    }
    // Non-top-3 items: round all corners
    return BorderRadius.circular(12);
  }

  EdgeInsets _getMargin() {
    if (rank <= 3) {
      return EdgeInsets.zero; // No margin for top 3
    }
    return const EdgeInsets.only(bottom: 12); // Normal margin for others
  }

  @override
  Widget build(BuildContext context) {
    final isTopRank = rank <= 3;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          if (!isTopRank)
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
        ],
      ),
      child: Row(
        children: [
          // Rank Circle
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isTopRank
                  ? Colors.white.withOpacity(0.2)
                  : const Color(0xFFF5F5F5),
            ),
            child: Text(
              '$rank',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isTopRank ? Colors.white : Colors.black87,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Profile Image

          CircleAvatar(
            radius: 20,
            backgroundImage: img.isNotEmpty
                ? NetworkImage(
                    img,
                    // Placeholder image
                  )
                : null,
            child: (img.isEmpty)
                ? Text(
                    userName().isNotEmpty ? userName()[0].toUpperCase() : '',
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 12),

          // Name and Date
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      name,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isTopRank ? Colors.white : Colors.black87,
                      ),
                    ),
                    if (isTopRank) ...[
                      const SizedBox(width: 4),
                      Icon(
                        Icons.workspace_premium,
                        size: 16,
                        color: Colors.yellow[600],
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  date,
                  style: TextStyle(
                    fontSize: 12,
                    color: isTopRank
                        ? Colors.white.withOpacity(0.7)
                        : Colors.black54,
                  ),
                ),
              ],
            ),
          ),

          // Score
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color:
                  isTopRank ? Colors.white.withOpacity(0.15) : Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '$score',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isTopRank
                        ? const Color(0xFF40C4FF) // Cyan color for top ranks
                        : const Color(0xFF1E88E5),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Keep your LeaderboardItem class the same as before