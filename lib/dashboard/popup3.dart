import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/model/offline_test_list.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:flutter/material.dart';

class OfflineTestListPopup extends StatelessWidget {
  final List<OfflineTestListData> testList;
  final VoidCallback onCreateNew;
  final Function(OfflineTestListData) onEdit;
  final Function(OfflineTestListData) onDelete;
  // final void Function(List<Tests>) onOptionSelect;

  const OfflineTestListPopup({
    Key? key,
    required this.testList,
    required this.onCreateNew,
    required this.onEdit,
    required this.onDelete,
    // required this.onOptionSelect,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: screenHeight * 0.8,
          maxWidth: screenWidth * 0.9,
        ),
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                /// Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Offline Test List',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),

                /// Create New Button
                Align(
                  alignment: Alignment.topRight,
                  child: ElevatedButton(
                    onPressed: onCreateNew,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.theme,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      'Create New',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                /// Test List
                testList.isNotEmpty
                    ? SizedBox(
                        height: screenHeight * 0.5,
                        child: ListView.builder(
                          itemCount: testList.length,
                          itemBuilder: (context, index) {
                            return Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xffF2F2F2),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppColors.grey),
                              ),
                              child: ListTile(
                                leading: Text(
                                  "${index + 1}.",
                                  style: const TextStyle(fontSize: 14),
                                ),
                                title: Text(
                                  "Offline Test ${index + 1}",
                                ),
                                trailing: PopupMenuButton<String>(
                                  onSelected: (value) {
                                    if (value == 'edit') {
                                      onEdit(testList[index]);
                                    } else if (value == 'delete') {
                                      onDelete(testList[index]);
                                    }
                                  },
                                  itemBuilder: (context) => [
                                    const PopupMenuItem(
                                      value: 'edit',
                                      child: Text('Edit'),
                                    ),
                                    const PopupMenuItem(
                                      value: 'delete',
                                      child: Text('Delete'),
                                    ),
                                  ],
                                  icon: const Icon(Icons.more_vert),
                                ),
                              ),
                            );
                          },
                        ),
                      )
                    : const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Text(
                            "No Offline Tests",
                            style: TextStyle(color: Colors.grey),
                          ),
                        ),
                      ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
