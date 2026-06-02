import React, { useRef } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const FileUpload = ({ onFileSelect, selectedFile, onRemove, accept = "image/*", maxSize = 5 }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size should be less than ${maxSize}MB`);
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      {!selectedFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition"
        >
          <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Click to upload image</p>
          <p className="text-xs text-gray-400 mt-1">Max size: {maxSize}MB</p>
        </button>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
          <span className="text-sm text-gray-600 truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;