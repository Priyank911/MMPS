import React, { useEffect, useRef } from 'react';
import './TextInput.css';

const TextInput = ({ value, onChange }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '50px';
      const newHeight = Math.max(50, textarea.scrollHeight);
      textarea.style.height = newHeight + 'px';
    }
  }, [value]);

  return (
    <div className="text-input-container">
      <h3>✍️ Text Input</h3>
      <p className="input-description">
        Enter your prompt, question, or requirements directly. You can provide context,
        constraints, or any information you'd like the system to process.
      </p>
      <textarea
        ref={textareaRef}
        className="text-input-area"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="How can I help you today?"
        rows={1}
      />
      {value.length > 0 && (
        <div className="character-count">
          {value.length} characters
        </div>
      )}
    </div>
  );
};

export default TextInput;
