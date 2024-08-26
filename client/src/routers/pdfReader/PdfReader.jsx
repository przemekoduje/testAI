import React, { useState } from "react";
import "./pdfReader.scss";

const PdfReader = () => {
    const [files, setFiles] = useState([]);
    const [prompt, setPrompt] = useState("");
    const [fileUris, setFileUris] = useState([]);
    const [summary, setSummary] = useState("");
    const [uploadedFileNames, setUploadedFileNames] = useState([]);

    const handleFileChange = (e) => {
        setFiles([...files, ...e.target.files]);
    };

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
    
        try {
            const response = await fetch('http://localhost:8800/api/upload/', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log(result);

            setFileUris(result.files.map(file => file.fileUri));
            setUploadedFileNames(result.files.map(file => file.fileName));
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    };

    const handleGenerate = async () => {
        const response = await fetch('http://localhost:8800/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileUris, prompt }),
        });

        const result = await response.json();
        console.log(result);
        setSummary(result.summary);
    };

    return (
        <div>
            <input type="file" accept="application/pdf" multiple onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload PDF(s)</button>

            {uploadedFileNames.length > 0 && (
                <div>
                    <h2>Uploaded file(s):</h2>
                    <ul>
                        {uploadedFileNames.map((fileName, index) => (
                            <li key={index}>{fileName}</li>
                        ))}
                    </ul>
                </div>
            )}

            <textarea
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Enter your prompt here"
            />
            <button onClick={handleGenerate}>Generate Content</button>

            {summary && (
                <div>
                    <h2>Summary:</h2>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
};

export default PdfReader;
