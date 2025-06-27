import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/dashboard/HtmlLatexViewer.dart';
import 'package:easy_padhai/model/instruc_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';

class InstructionPopup extends StatefulWidget {
  final List<English> englishInstructions;
  final List<Hindi> hindiInstructions;
  final List<String> preSelectedIds; // 👈 Add this

  const InstructionPopup({
    super.key,
    required this.englishInstructions,
    required this.hindiInstructions,
    required this.preSelectedIds, // 👈 Required input
  });
  @override
  State<InstructionPopup> createState() => _InstructionPopupState();
}

class _InstructionPopupState extends State<InstructionPopup> {
  List<bool> selectedEnglish = [];
  List<bool> selectedHindi = [];

  @override
  void initState() {
    super.initState();
    selectedEnglish = List<bool>.generate(
      widget.englishInstructions.length,
      (index) =>
          widget.preSelectedIds.contains(widget.englishInstructions[index].sId),
    );
    selectedHindi = List<bool>.generate(
      widget.hindiInstructions.length,
      (index) =>
          widget.preSelectedIds.contains(widget.hindiInstructions[index].sId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      //  title: const Text("Select Instructions"),
      content: ConstrainedBox(
        constraints:
            BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.6),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(
                    child: const Text(
                      'Select Instructions',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const Text("English",
                  style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ...List.generate(widget.englishInstructions.length, (index) {
                return CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  value: selectedEnglish[index],
                  onChanged: (val) {
                    setState(() => selectedEnglish[index] = val!);
                  },
                  title: Html(
                    data: widget.englishInstructions[index].description!,
                  ),
                  // title: HtmlLatexViewer(
                  //   htmlContent: widget.englishInstructions[index].description!,
                  //   minHeight: 24,
                  // ),
                );
              }),
              const SizedBox(height: 12),
              const Text("Hindi",
                  style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ...List.generate(widget.hindiInstructions.length, (index) {
                return CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  value: selectedHindi[index],
                  onChanged: (val) {
                    setState(() => selectedHindi[index] = val!);
                  },
                  title: Html(
                    data: widget.hindiInstructions[index].hindi!,
                  ),
                  // title: HtmlLatexViewer(
                  //   htmlContent: widget.hindiInstructions[index].hindi!,
                  //   minHeight: 24,
                  // ),
                );
              }),
            ],
          ),
        ),
      ),
      actions: [
        Center(
          child: SizedBox(
            width: 100,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.theme,
              ),
              onPressed: () {
                // Combine selected instructions
                List<String> selected = [];

                for (int i = 0; i < widget.englishInstructions.length; i++) {
                  if (selectedEnglish[i]) {
                    selected.add(widget.englishInstructions[i].sId!);
                  }
                }

                for (int i = 0; i < widget.hindiInstructions.length; i++) {
                  if (selectedHindi[i]) {
                    selected.add(widget.hindiInstructions[i].sId!);
                  }
                }

                // Return the selected list
                Navigator.pop(context, selected);
              },
              child: const Text(
                "Add",
                style:
                    TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
