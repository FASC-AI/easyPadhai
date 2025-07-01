import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class HtmlLatexViewer extends StatefulWidget {
  final String htmlContent;
  final double? maxHeight;
  final double? minHeight;

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
  final _webViewHeight = ValueNotifier<double>(100);
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) => _updateHeight(),
      ));
    _loadContent();
  }

  @override
  void didUpdateWidget(HtmlLatexViewer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.htmlContent != widget.htmlContent) {
      _loadContent();
    }
  }

  Future<void> _loadContent() async {
    setState(() => _isLoading = true);
    await _controller.loadHtmlString(_buildHtml(widget.htmlContent));
  }

  Future<void> _updateHeight() async {
    try {
      final result = await _controller.runJavaScriptReturningResult(
        'document.documentElement.scrollHeight;',
      );

      double height = 100;
      if (result is int) {
        height = result.toDouble();
      } else if (result is double) {
        height = result;
      } else if (result is String) {
        height = double.tryParse(result) ?? 100;
      }

      if (mounted) {
        setState(() {
          _webViewHeight.value = height.clamp(
            widget.minHeight ?? 0,
            widget.maxHeight ?? double.infinity,
          );
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      debugPrint('Error updating height: $e');
    }
  }

  final _htmlCache = <String, String>{};

  String _buildHtml(String content) {
    return _htmlCache[content] ??= '''
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
     window.MathJax = {
        options: {
          enableMenu: false
        },
        loader: {
          load: ['input/tex', 'output/chtml']
        },
        chtml: {
          useGlobalCache: false
        },
        startup: {
          ready: () => {
            MathJax.startup.defaultReady();
            MathJax.config.chtml.useGlobalCache = false;
          }
        }
      };
      // MathJax = {
      //   options: {
      //     enableLocalStorage: false,
      //     ignoreHtmlClass: 'tex2jax_ignore',
      //     processHtmlClass: 'mathjax_process'
      //   },
      //   tex: {
      //     inlineMath: [['\$', '\$'], ['\\(', '\\)']]
      //   }
      // };
    </script>
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
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 16px;
        word-wrap: break-word;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      .mathjax_process {
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <div class="content mathjax_process">
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
              gestureRecognizers: Set()
                ..add(Factory<VerticalDragGestureRecognizer>(
                  () => VerticalDragGestureRecognizer(),
                )),
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _webViewHeight.dispose();
    super.dispose();
  }
}
