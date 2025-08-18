import 'dart:typed_data';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:get/get.dart';
import 'package:open_file/open_file.dart';
import 'package:intl/intl.dart';
import 'package:easy_padhai/common/platform_helper.dart';

class PdfDownloader {
  static Future<void> downloadAndOpenPdf({
    required List<int> pdfBytes,
    required String fileName,
    required BuildContext context,
  }) async {
    try {
      // Show loading indicator
      Get.dialog(
        const Center(child: CircularProgressIndicator()),
        barrierDismissible: false,
      );

      // Save the PDF file
      final File? file =
          await savePdfFile(pdfBytes, fileName: fileName, context: context);

      Get.back(); // Dismiss loading dialog

      if (file == null) {
        // print(e);
        _showErrorSnackbar('Failed to save PDF: Permission denied');

        return;
      }
      print(file.path);
      // Show success message
      _showSuccessSnackbar(
          'PDF saved successfully in Download -> Easy Padhai', file.path);

      // Open the file
      // await OpenFile.open(file.path).then((result) {
      //   if (result.type != ResultType.done) {
      //     _showErrorSnackbar('Failed to open PDF: ${result.message}');
      //   }
      // });
    } catch (e) {
      Get.back(); // Dismiss loading dialog if still showing
      print(e);
      _showErrorSnackbar('Error: ${e.toString()}');
    }
  }

  static Future<File?> savePdfFile(List<int> pdfBytes,
      {required String fileName, required BuildContext context}) async {
    try {
      // 1. Check and request permissions
      // if (Platform.isAndroid) {
      //   // For Android 10 (API 29) and above
      //   if (await Permission.manageExternalStorage.isDenied) {
      //     final status = await Permission.manageExternalStorage.request();
      //     if (!status.isGranted) {
      //       return null;
      //     }
      //   }

      //   // For older versions
      //   if (await Permission.storage.isDenied) {
      //     final status = await Permission.storage.request();
      //     if (!status.isGranted) {
      //       return null;
      //     }
      //   }
      // }
      // final granted = await requestStoragePermission();

      // Proceed with file operations
      Directory? targetDir;

      if (PlatformHelper.isAndroid) {
        // Try multiple locations with fallbacks
        try {
          // First try the standard Downloads directory
          targetDir = Directory('/storage/emulated/0/Download');
          if (!await targetDir.exists()) {
            await targetDir.create(recursive: true);
          }
        } catch (e) {
          // Fallback to external storage directory
          targetDir = await getApplicationDocumentsDirectory();
        }
      } else {
        // For iOS, use documents directory
        targetDir = await getApplicationDocumentsDirectory();
      }

      // 3. Create app-specific subdirectory
      final Directory easyPadhaiDir =
          Directory('${targetDir!.path}/Easy Padhai');

      try {
        if (!await easyPadhaiDir.exists()) {
          await easyPadhaiDir.create(recursive: true);
        }
      } catch (e) {
        // Final fallback to temporary directory
        print(e);

        targetDir = await getExternalStorageDirectory();
        final Directory fallbackDir =
            Directory('${targetDir?.path}/Easy Padhai');
        if (!await fallbackDir.exists()) {
          await fallbackDir.create(recursive: true);
        }
        return _saveFile(fallbackDir, pdfBytes, fileName);
      }

      return _saveFile(easyPadhaiDir, pdfBytes, fileName);

      // 2. Get the appropriate directory
    } catch (e) {
      return null;
    }
    // Directory? directory;
    // if (Platform.isAndroid) {
    //   // App-specific external files dir: /storage/emulated/0/Android/data/<package>/files
    //   directory = await getExternalStorageDirectory();
    // } else {
    //   directory = await getApplicationDocumentsDirectory();
    // }

    // final easyPadhaiDir = Directory('${directory!.path}/Easy Padhai');
    // if (!await easyPadhaiDir.exists()) {
    //   await easyPadhaiDir.create(recursive: true);
    // }

    // final filePath = '${easyPadhaiDir.path}/$fileName';
    // final file = await File(filePath).writeAsBytes(pdfBytes);
    // return file;
  }

  static Future<bool?> requestStoragePermission() async {
    if (PlatformHelper.isAndroid) {
      // For Android 11+ (API 30+), use manageExternalStorage
      if (await Permission.manageExternalStorage.isDenied) {
        final status = await Permission.manageExternalStorage.request();
        if (!status.isGranted) {
          return false;
        }
      }

      // For Android 10 and below, use storage permission
      if (await Permission.storage.isDenied) {
        final status = await Permission.storage.request();
        if (!status.isGranted) {
          return false;
        }
      }

      return true;
    }

    return null; // Not Android
  }

  static Future<File> _saveFile(
    Directory dir,
    List<int> pdfBytes,
    String fileName,
  ) async {
    final String filePath = '${dir.path}/$fileName';
    final File file = await File(filePath).writeAsBytes(pdfBytes);

    // Make file visible in gallery/file managers (Android)
    if (PlatformHelper.isAndroid) {
      await _scanMedia(file.path);
    }

    return file;
  }

  // Android-specific: Make file visible in gallery/file managers
  static Future<void> _scanMedia(String filePath) async {
    if (PlatformHelper.isAndroid) {
      try {
        const MethodChannel platform =
            MethodChannel('com.example/pdf_downloader');
        await platform.invokeMethod('scanMedia', {'path': filePath});
      } catch (e) {
        debugPrint("Media scan failed: $e");
      }
    }
  }

  static void _showSuccessSnackbar(String message, String filePath) {
    Get.snackbar(
      'Success',
      message,
      backgroundColor: Colors.green,
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 3),
      mainButton: TextButton(
        onPressed: () => OpenFile.open(filePath),
        child: const Text(
          'OPEN',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  static void _showErrorSnackbar(String message) {
    Get.snackbar(
      'Error',
      message,
      backgroundColor: Colors.red,
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 3),
    );
  }
}
