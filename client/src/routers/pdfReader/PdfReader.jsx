import React, { useEffect, useState } from "react";
import "./pdfReader.scss";


const PdfReader = () => {
    const [files, setFiles] = useState([]);
    const [prompt, setPrompt] = useState("");
    const [fileUris, setFileUris] = useState([]);
    const [summary, setSummary] = useState("");
    const [uploadedFileNames, setUploadedFileNames] = useState([]);

    const [uploadProgress, setUploadProgress] = useState(0); // Stan do postępu uploadu
    const [loading, setLoading] = useState(false); // Stan do zarządzania widocznością paska postępu
    const [progress, setProgress] = useState(0); // Stan do animacji paska postępu
    

    const handleFileChange = (e) => {
        setFiles([...files, ...e.target.files]);
    };

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    // const handleUpload = async () => {
    //     const formData = new FormData();
    //     files.forEach(file => formData.append('files', file));

    
    //     try {
    //         const response = await fetch('http://localhost:8800/api/upload/', {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         const result = await response.json();
    //         console.log(result);

    //         setFileUris(result.files.map(file => file.fileUri));
    //         setUploadedFileNames(result.files.map(file => file.fileName));
    //     } catch (error) {
    //         console.error('Error uploading files:', error);
    //     }finally {
    //     }

    // };

    useEffect(() => {
        if (loading) {
            const updateProgress = () => {
                if (progress < uploadProgress) {
                    setProgress(prev => Math.min(prev + 1, uploadProgress));
                    requestAnimationFrame(updateProgress);
                }
            };
            updateProgress();
        }
    }, [loading, uploadProgress, progress]);

    const handleUpload = async () => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        setLoading(true); // Włącz pasek postępu
        setUploadProgress(0); // Resetuj postęp przed rozpoczęciem uploadu
        setProgress(0); // Resetuj animowany postęp

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:8800/api/upload/', true);

            // Funkcja do aktualizacji postępu uploadu
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percentComplete);
                }
            };

            // Funkcja do obsługi zakończenia uploadu
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const result = JSON.parse(xhr.responseText);
                    console.log(result);
                    setFileUris(result.files.map(file => file.fileUri));
                    setUploadedFileNames(result.files.map(file => file.fileName));
                    setUploadProgress(100); // Ustaw na 100% po zakończeniu
                } else {
                    console.error('Error uploading files:', xhr.statusText);
                }
                setLoading(false); // Wyłącz pasek postępu po zakończeniu
            };

            // Funkcja do obsługi błędów
            xhr.onerror = () => {
                console.error('Network Error');
                setLoading(false); // Wyłącz pasek postępu w przypadku błędu
            };

            xhr.send(formData);
        } catch (error) {
            console.error('Error uploading files:', error);
            setLoading(false); // Wyłącz pasek postępu w przypadku błędu
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
            
            
            {/* Pasek postępu */}
            {loading && (
                <div style={{ width: "100%", backgroundColor: "#f3f3f3", marginTop: "20px", position: 'relative' }}>
                    <div
                        style={{
                            height: "100px",
                            width: `${progress}%`,
                            backgroundColor: "#4caf50",
                            transition: "width 0.5s",
                        }}
                    />
                   
                </div>
            )}


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
