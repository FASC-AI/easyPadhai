import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/material.dart';

class ModeSelectionPopup extends StatelessWidget {
  final VoidCallback onQuestionPaper;
  final VoidCallback onOnlineTest;

  const ModeSelectionPopup({
    Key? key,
    required this.onQuestionPaper,
    required this.onOnlineTest,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;

    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.all(screenWidth * 0.04), // responsive padding
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /// Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: const Text(
                    'Create a Test: Choose Mode',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),

            const SizedBox(height: 20),

            /// Buttons Row
            Center(
              child: Wrap(
                spacing: 2,
                runSpacing: 2,
                alignment: WrapAlignment.center,
                children: [
                  Container(
                    width: screenWidth * 0.8,
                    margin: const EdgeInsets.symmetric(vertical: 0),
                    child: ElevatedButton(
                      onPressed: onQuestionPaper,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.theme,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Question Paper',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppColors.white),
                      ),
                    ),
                  ),
                  Container(
                    width: screenWidth * 0.8,
                    margin: const EdgeInsets.symmetric(vertical: 0),
                    child: OutlinedButton(
                      onPressed: onOnlineTest,
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: Colors.grey),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Online Test',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.black),
                      ),
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
