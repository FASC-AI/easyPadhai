import 'package:flutter/material.dart';
import 'package:easy_pdf_viewer/easy_pdf_viewer.dart';
import 'package:lottie/lottie.dart';

class HomePage extends StatefulWidget {
  String url;
  String title;

  HomePage({super.key, required this.url, required this.title});

  @override
  _HomePage createState() => _HomePage(url: url, title: title);
}

class _HomePage extends State<HomePage> {
  String url;
  String title;
  bool _isLoading = true;
  late PDFDocument document;
  _HomePage({required this.url, required this.title});

  @override
  void initState() {
    super.initState();
    loadDocument();
  }

  loadDocument() async {
    document = await PDFDocument.fromURL(widget.url);

    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text(
            widget.title,
            maxLines: 1,
            style: const TextStyle(
              overflow: TextOverflow.ellipsis,
              color: Colors.black,
              fontSize: 20,
              fontFamily: 'SF Pro Display',
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        body: Center(
            child: _isLoading
                ? Center(
              child: Lottie.asset(
                'assets/loading.json',
                width: MediaQuery.of(context).size.width * .2,
                height: MediaQuery.of(context).size.height * .2,
                repeat: true,
                animate: true,
                reverse: false,
              ),
            )
                : PDFViewer(
                    document: document,
                    lazyLoad: false,
                    zoomSteps: 1,
                    numberPickerConfirmWidget: const Text(
                      "Confirm",
                    ),
                  )));
  }
}
