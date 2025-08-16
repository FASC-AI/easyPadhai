import React, { useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import Cropper from "react-easy-crop";
import { cn } from "@/lib/utils";
import { CloudUploadIcon } from "lucide-react";
import { Label } from "./label";
import { Button } from "@/components/ui/button";
import AlertDialogBox from "./dialog";

const ImageUploader = ({
  id,
  name,
  title = "Upload Image",
  message = "or drag & drop image files here",
  bottomMessage = "Supported: JPEG, PNG (max 1MB)",
  onChange,
  className,
  label = "",
}) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Cropping states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [currentCropImage, setCurrentCropImage] = useState(null);

  // Ref for file input
  const fileInputRef = useRef(null);

  const processFiles = (selectedFiles) => {
    const validFiles = [];
    const newPreviews = [];
    let errorMessage = "";

    selectedFiles.forEach((file) => {
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        errorMessage = "Only JPEG and PNG images are supported.";
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

    // Always set the first file for cropping
    setFiles(validFiles);
    setPreviews(newPreviews);
    setCurrentCropImage(newPreviews[0]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    processFiles(selectedFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async () => {
    try {
      const image = await new Promise((resolve) => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.src = currentCropImage;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          const croppedFile = new File([blob], "cropped-image.png", {
            type: "image/png",
          });
          const croppedUrl = URL.createObjectURL(croppedFile);
          resolve({ croppedFile, croppedUrl });
        }, "image/png");
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleSaveCrop = async () => {
    if (croppedAreaPixels) {
      const { croppedFile, croppedUrl } = await getCroppedImg();

      // Replace the original file with the cropped file
      setFiles([croppedFile]);
      setPreviews([croppedUrl]);
      setCroppedImage(croppedUrl);

      // Reset cropping states
      setCurrentCropImage(null);

      // Trigger onChange if provided
      if (onChange) {
        onChange([croppedFile]);
      }
    }
  };

  const removeFile = () => {
    // Clean up existing object URLs
    previews.forEach(URL.revokeObjectURL);
    if (croppedImage) URL.revokeObjectURL(croppedImage);

    // Clear all file-related states
    setFiles([]);
    setPreviews([]);
    setCroppedImage(null);
    setCurrentCropImage(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Trigger onChange with empty array
    if (onChange) {
      onChange([]);
    }
  };

  React.useEffect(() => {
    return () => {
      // Clean up object URLs
      previews.forEach(URL.revokeObjectURL);
      if (croppedImage) URL.revokeObjectURL(croppedImage);
    };
  }, [previews, croppedImage]);

  return (
    <div className={cn("w-full py-2 bg-white rounded-lg", className)}>
      <div className="mb-2">
        <Label>{label}</Label>
      </div>

      {/* Image Upload or Cropping Area */}
      {!currentCropImage && !croppedImage ? (
        <div
          className="border-2 border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
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
      ) : currentCropImage ? (
        // Cropping Interface

        <div>
          <AlertDialogBox
            isOpen={true}
            title=""
            description={
              <div className="space-y-4">
                <div className="relative h-[400px]">
                  <Cropper
                    image={currentCropImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // Square crop, change as needed
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-1/2 pr-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Zoom
                    </label>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            }
            onConfirm={handleSaveCrop}
            onCancel={() => {
              setIsDialogOpen(false);
              setCurrentCropImage(null);
            }}
            submitBtnText="Save Crop Image"
          />
        </div>
      ) : (
        // Cropped Image Preview
        <div className="relative">
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="relative border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
              >
                <X className="w-5 h-5 text-red-500" />
              </button>

              <img
                src={croppedImage}
                alt="Cropped Preview"
                className="w-full h-80 object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-2 text-left">{error}</div>
      )}
    </div>
  );
};

export default ImageUploader;
