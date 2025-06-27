import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/dashboard/HtmlLatexViewer.dart';
import 'package:easy_padhai/model/instruc_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';

class InstructionPopup extends StatefulWidget {
  final List<English> englishInstructions;
  final List<Hindi> hindiInstructions;
  final List<String> preSelectedIds;

  const InstructionPopup({
    super.key,
    required this.englishInstructions,
    required this.hindiInstructions,
    required this.preSelectedIds,
  });

  @override
  State<InstructionPopup> createState() => _InstructionPopupState();
}

class _InstructionPopupState extends State<InstructionPopup> {
  late List<bool> selectedEnglish;
  late List<bool> selectedHindi;
  List<String> pop = [];

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
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      content: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.7,
          minWidth: MediaQuery.of(context).size.width * 0.8,
          maxWidth: MediaQuery.of(context).size.width * 0.9,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Select Instructions',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  padding: EdgeInsets.zero,
                  visualDensity: VisualDensity.compact,
                  onPressed: () => Navigator.pop(context, pop),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.5,
              width: MediaQuery.of(context).size.width * 0.9,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (widget.englishInstructions.isNotEmpty) ...[
                      const Text(
                        "English",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ...List.generate(widget.englishInstructions.length,
                          (index) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: selectedEnglish[index]
                                ? Colors.blue.shade50
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: CheckboxListTile(
                            contentPadding:
                                const EdgeInsets.symmetric(horizontal: 8),
                            dense: true,
                            controlAffinity: ListTileControlAffinity.leading,
                            visualDensity: VisualDensity.compact,
                            value: selectedEnglish[index],
                            onChanged: (val) {
                              setState(() => selectedEnglish[index] = val!);
                            },
                            title: Html(
                              data: widget
                                  .englishInstructions[index].description!,
                              style: {
                                "body": Style(
                                  // margin: EdgeInsets.zero,
                                  // padding: EdgeInsets.zero,

                                  fontSize: FontSize(14),
                                ),
                              },
                            ),
                          ),
                        );
                      }),
                      const SizedBox(height: 16),
                    ],
                    if (widget.hindiInstructions.isNotEmpty) ...[
                      const Text(
                        "Hindi",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ...List.generate(widget.hindiInstructions.length,
                          (index) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: selectedHindi[index]
                                ? Colors.blue.shade50
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: CheckboxListTile(
                            contentPadding:
                                const EdgeInsets.symmetric(horizontal: 8),
                            dense: true,
                            controlAffinity: ListTileControlAffinity.leading,
                            visualDensity: VisualDensity.compact,
                            value: selectedHindi[index],
                            onChanged: (val) {
                              setState(() => selectedHindi[index] = val!);
                            },
                            title: Html(
                              data: widget.hindiInstructions[index].hindi!,
                              style: {
                                "body": Style(
                                  // margin: EdgeInsets.zero,
                                  // padding: EdgeInsets.zero,
                                  fontSize: FontSize(14),
                                ),
                              },
                            ),
                          ),
                        );
                      }),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      actionsPadding: const EdgeInsets.only(bottom: 16, right: 16, left: 16),
      actions: [
        Center(
          child: SizedBox(
            width: 150,
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
