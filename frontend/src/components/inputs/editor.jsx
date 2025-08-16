import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";

const MathEditor = forwardRef(
  ({ initialContent = "", height = 300, onChange }, ref) => {
    const editorRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Expose a getContent method via ref
    useImperativeHandle(ref, () => ({
      getContent: () => window.tinymce?.get("mathEditor")?.getContent() || "",
      setContent: (content) =>
        window.tinymce?.get("mathEditor")?.setContent(content || ""),
    }));

    useEffect(() => {
      const loadScript = (src, isCSS = false) => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`[src="${src}"], link[href="${src}"]`)) {
            // Already loaded
            resolve();
            return;
          }
          const tag = isCSS
            ? document.createElement("link")
            : document.createElement("script");

          if (isCSS) {
            tag.rel = "stylesheet";
            tag.href = src;
            tag.onload = resolve;
            tag.onerror = reject;
            document.head.appendChild(tag);
          } else {
            tag.src = src;
            tag.defer = true;
            tag.onload = resolve;
            tag.onerror = reject;
            document.body.appendChild(tag);
          }
        });
      };

      const loadScripts = async () => {
        try {
          await loadScript(
            "https://cdn.tiny.cloud/1/3n3ac6wjilwi8rca9mn0gxquc8n8gsl3borxwq1u62uh7knm/tinymce/6/tinymce.min.js"
          );
          await loadScript(
            "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css",
            true
          );
          await loadScript(
            "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
          );
          await loadScript(
            "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
          );
          initTinyMCE();
        } catch (err) {
          console.error("Error loading external scripts:", err);
        }
      };

      loadScripts();

      // Cleanup TinyMCE instance on unmount
      return () => {
        if (window.tinymce) {
          window.tinymce.remove(window.tinymce.get("mathEditor"));
        }
      };
    }, []);

    const initTinyMCE = () => {
      if (!window.tinymce) return;

      window.tinymce.init({
        selector: "#mathEditor",
        plugins: "code",
        toolbar: "undo redo | bold italic | insertMath | code",
        height,
        setup: (editor) => {
          editor.ui.registry.addButton("insertMath", {
            text: "Insert Math",
            onAction: () => {
              const latex = prompt(
                "Enter LaTeX (wrap inline with \\( \\) or block with \\[ \\])",
                "\\( a^2 + b^2 = c^2 \\)"
              );
              if (latex) {
                editor.insertContent(latex);
                renderPreview();
              }
            },
          });

          editor.on("init", () => {
            editor.setContent(
              initialContent ||
                "Type math like \\( a^2 + b^2 = c^2 \\) or \\[ \\frac{a}{b} \\]"
            );
            setIsLoaded(true);
            renderPreview();
          });

          editor.on("keyup change", () => {
            renderPreview();
            if (onChange) {
              onChange(editor.getContent());
            }
          });
        },
      });
    };

    const renderPreview = () => {
      const editor = window.tinymce?.get("mathEditor");
      if (!editor) return;

      const content = editor.getContent();
      const container = document.getElementById("previewContainer");
      if (!container) return;

      container.innerHTML = content;

      if (window.renderMathInElement) {
        window.renderMathInElement(container, {
          delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      }
    };

    return (
      <div>
        <textarea id="mathEditor" ref={editorRef} />
        <div
          id="previewContainer"
          style={{
            marginTop: "20px",
            padding: "15px",
            borderTop: "2px solid #ccc",
            backgroundColor: "#f9f9f9",
            fontSize: "1.2rem",
            minHeight: 50,
          }}
        />
      </div>
    );
  }
);

export default MathEditor;
