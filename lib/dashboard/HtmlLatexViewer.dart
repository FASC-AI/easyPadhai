import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class HtmlLatexViewer extends StatefulWidget {
  final String htmlContent;
  final double? maxHeight; // Optional maximum height
  final double? minHeight; // Optional minimum height

  const HtmlLatexViewer({
    Key? key,
    required this.htmlContent,
    this.maxHeight,
    this.minHeight,
  }) : super(key: key);

  @override
  State<HtmlLatexViewer> createState() => _HtmlLatexViewerState();
}

class _HtmlLatexViewerState extends State<HtmlLatexViewer> {
  late final WebViewController _controller;
  final _webViewHeight = ValueNotifier<double>(100); // Initial minimum height
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) async {
          // Get the actual content height after rendering
          final height = await _controller.runJavaScriptReturningResult(
            'document.documentElement.scrollHeight;',
          ) as double;

          if (mounted) {
            setState(() {
              _webViewHeight.value = height;
              _isLoading = false;
            });
          }
        },
      ))
      ..loadHtmlString(_buildHtml(widget.htmlContent));
  }

  String _buildHtml(String content) {
    return '''
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async
      src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
    </script>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
      }
      .content {
        padding: 12px;
        font-family: Arial;
        font-size: 16px;
      }
      img {
        max-width: 100%;
        height: auto;
      }
    </style>
  </head>
  <body>
    <div class="content">
      $content
    </div>
  </body>
</html>
''';
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<double>(
      valueListenable: _webViewHeight,
      builder: (context, height, child) {
        return ConstrainedBox(
          constraints: BoxConstraints(
            minHeight: widget.minHeight ?? 0,
            maxHeight: widget.maxHeight ?? double.infinity,
          ),
          child: SizedBox(
            height: _isLoading ? widget.minHeight ?? 100 : height,
            child: WebViewWidget(
              controller: _controller,
              // Important for proper sizing
              gestureRecognizers: Set()
                ..add(Factory<VerticalDragGestureRecognizer>(
                  () => VerticalDragGestureRecognizer(),
                )),
          ),
        ));
      },
    );
  }

  @override
  void dispose() {
    _webViewHeight.dispose();
    super.dispose();
  }
}