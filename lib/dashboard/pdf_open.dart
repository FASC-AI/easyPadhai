import 'dart:io';
import 'dart:typed_data';
import 'package:easy_padhai/common/constant.dart';
import 'package:easy_padhai/controller/dashboard_controller.dart';
import 'package:easy_padhai/dashboard/downloadpdf.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:permission_handler/permission_handler.dart';

class PdfViewerScreen extends StatelessWidget {
  final Uint8List pdfBytes;
  String sub;
  String classid;
  String top;
  String lesson;
  List<String> quesId;
  String sess;
  String dur;
  String book;
  String ids;
  List<String> selectedInstructions;
  PdfViewerScreen(
      {Key? key,
      required this.pdfBytes,
      required this.sub,
      required this.classid,
      required this.top,
      required this.lesson,
      required this.quesId,
      required this.sess,
      required this.dur,
      required this.book,
      required this.ids,
      required this.selectedInstructions})
      : super(key: key);

  DashboardController dashboardController = Get.find();
  bool isSave = false;

  Future<void> downloadPdf(BuildContext context) async {
    await PdfDownloader.downloadAndOpenPdf(
      pdfBytes: pdfBytes,
      fileName: 'document-${DateTime.now().millisecondsSinceEpoch}.pdf',
      context: context,
    );
  }

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
        // actions: [
        //   IconButton(
        //     icon: Icon(Icons.download),
        //     onPressed: () async {
        //       // Implement save functionality if needed
        //       // final dir = await getTemporaryDirectory();
        //       // final file = File(
        //       //     '${dir.path}/document-${DateTime.now().millisecondsSinceEpoch}.pdf');
        //       // await file.writeAsBytes(pdfBytes);
        //       // Get.snackbar("Success", "PDF saved to ${file.path}");
        //       downloadPdf();
        //     },
        //   ),
        // ],
      ),
      body: SfPdfViewer.memory(
        pdfBytes,
        canShowScrollHead: true,
        canShowScrollStatus: true,
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.only(
            left: 30, right: 30, bottom: 10), // optional for spacing
        child: SizedBox(
          width: 150, // Set button width here
          child: ElevatedButton(
            onPressed: () async {
              downloadPdf(context);
              // String isoTimestamp = DateTime.now().toIso8601String();
              if (!isSave) {
                await dashboardController.saveOffline(
                    sub,
                    classid,
                    top,
                    lesson,
                    quesId,
                    sess,
                    dur,
                    book,
                    ids,
                    context,
                    selectedInstructions);
                isSave = true;
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.theme,
            ),
            child: const Text(
              "Download as PDF",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
