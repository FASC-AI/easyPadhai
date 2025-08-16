import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CloudUploadIcon } from "lucide-react";
import { Label } from "./label";

const DocumentUploader = ({
  id,
  name,
  title = "Upload Govt. Issued Card",
  message = "or drag & drop Govt. Issued Card image files here",
  btnText = "Choose Files",
  bottomMessage = "Supported: JPEG, PNG, PDF (max 1MB)",
  isSingle = false,
  onChange,
  className,
  label = "",
}) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");

  const processFiles = (selectedFiles) => {
    const validFiles = [];
    const newPreviews = [];
    let errorMessage = "";

    selectedFiles.forEach((file) => {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        errorMessage = "Only JPEG, PNG, and PDF files are supported.";
        return;
      }
      if (file.size > 1048576) {
        errorMessage = "File size must be less than 1MB.";
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
      validFiles.push(file);
    });

    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    const finalFiles = isSingle ? [validFiles[0]] : [...files, ...validFiles];
    const finalPreviews = isSingle
      ? [newPreviews[0]]
      : [...previews, ...newPreviews];

    setFiles(finalFiles);
    setPreviews(finalPreviews);
    if (onChange) {
      onChange(finalFiles);
    }

    setError("");
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    processFiles(selectedFiles);
  };

  const removeFile = (indexToRemove) => {
    URL.revokeObjectURL(previews[indexToRemove]);
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    const newPreviews = previews.filter((_, index) => index !== indexToRemove);

    setFiles(newFiles);
    setPreviews(newPreviews);
    if (onChange) {
      onChange(newFiles);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  React.useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  return (
    <div className={cn("w-full py-2 bg-white rounded-lg", className)}>
      <div className="mb-2">
        <Label>{label} </Label>
      </div>
      {previews.length > 0 ? (
        <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
          <input
            type="file"
            multiple={!isSingle}
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id={id}
            name={name}
          />
        </div>
      ) : (
        <div
          className="border-2 border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple={!isSingle}
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id={id}
            name={name}
          />
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <CloudUploadIcon className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-gray-600 mb-2">{title}</p>
            <p className="text-xs text-gray-500">{message}</p>
            <p className="text-xs text-gray-500 mt-2">{bottomMessage}</p>
          </label>
        </div>
      )}

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative border rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
              >
                <X className="w-5 h-5 text-red-500" />
              </button>

              {files[index].type === "application/pdf" ? (
                <div className="p-4 bg-gray-100 flex items-center justify-center h-40">
                  <span className="text-gray-600">PDF Document</span>
                </div>
              ) : (
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-40 object-cover"
                />
              )}
            </div>
          ))}

          {!isSingle && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition h-40"
              onClick={() => document.getElementById(id)?.click()}
            >
              <Plus className="w-12 h-12 text-gray-500" />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-2 text-left">{error}</div>
      )}
    </div>
  );
};

export default DocumentUploader;

// uploader

// import { toast } from "sonner";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import HeaderAddEditPage from "@/components/ui/header-add-edit-page";
// import DocumentUploader from "@/components/ui/document-uploader";

// export function AddEditApdaMitraProfileForm({
//   className,
//   setIsRegister,
//   ...props
// }) {
//   const validationSchema = Yup.object({});

//   const formik = useFormik({
//     initialValues: {
//       profileImage: [],
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       // toggleOverlay(true);
//       try {
//         console.log("values", values);
//       } catch (error) {
//         // toggleOverlay(false);
//         toast.error(error?.response?.data?.message);
//       }
//     },
//   });
// const handleDocumentChange = (urls) => {
//   formik.setFieldValue("documents.govtIssuedCard", urls);
// };

//   return (
//     <form
//       onSubmit={formik.handleSubmit}
//       className={cn("flex flex-col gap-6", className)}
//       {...props}
//     >
//       <HeaderAddEditPage name="" email="" mobile="" image="" />

{
  /* <DocumentUploader
  id="documents.govtIssuedCard"
  name="documents.govtIssuedCard"
  title="Upload Govt. Issued Card"
  message="Drag and drop files here"
  btnText="Choose Files"
  bottomMessage="Max file size: 1MB"
  isSingle={false}
  onChange={(e) => handleDocumentChange(e)}
/>; */
}
//     </form>
//   );
// }

// export default AddEditApdaMitraProfileForm;
