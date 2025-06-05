import 'dart:io';
import 'dart:typed_data';
import 'package:easy_padhai/common/constant.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

class PdfViewerScreen extends StatelessWidget {
  final Uint8List pdfBytes;

  const PdfViewerScreen({Key? key, required this.pdfBytes}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.theme,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        leadingWidth: MediaQuery.of(context).size.width * .13,
        title: Text(
          "PDF Viewer",
          style: TextStyle(
            color: AppColors.white,
            fontSize: MediaQuery.of(context).size.width * 0.045,
            fontWeight: FontWeight.w600,
          ),
        ),
        leading: IconButton(
          padding: const EdgeInsets.only(
            left: 20,
          ),
          icon: Image.asset(
            'assets/back.png',
            fit: BoxFit.fill,
            width: MediaQuery.of(context).size.width * 0.09,
          ),
          onPressed: () {
            Navigator.pop(context);
            Navigator.pop(context);
          },
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.download),
            onPressed: () async {
              // Implement save functionality if needed
              final dir = await getTemporaryDirectory();
              final file = File(
                  '${dir.path}/document-${DateTime.now().millisecondsSinceEpoch}.pdf');
              await file.writeAsBytes(pdfBytes);
              Get.snackbar("Success", "PDF saved to ${file.path}");
            },
          ),
        ],
      ),
      body: SfPdfViewer.memory(
        pdfBytes,
        canShowScrollHead: true,
        canShowScrollStatus: true,
      ),
    );
  }
}
