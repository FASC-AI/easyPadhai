package com.troology.easypadhai



import android.content.Intent
import android.net.Uri
import android.os.Environment
import androidx.core.content.FileProvider
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.example/pdf_downloader"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "scanMedia" -> {
                    val path = call.argument<String>("path")
                    if (path != null) {
                        scanMedia(path)
                        result.success(null)
                    } else {
                        result.error("INVALID_PATH", "Path was null", null)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun scanMedia(path: String) {
        val file = File(path)
        val intent = Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE)
        intent.data = Uri.fromFile(file)
        sendBroadcast(intent)
    }
}
