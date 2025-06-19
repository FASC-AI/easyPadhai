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

            const SizedBox(height: 16),

            /// Buttons Row
            Center(
              child: Wrap(
                spacing: 12,
                runSpacing: 12,
                alignment: WrapAlignment.center,
                children: [
                  SizedBox(
                    width: screenWidth * 0.4,
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
                  SizedBox(
                    width: screenWidth * 0.4,
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
