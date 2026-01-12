import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import TextInput from './components/TextInput/TextInput';
import FileUpload from './components/FileUpload/FileUpload';
import ResultDisplay from './components/ResultDisplay/ResultDisplay';
import { uploadToCloudinary } from './utils/fileUtils';
import { refinePrompt } from './services/api';

function App() {
  const [textInput, setTextInput] = useState('');
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [processingStage, setProcessingStage] = useState(0); // 0=perception, 1=normalization, 2=refinement, 3=validation

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!textInput.trim() && images.length === 0 && documents.length === 0) {
      toast.error('Please provide at least one input (text, image, or document)');
      return;
    }

    setLoading(true);
    setResult(null);
    setProcessingStage(0);

    try {
      // Step 1: Upload images to Cloudinary
      let imageUrls = [];
      if (images.length > 0) {
        setUploadingImages(true);
        toast.info(`Uploading ${images.length} image(s) to cloud storage...`);

        const uploadPromises = images.map(img => uploadToCloudinary(img.file));
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map(result => result.url);

        setUploadingImages(false);
        toast.success('Images uploaded successfully!');
      }

      // Step 2: Prepare text inputs
      const textInputs = textInput.trim() ? [textInput] : [];

      // Step 3: Submit to backend pipeline with stage simulation
      toast.info('Processing your multi-modal inputs...');
      
      // Simulate perception stage
      setProcessingStage(0);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate normalization stage
      setProcessingStage(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate refinement stage
      setProcessingStage(2);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate validation stage
      setProcessingStage(3);
      
      const response = await refinePrompt(textInputs, imageUrls, documents);

      if (response.success && response.data) {
        setResult(response.data);
        
        if (response.data.success) {
          toast.success('Prompt refined successfully! 🎉');
        } else if (response.data.rejected) {
          toast.warning('Input was rejected. Please review the feedback.');
        } else {
          toast.info('Refinement completed with warnings.');
        }
      } else {
        toast.error('Processing failed. Please try again.');
      }

    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'An error occurred during processing');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleReset = () => {
    setTextInput('');
    setImages([]);
    setDocuments([]);
    setResult(null);
  };

  const hasInputs = textInput.trim() || images.length > 0 || documents.length > 0;

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <div className="app-container">
        <header className="app-header">
          <div className="header-icon">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M15 25 L22 32 L35 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>
            <span className="brand-icon">✦</span> MMPS is thinking
          </h1>
          <p className="app-subtitle">
            Multi-Modal Prompt System - Upload text, images, and documents
          </p>
        </header>

        <main className="app-main">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="form-card">
              <div className="input-wrapper">
                <TextInput value={textInput} onChange={setTextInput} />
              </div>
              
              {(images.length > 0 || documents.length > 0) && (
                <div className="uploaded-files-display">
                  {images.map((img, index) => (
                    <div 
                      key={`img-${index}`} 
                      className="file-preview-chip"
                      onClick={(e) => {
                        e.preventDefault();
                        // Could add view functionality here
                      }}
                    >
                      <img src={img.preview} alt={img.name} className="chip-thumbnail" />
                      <span className="chip-name">{img.name}</span>
                      <button
                        className="chip-remove"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const updated = images.filter((_, i) => i !== index);
                          setImages(updated);
                        }}
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {documents.map((doc, index) => (
                    <div 
                      key={`doc-${index}`} 
                      className="file-preview-chip"
                    >
                      <span className="chip-icon">📄</span>
                      <span className="chip-name">{doc.name}</span>
                      <button
                        className="chip-remove"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const updated = documents.filter((_, i) => i !== index);
                          setDocuments(updated);
                        }}
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <FileUpload
                  onImagesChange={setImages}
                  onDocumentsChange={setDocuments}
                  images={images}
                  documents={documents}
                />
                
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading || !hasInputs}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      {uploadingImages ? 'Uploading Images...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <span>▶</span> Refine Prompt
                    </>
                  )}
                </button>

                {hasInputs && !loading && (
                  <button
                    type="button"
                    className="reset-btn"
                    onClick={handleReset}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {loading && !uploadingImages && (
                <div className="loading-info">
                  <div className="processing-header">
                    <div className="processing-spinner"></div>
                    <span className="processing-title">MMPS is thinking</span>
                  </div>
                  <div className="loading-stages">
                    <div className="stage">
                      <span className={processingStage > 0 ? "stage-complete" : "stage-active"}>
                        Perception Layer
                      </span>
                    </div>
                    <div className="stage">
                      <span className={processingStage > 1 ? "stage-complete" : processingStage === 1 ? "stage-active" : "stage-pending"}>
                        Normalization
                      </span>
                    </div>
                    <div className="stage">
                      <span className={processingStage > 2 ? "stage-complete" : processingStage === 2 ? "stage-active" : "stage-pending"}>
                        AI Refinement
                      </span>
                    </div>
                    <div className="stage">
                      <span className={processingStage >= 3 ? "stage-active" : "stage-pending"}>
                        Validation
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>

          {result && <ResultDisplay result={result} />}
        </main>

        <footer className="app-footer">
          <div className="footer-links">
            <span className="footer-tag">Groq LLM</span>
            <span className="footer-dot">•</span>
            <span className="footer-tag">OpenRouter</span>
            <span className="footer-dot">•</span>
            <span className="footer-tag">Cloudinary</span>
          </div>
          <p className="architecture-note">
            Layered observable architecture with multi-stage refinement
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
