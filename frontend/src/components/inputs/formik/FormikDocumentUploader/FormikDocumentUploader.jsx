import { useField, useFormikContext } from 'formik';
import { useState } from 'react';
import { CloudUpload } from 'lucide-react';
import './FormikDocumentUploder.css';

const FormikDocumentUploder = ({
  id,
  title,
  message,
  btnText,
  bottomMessage,
  name,
  ...props
}) => {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

  const handleFileChange = async (files) => {
    const file = files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('File exceeds the 1MB size limit. Please upload a smaller file.');
      return;
    }

    setErrorMessage('');
    const previewUrl = URL.createObjectURL(file);
    setPreview({ url: previewUrl, name: file.name, file });
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      setFieldValue(name, [{ url: data.url || data.data?.url, name: file.name }]);
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    try {
      setFieldValue(name, []);
    } catch (error) {
      console.error('Error deleting file:', error);
      setErrorMessage('Failed to delete file. Please try again.');
    }
  };

  const handlePreviewDelete = () => {
    try {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
      setPreview(null);
    } catch (error) {
      console.error('Error deleting preview:', error);
    }
  };

  return (
    <>
      <label htmlFor={`upload-file-${id}`} className="upload-wrap">
        {!field.value?.length && !preview && (
          <>
            <div>{<CloudUpload />}</div>
            <div className="desc heading-700-22 text-center">{title}</div>
            <div className="heading-400-12">{message}</div>
            <div><div className="upload-btn heading-400-12">{btnText}</div></div>
            <div className="heading-400-10 upload-bottom-message">{bottomMessage}</div>
          </>
        )}

        {(field.value?.length > 0 || preview) && (
          <div className="uploading-wrap">
            {field.value?.map((file, index) => (
              <div className="uploading-item" key={`uploaded-${index}`}>
                <div className="del-img" onClick={handleDelete}>+</div>
                <div className="uploded-img-container">
                  <img className="uploded-img" src={file.url} alt={file.name} />
                </div>
              </div>
            ))}

            {preview && (
              <div className="uploading-item" key="preview">
                <div className="del-img" onClick={handlePreviewDelete}>+</div>
                <div className="uploded-img-container">
                  <img className="uploded-img" src={preview.url} alt={preview.name} />
                  {isUploading && (
                    <div className="upload-progress">
                      <div className="progress-bar"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </label>

      <input
        type="file"
        name="file"
        id={`upload-file-${id}`}
        className={`upload-file upload-file-${id}`}
        onChange={(e) => handleFileChange(e.target.files)}
        {...props}
      />

      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </>
  );
};

export default FormikDocumentUploder;
