import React from 'react';

const FileDownload = () => {
  return (
    <div>
      <a href="http://localhost:3001/download" download="processed_file.xlsx">
        Download Processed File
      </a>
    </div>
  );
};

export default FileDownload;

