import React, { useEffect, useRef, useState } from "react";
import tinymce from "tinymce/tinymce";
import "tinymce/themes/silver";
import "tinymce/plugins/code";
import "tinymce/models/dom";
import "tinymce/icons/default";
import katex from "katex";
import "katex/dist/katex.min.css";
import renderMathInElement from "katex/dist/contrib/auto-render";
import axios from "axios";

const EditorField = ({
  id = "mathEditor",
  setFieldValue,
  name,
  height = 300,
  toolbar = "undo redo | bold italic | insertMath | code",
  initialContent = "",
  showPreview = true,
  setFieldTouched,
  touched,
  errors,
}) => {
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isTinyMCEReady, setIsTinyMCEReady] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [editorInstance, setEditorInstance] = useState(null);
  const [currentValue, setCurrentValue] = useState(initialContent);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true); // Always visible by default
  const [editorDimensions, setEditorDimensions] = useState({
    width: 0,
    height,
  });

  const uniqueId = useRef(`${id}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (editorInstance) {
      editorInstance.setContent(initialContent || "");
      setCurrentValue(initialContent || "");
    }
  }, [initialContent, editorInstance]);

  useEffect(() => {
    if (editorInstance && editorContainerRef.current) {
      const updateDimensions = () => {
        const { offsetWidth, offsetHeight } = editorContainerRef.current;
        setEditorDimensions({ width: offsetWidth, height: offsetHeight });
      };
      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, [editorInstance]);

  useEffect(() => {
    const checkResources = async () => {
      try {
        if (window.tinymce) {
          setIsTinyMCEReady(true);
          return;
        }

        await Promise.all([
          import("tinymce/tinymce"),
          import("tinymce/themes/silver"),
          import("tinymce/plugins/code"),
          import("tinymce/models/dom"),
          import("tinymce/icons/default"),
        ]);

        setIsTinyMCEReady(true);
      } catch (err) {
        setError(`Editor initialization failed: ${err.message}`);
        console.error("Resource check failed:", err);
      }
    };

    checkResources();
  }, []);

  useEffect(() => {
    if (!isTinyMCEReady) return;

    const initTinyMCE = async () => {
      if (!window.tinymce) {
        setError("TinyMCE is not available");
        console.error("TinyMCE not found on window object");
        return;
      }

      try {
        if (window.tinymce.get(uniqueId.current)) {
          window.tinymce.remove(`#${uniqueId.current}`);
        }

        const editor = await window.tinymce.init({
          selector: `#${uniqueId.current}`,
          plugins: [
            "anchor",
            "autolink",
            "template",
            "charmap",
            "code",
            "codesample",
            "emoticons",
            "imagetools",
            "image",
            "link",
            "lists",
            "media",
            "searchreplace",
            "table",
            "visualblocks",
            "wordcount",
            "checklist",
            "mediaembed",
            "casechange",
            "export",
            "formatpainter",
            "pageembed",
            "a11ychecker",
            "tinymcespellchecker",
            "permanentpen",
            "powerpaste",
            "advtable",
            "advcode",
            "editimage",
            "advtemplate",
            "ai",
            "mentions",
            "tinycomments",
            "tableofcontents",
            "footnotes",
            "mergetags",
            "autocorrect",
            "typography",
            "inlinecss",
            "markdown",
            "importword",
            "exportword",
            "exportpdf",
          ],
          image_title: true,
          automatic_uploads: true,
          file_picker_types: "image",
          file_picker_callback: function (callback, value, meta) {
            if (meta.filetype === "image") {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");

              input.onchange = async function () {
                const file = this.files[0];

                if (!file) return;

                // Show loading state
                const notification =
                  tinymce.activeEditor.notificationManager.open({
                    text: "Uploading image...",
                    type: "info",
                    timeout: 0, // Keep open until we close it
                  });

                try {
                  const formData = new FormData();
                  formData.append("image", file);

                  const response = await fetch(
                    `${import.meta.env.VITE_APP_BASE_URL}/image/upload`,
                    {
                      method: "POST",
                      body: formData,
                      headers: { Accept: "application/json" },
                    }
                  );

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                      errorData.message ||
                        `Upload failed with status ${response.status}`
                    );
                  }

                  const data = await response.json();

                  // Verify the response structure
                  if (!data.data?.url) {
                    throw new Error("Server response missing image URL");
                  }

                  // Success - insert image
                  callback(data?.data.url, { title: file.name });
                  notification.close();
                } catch (error) {
                  console.error("Upload failed:", error);
                  notification.set({
                    text: `Upload failed: ${error.message}`,
                    type: "error",
                  });
                  // Auto-close after 5 seconds
                  setTimeout(() => notification.close(), 5000);
                }
              };

              input.click();
            }
          },
          font_size_formats: "8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt",
          font_family_formats:
            "Arial=arial,helvetica,sans-serif; Times New Roman=times new roman,times,serif; Courier New=courier new,courier,monospace; System Font=-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif",
          content_style:
            "body { font-family: Arial, sans-serif; font-size: 14pt; } p { font-family: Arial, sans-serif; font-size: 14pt !important; }",
          typography_default_lang: "en-US",
          typography_rules: [
            "common/punctuation/quote",
            "en-US/punctuation/dash",
          ],
          toolbar:
            "undo redo | bold italic underline | table media image code | template",
          height: height,
          base_url: "/tinymce",
          suffix: ".min",
          license_key: "3n3ac6wjilwi8rca9mn0gxquc8n8gsl3borxwq1u62uh7knm",
          setup: function (editor) {
            editor.ui.registry.addButton("insertMath", {
              text: "Insert Math",
              onAction: function () {
                const selection = editor.selection.getContent();
                const latex = prompt(
                  "Enter LaTeX (wrap inline with \\( \\) or block with \\[ \\])",
                  selection || "\\( a^2 + b^2 = c^2 \\)"
                );
                if (latex) {
                  editor.insertContent(latex);
                }
              },
            });

            editor.on("init", () => {
              editor.setContent(initialContent || "");
              setEditorInstance(editor);
            });

            editor.on("change", () => {
              updateFieldValue(editor);
            });

            editor.on("blur", () => {
              updateFieldValue(editor);
            });
          },
        });
      } catch (err) {
        setError(`TinyMCE initialization error: ${err.message}`);
        console.error("TinyMCE init failed:", err);
      }
    };

    initTinyMCE();

    return () => {
      if (window.tinymce && editorInstance) {
        editorInstance.remove();
      }
    };
  }, [isTinyMCEReady]);

  const updateFieldValue = (editor) => {
    if (setFieldValue && name) {
      const content = editor.getContent();
      setCurrentValue(content);
      setFieldValue(name, content);
      setFieldTouched(name, true, false);
    }
  };

  const renderPreview = () => {
    if (!editorInstance) {
      console.warn("Editor instance not available");
      return;
    }

    const content = editorInstance.getContent();
    const container = document.getElementById(
      `previewContainer-${uniqueId.current}`
    );
    if (!container) {
      console.warn(
        `Preview container not found for id: previewContainer-${uniqueId.current}`
      );
      return;
    }

    container.innerHTML = content;
    setPreviewContent(content);

    try {
      renderMathInElement(container, {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    } catch (err) {
      setError("KaTeX rendering failed");
      console.error("KaTeX rendering error:", err);
    }
  };

  const handlePreviewClick = () => {
    renderPreview();
  };

  if (error) {
    return (
      <div className="error" style={{ color: "red", padding: "10px" }}>
        <h2>Error Initializing Editor</h2>
        <p>{error}</p>
        <textarea
          placeholder="Editor failed to load. Use this textarea instead."
          style={{ width: "100%", height: "200px" }}
          value={currentValue}
          onChange={(e) => {
            setCurrentValue(e.target.value);
            setFieldValue(name, e.target.value);
            setFieldTouched(name, true, false);
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div ref={editorContainerRef} style={{ flex: 1 }}>
        <textarea id={uniqueId.current} ref={editorRef} />
        {showPreview && (
          <button
            type="button"
            onClick={handlePreviewClick}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Preview
          </button>
        )}
      </div>
      {showPreview && isPreviewVisible && (
        <div
          id={`previewContainer-${uniqueId.current}`}
          style={{
            width: editorDimensions.width,
            height: "300px",
            padding: "15px",
            border: "2px solid #ccc",
            backgroundColor: "#f9f9f9",
            fontSize: "1.2rem",
            overflowY: "auto",
            boxSizing: "border-box",
            flex: 1,
          }}
        />
      )}
    </div>
  );
};

export default EditorField;
