
import HttpFileClient from '@/services/HttpFileClient';
import { parseFileNameFromUrl } from '@/utils/s3Helper';
import './FormikDocumentUploder.css';
import { useState, useRef } from 'react';
import { RefreshCwIcon } from 'lucide-react';
import { UploadIcon } from 'lucide-react';
import { CameraIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DocumentUploaderWithCamera = ({
  id,
  title,
  message,
  btnText,
  bottomMessage,
  isSingle,
  callback,
  ...props
}) => {
  const [fileList, setFileList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [photo, setPhoto] = useState(null); // State for captured photo
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

  const handleFileChange = async (files) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    const oversizedFiles = fileArray.filter(
      (file) => file.size > MAX_FILE_SIZE
    );
    if (oversizedFiles.length > 0) {
      setErrorMessage(
        'Some files exceed the 1MB size limit. Please upload smaller files.'
      );
      return;
    }

    setErrorMessage('');
    const formData = new FormData();
    fileArray.forEach((file) => formData.append('file', file));

    try {
      const { data } = await HttpFileClient.post('/s3/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrls = data.data.location?.map((url) => ({
        url,
        name: parseFileNameFromUrl(url),
      }));
      callback(uploadedUrls[0].url);
      setFileList((prevList) => [...prevList, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading file(s):', error);
    }
  };

  const handleFileDelete = (index) => {
    const updatedFiles = [...fileList];
    updatedFiles.splice(index, 1);
    setFileList(updatedFiles);
  };

  const capturePhoto = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(
        'Failed to access the camera. Please allow camera permissions.'
      );
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL('image/png'));
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return; // Don't proceed if there's no photo to upload

    const blob = await fetch(photo).then((res) => res.blob()); // Convert the base64 image to a Blob
    const formData = new FormData();
    formData.append('file', blob, 'captured-photo.png'); // Append the Blob to the FormData

    try {
      const { data } = await HttpFileClient.post('/s3/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = data.data.location;
      callback(uploadedUrl);
      setFileList((prevList) => [
        ...prevList,
        { url: uploadedUrl, name: 'Captured Photo' },
      ]);
      setPhoto(null); // Clear the photo after successful upload
    } catch (error) {
      console.error('Error uploading photo:', error);
      setErrorMessage('Failed to upload the photo.');
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left Half - File Uploader */}
      <div className="border rounded-md">
        <label htmlFor={`upload-file-${id}`} className="upload-wrap">
          {fileList.length === 0 && (
            <>
              <div>{uploadIcon({ width: 40, height: 40 })}</div>
              <div className="desc heading-700-22">{title}</div>
              <div className="heading-400-12">{message}</div>
              <div>
                <div className="upload-btn heading-400-12">{btnText}</div>
              </div>
              <div className="heading-400-10 upload-bottom-message">
                {bottomMessage}
              </div>
            </>
          )}
          {fileList.length > 0 && (
            <div className="uploading-wrap">
              {fileList.map((uploadFile, index) => (
                <div className="uploading-item" key={index}>
                  <div
                    className="del-img"
                    onClick={() => handleFileDelete(index)}
                  >
                    +
                  </div>
                  <div className="uploaded-img-container">
                    <img
                      className="uploaded-img"
                      src={uploadFile.url}
                      alt={uploadFile.name}
                    />
                  </div>
                </div>
              ))}
              <div className="uploading-item cursor-pointer">
                <div className="heading-300-32 c-gray4">+</div>
                <div className="heading-500-16 c-gray4">Add More</div>
              </div>
            </div>
          )}
        </label>
        <input
          type="file"
          id={`upload-file-${id}`}
          className={`upload-file upload-file-${id}`}
          onChange={(e) => handleFileChange(e.target.files)}
          multiple={!isSingle}
          {...props}
        />
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>

      {/* Right Half - Capture Photo */}
      <div className="capture-photo-section border rounded-md py-2">
        {photo ? (
          <div className="flex flex-col items-center">
            <img
              src={photo}
              alt="Captured"
              className="captured-photo mb-4 w-fit h-[115px] aspect-square"
            />
            <div className="flex space-x-4">
              <Button onClick={() => setPhoto(null)}>
                <RefreshCwIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                Retake Photo
              </Button>
              <Button onClick={uploadPhoto}>
                <UploadIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                Upload Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <video
              ref={videoRef}
              className="camera-feed mb-4 w-full max-w-xs h-[115px] bg-black"
              autoPlay
            />
            <div className="flex space-x-4">
              <Button onClick={capturePhoto}>
                <CameraIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                Start Camera
              </Button>
              <Button onClick={takePhoto}>
                <CameraIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                Take Photo
              </Button>
            </div>
          </div>
        )}
        {cameraError && <div className="error-message">{cameraError}</div>}
      </div>
    </div>
  );
};

export default DocumentUploaderWithCamera;
