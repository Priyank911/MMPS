import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';
import { validateFileType, validateFileSize, formatFileSize } from '../../utils/fileUtils';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf'];

const FileUpload = ({ onImagesChange, onDocumentsChange, images: propImages = [], documents: propDocuments = [] }) => {
  const [images, setImages] = useState(propImages);
  const [documents, setDocuments] = useState(propDocuments);
  const [error, setError] = useState('');
  const [viewingImage, setViewingImage] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  const onDropImages = (acceptedFiles, rejectedFiles) => {
    setError('');

    if (rejectedFiles.length > 0) {
      setError('Some files were rejected. Please upload only JPG, PNG, WEBP, or GIF images under 10MB.');
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
        setError(`${file.name} is not a valid image type`);
        return false;
      }
      if (!validateFileSize(file, 10)) {
        setError(`${file.name} exceeds 10MB size limit`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setShowUploadMenu(false);
  };

  const onDropDocuments = (acceptedFiles, rejectedFiles) => {
    setError('');

    if (rejectedFiles.length > 0) {
      setError('Some files were rejected. Please upload only PDF files under 10MB.');
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (!validateFileType(file, ALLOWED_DOC_TYPES)) {
        setError(`${file.name} is not a PDF file`);
        return false;
      }
      if (!validateFileSize(file, 10)) {
        setError(`${file.name} exceeds 10MB size limit`);
        return false;
      }
      return true;
    });

    const newDocuments = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size
    }));

    const updatedDocuments = [...documents, ...newDocuments];
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
    setShowUploadMenu(false);
  };

  const removeImage = (index, e) => {
    e?.stopPropagation();
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const removeDocument = (index, e) => {
    e?.stopPropagation();
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
  };

  const viewImage = (img, e) => {
    e?.stopPropagation();
    setViewingImage(img);
  };

  const viewDocument = (doc, e) => {
    e?.stopPropagation();
    setViewingDocument(doc);
  };

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive
  } = useDropzone({
    onDrop: onDropImages,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true
  });

  const {
    getRootProps: getDocRootProps,
    getInputProps: getDocInputProps,
    isDragActive: isDocDragActive
  } = useDropzone({
    onDrop: onDropDocuments,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true
  });

  return (
    <div className="file-upload-container">
      {error && <div className="upload-error">{error}</div>}

      {/* Upload Menu Button */}
      <div className="upload-menu-container">
        <button 
          type="button"
          className="upload-menu-trigger"
          onClick={() => setShowUploadMenu(!showUploadMenu)}
        >
          <span className="plus-icon">+</span>
        </button>

        {showUploadMenu && (
          <div className="upload-menu">
            <div
              className="menu-item"
              onClick={() => document.getElementById('image-input-trigger').click()}
            >
              <span className="menu-icon">📷</span>
              <div className="menu-text">
                <div className="menu-label">Add images</div>
                <div className="menu-hint">JPG, PNG, WEBP, GIF</div>
              </div>
            </div>
            <div
              className="menu-item"
              onClick={() => document.getElementById('doc-input-trigger').click()}
            >
              <span className="menu-icon">📄</span>
              <div className="menu-text">
                <div className="menu-label">Add documents</div>
                <div className="menu-hint">PDF files</div>
              </div>
            </div>
            <div className="menu-divider"></div>
            <div
              className="menu-item"
              onClick={() => setShowUploadMenu(false)}
            >
              <span className="menu-icon">✕</span>
              <div className="menu-text">
                <div className="menu-label">Close</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        id="image-input-trigger"
        {...getImageInputProps()}
        style={{ display: 'none' }}
      />
      <input
        id="doc-input-trigger"
        {...getDocInputProps()}
        style={{ display: 'none' }}
      />

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="modal-overlay" onClick={() => setViewingImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewingImage(null)}>✕</button>
            <img src={viewingImage.preview} alt={viewingImage.name} className="modal-image" />
            <div className="modal-info">
              <div className="modal-filename">{viewingImage.name}</div>
              <div className="modal-filesize">{formatFileSize(viewingImage.size)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="modal-overlay" onClick={() => setViewingDocument(null)}>
          <div className="modal-content document-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewingDocument(null)}>✕</button>
            <div className="document-preview">
              <div className="pdf-icon-large">📄</div>
              <div className="document-details">
                <div className="modal-filename">{viewingDocument.name}</div>
                <div className="modal-filesize">{formatFileSize(viewingDocument.size)}</div>
                <div className="document-meta">{viewingDocument.file.type}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
