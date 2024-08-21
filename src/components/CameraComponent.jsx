import React, { useRef, useState, useEffect } from "react";

const CameraComponent = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // Uzyskanie dostępu do kamery
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCapturing(true);
      })
      .catch(err => console.error("Error accessing webcam: ", err));

    return () => {
      // Zatrzymanie streamu wideo po zakończeniu
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const imageSrc = canvasRef.current.toDataURL("image/jpeg");
    onCapture(imageSrc);
  };

  return (
    <div className="camera-capture">
      <video ref={videoRef} style={{ width: "100%" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} width="640" height="480"></canvas>
      <button onClick={capturePhoto} disabled={!isCapturing}>Capture Photo</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default CameraComponent;
