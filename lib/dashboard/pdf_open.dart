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
import 'package:open_file/open_file.dart';

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
      : super(key: key) {
    // Debug information
    print('🔍 PdfViewerScreen initialized');
    print('📊 PDF bytes length: ${pdfBytes.length}');
    print('📁 Subject: $sub');
    print('🏫 Class: $classid');
    print('📚 Book: $book');
    print('📝 Questions count: ${quesId.length}');
    print('⏰ Session: $sess');
    print('⏱️ Duration: $dur');
    print('📋 Instructions count: ${selectedInstructions.length}');
  }

  DashboardController dashboardController = Get.find();
  bool isSave = false;

  Future<void> downloadPdf(BuildContext context) async {
    try {
      print('📥 Starting PDF download...');
      print('📊 PDF size: ${pdfBytes.length} bytes');
      
      if (pdfBytes.isEmpty) {
        print('❌ PDF bytes are empty!');
        Get.snackbar(
          "Error", 
          "PDF data is empty. Please try again.",
          snackPosition: SnackPosition.BOTTOM,
          duration: Duration(seconds: 3),
        );
        return;
      }
      
      // Use the existing PdfDownloader but with better error handling
      await PdfDownloader.downloadAndOpenPdf(
        pdfBytes: pdfBytes,
        fileName: 'document-${DateTime.now().millisecondsSinceEpoch}.pdf',
        context: context,
      );
      
      print('✅ PDF download completed successfully');
    } catch (e) {
      print('❌ PDF download failed: $e');
      
      // Try alternative simple download method
      try {
        print('🔄 Trying alternative download method...');
        await _simpleDownloadPdf(context);
      } catch (e2) {
        print('❌ Alternative method also failed: $e2');
        Get.snackbar(
          "Download Failed", 
          "Failed to download PDF. Please check storage permissions.",
          snackPosition: SnackPosition.BOTTOM,
          duration: Duration(seconds: 5),
        );
      }
    }
  }
  
  Future<void> _simpleDownloadPdf(BuildContext context) async {
    try {
      // Get the documents directory as fallback
      final Directory documentsDir = await getApplicationDocumentsDirectory();
      
      // Create Easy Padhai folder
      final Directory easyPadhaiDir = Directory('${documentsDir.path}/Easy Padhai');
      if (!await easyPadhaiDir.exists()) {
        await easyPadhaiDir.create(recursive: true);
      }
      
      // Generate filename
      final String fileName = 'document-${DateTime.now().millisecondsSinceEpoch}.pdf';
      final String filePath = '${easyPadhaiDir.path}/$fileName';
      
      // Write PDF file
      final File file = File(filePath);
      await file.writeAsBytes(pdfBytes);
      
      print('✅ PDF saved to: $filePath');
      
      Get.snackbar(
        "Success", 
        "PDF saved to Documents/Easy Padhai folder",
        snackPosition: SnackPosition.BOTTOM,
        duration: Duration(seconds: 3),
        mainButton: TextButton(
          onPressed: () => OpenFile.open(filePath),
          child: const Text('OPEN', style: TextStyle(color: Colors.white)),
        ),
      );
    } catch (e) {
      print('❌ Simple download failed: $e');
      rethrow;
    }
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
      body: pdfBytes.isNotEmpty 
        ? SfPdfViewer.memory(
            pdfBytes,
            canShowScrollHead: true,
            canShowScrollStatus: true,
          )
        : Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error, size: 64, color: Colors.red),
                SizedBox(height: 16),
                Text(
                  'PDF data is empty or corrupted',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text(
                  'Size: ${pdfBytes.length} bytes',
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.only(
            left: 30, right: 30, bottom: 10), // optional for spacing
        child: SizedBox(
          width: 150, // Set button width here
          child: ElevatedButton(
            onPressed: () async {
              try {
                print('🔄 Starting PDF download and save process...');
                
                // First download the PDF
                await downloadPdf(context);
                
                // Then save to offline if not already saved
                if (!isSave) {
                  print('💾 Saving to offline...');
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
                  print('✅ Offline save completed');
                } else {
                  print('ℹ️ Already saved to offline');
                }
              } catch (e) {
                print('❌ Error in download/save process: $e');
                Get.snackbar(
                  "Error", 
                  "Failed to process PDF: $e",
                  snackPosition: SnackPosition.BOTTOM,
                  duration: Duration(seconds: 5),
                );
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
