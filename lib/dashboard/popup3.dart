import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/model/online_test_model1.dart';
import 'package:flutter/material.dart';

class OfflineTestListPopup extends StatelessWidget {
  final List<OnlineTestModel1Data> testList;
  final VoidCallback onCreateNew;
  final void Function(String) onOptionSelect;

  const OfflineTestListPopup({
    Key? key,
    required this.testList,
    required this.onCreateNew,
    required this.onOptionSelect,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Offline Question Paper List',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                )
              ],
            ),
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
            ListView.builder(
              shrinkWrap: true,
              itemCount: testList.length,
              itemBuilder: (context, index) {
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  decoration: BoxDecoration(
                      color: Color(0xffF2F2F2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.grey)),
                  child: ListTile(
                    leading: Text(
                      "${(index + 1).toString()}.",
                      style: TextStyle(fontSize: 14),
                    ),
                    title:
                        Text("Online Test(${testList[index].publishedDate!})"),
                    trailing: IconButton(
                      icon: const Icon(Icons.more_vert),
                      onPressed: () =>
                          onOptionSelect(testList[index].publishedDate!),
                    ),
                  ),
                );
              },
            )
          ],
        ),
      ),
    );
  }
}
