import React, { useState } from 'react';
import './ResultDisplay.css';

const ResultDisplay = ({ result }) => {
  const [promptFormat, setPromptFormat] = useState('txt');
  
  if (!result) return null;

  const { success, rejected, rejectionReason, refinedPrompt, details, confidence, metadata } = result;

  if (rejected) {
    return (
      <div className="result-display">
        <div className="rejection-message">
          <div className="rejection-header">INPUT REJECTED</div>
          <p className="rejection-reason">{rejectionReason}</p>
          <div className="rejection-help">
            <div className="help-title">Suggestions:</div>
            <ul>
              <li>Ensure your input is clear and specific</li>
              <li>Provide more context about what you want to achieve</li>
              <li>Check that images and documents are relevant to your request</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="result-display">
        <div className="validation-failed">
          <div className="warning-header">REFINEMENT COMPLETED WITH WARNINGS</div>
          <p className="warning-message">The system generated a refined prompt, but it may need manual review.</p>
          {details?.recommendations && details.recommendations.length > 0 && (
            <div className="recommendations">
              <div className="rec-title">Recommendations:</div>
              <ul>
                {details.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="result-display">
      <div className="result-header">
        <div className="success-badge">REFINEMENT SUCCESSFUL</div>
        <div className="confidence-badge">
          Confidence: {(confidence.overallConfidence * 100).toFixed(1)}%
        </div>
      </div>

      {/* Main Refined Prompt */}
      <div className="refined-prompt-section">
        <div className="prompt-header">
          <h2>Refined Prompt</h2>
          <div className="format-toggle">
            <button
              className={`toggle-btn ${promptFormat === 'txt' ? 'active' : ''}`}
              onClick={() => setPromptFormat('txt')}
            >
              TXT
            </button>
            <button
              className={`toggle-btn ${promptFormat === 'json' ? 'active' : ''}`}
              onClick={() => setPromptFormat('json')}
            >
              JSON
            </button>
          </div>
        </div>
        <div className="refined-prompt-content">
          {promptFormat === 'txt' ? (
            refinedPrompt.split('\n').map((paragraph, idx) => (
              paragraph.trim() && <p key={idx}>{paragraph}</p>
            ))
          ) : (
            <pre className="json-output">
              {JSON.stringify({ refinedPrompt, details, confidence }, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* Intent Analysis */}
      {details?.intent && (
        <div className="details-section">
          <h3>Understood Intent</h3>
          <div className="detail-card">
            <div className="detail-item">
              <strong>Primary Goal:</strong>
              <p>{details.intent.intent}</p>
            </div>
            <div className="detail-item">
              <strong>Domain:</strong>
              <p>{details.intent.domain}</p>
            </div>
            {details.intent.key_concepts && details.intent.key_concepts.length > 0 && (
              <div className="detail-item key-concepts">
                <strong>Key Concepts:</strong>
                <div className="tag-list">
                  {details.intent.key_concepts.map((concept, idx) => (
                    <span key={idx} className="tag concept-tag">{concept}</span>
                  ))}
                </div>
              </div>
            )}
            {details.intent.constraints && details.intent.constraints.length > 0 && (
              <div className="detail-item">
                <strong>Identified Constraints:</strong>
                <ul>
                  {details.intent.constraints.map((constraint, idx) => (
                    <li key={idx}>{constraint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Improvements Made */}
      {details?.improvements && details.improvements.length > 0 && (
        <div className="details-section">
          <h3>Key Improvements</h3>
          <div className="detail-card">
            <ul className="improvement-list">
              {details.improvements.map((improvement, idx) => (
                <li key={idx}>{improvement}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Assumptions */}
      {details?.assumptions && details.assumptions.length > 0 && (
        <div className="details-section">
          <h3>Assumptions Made</h3>
          <div className="detail-card assumptions">
            <ul>
              {details.assumptions.map((assumption, idx) => (
                <li key={idx}>{assumption}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Quality Metrics */}
      <div className="details-section">
        <h3>Quality Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Relevance</div>
            <div className="metric-value">
              {(confidence.scores.relevance * 100).toFixed(0)}%
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${confidence.scores.relevance * 100}%` }}
              />
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Intent Understanding</div>
            <div className="metric-value">
              {(confidence.scores.intentUnderstanding * 100).toFixed(0)}%
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${confidence.scores.intentUnderstanding * 100}%` }}
              />
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Refinement Quality</div>
            <div className="metric-value">
              {(confidence.scores.refinementQuality * 100).toFixed(0)}%
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${confidence.scores.refinementQuality * 100}%` }}
              />
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Validation Quality</div>
            <div className="metric-value">
              {(confidence.scores.validationQuality * 100).toFixed(0)}%
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${confidence.scores.validationQuality * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Processing Metadata */}
      <div className="metadata-section">
        <details>
          <summary>Processing Details</summary>
          <div className="metadata-content">
            <div className="metadata-item">
              <strong>Total Processing Time:</strong> {metadata.totalProcessingTime}ms
            </div>
            <div className="metadata-item">
              <strong>Pipeline ID:</strong> {result.pipelineId}
            </div>
            <div className="metadata-item">
              <strong>Layer Breakdown:</strong>
              <ul>
                <li>Perception: {metadata.perceptionLayer.processingTime}ms</li>
                <li>Normalization: {metadata.normalizationLayer.processingTime}ms</li>
                <li>Refinement: {metadata.refinementLayer.totalProcessingTime}ms</li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ResultDisplay;
