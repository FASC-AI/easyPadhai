
import HttpFileClient from '@/services/HttpFileClient';
import { parseFileNameFromUrl } from '@/utils/s3Helper';
import { useField, useFormikContext } from 'formik';
import './FormikDocumentUploder.css';
import { useEffect, useState } from 'react';

const DutySlipFormikUploader = ({
  id,
  title,
  message,
  btnText,
  bottomMessage,
  name,
  isSingle,
  setErrorMessage,
  preview,
  disabled,
  ...props
}) => {
  const [field, ,] = useField(name);
  const { setFieldValue } = useFormikContext();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (preview) {
      const initialFile = [
        { url: preview, name: parseFileNameFromUrl(preview) },
      ];
      setFiles(initialFile);
      setFieldValue(name, initialFile);
    }
  }, [preview, setFieldValue, name]);

  const handleFileChange = async (selectedFiles) => {
    let fileArray = Array.from(selectedFiles);

    if (isSingle) {
      fileArray = fileArray.slice(0, 1);
    }

    const invalidFiles = fileArray.filter(
      (file) => !['image/jpeg', 'image/png'].includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setErrorMessage('Only JPEG and PNG files are allowed.');
      return;
    }

    const formData = new FormData();
    fileArray.forEach((file) => formData.append('file', file));

    try {
      const response = await HttpFileClient.post('/s3/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrls = response.data.data.location?.map((url) => ({
        url,
        name: parseFileNameFromUrl(url),
      }));

      if (isSingle) {
        setFiles(uploadedUrls);
        setFieldValue(name, uploadedUrls);
      } else {
        const newFiles = [...files, ...uploadedUrls];
        setFiles(newFiles);
        setFieldValue(name, newFiles);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleFileDelete = (index) => {
    try {
      const updatedFiles = [...files];
      updatedFiles.splice(index, 1);
      setFiles(updatedFiles);
      setFieldValue(name, updatedFiles);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <>
      <label htmlFor={`upload-file-${id}`} className="upload-wrap">
        {!files.length > 0 && (
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

        {files.length > 0 && (
          <div className="uploading-wrap">
            {files.map((uploadFile, index) => (
              <div className="uploading-item" key={index}>
                <div className="uploded-img-container">
                  <img
                    className="uploded-img"
                    src={uploadFile.url}
                    alt={uploadFile.name}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </label>

      <input
        type="file"
        name="file"
        id={`upload-file-${id}`}
        className={`upload-file upload-file-${id}`}
        onChange={(e) => handleFileChange(e.target.files)}
        multiple={!isSingle}
        disabled={isSingle && files.length > 0}
        {...props}
      />
    </>
  );
};

export default DutySlipFormikUploader;
