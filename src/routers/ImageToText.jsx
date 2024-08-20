import "./imageToText.scss";
import model from "../lib/gemini";
import { useState } from "react";

const ImageToText = () => {
  const [result, setResult] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [prompt, setPrompt] = useState("")

  const handleInputChange = (e) => {
    setPrompt(e.target.value);
  };

//   const handleFileChange = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();

//     reader.onload = async () => {
//       const base64Data = reader.result.split(",")[1];
//       setSelectedImage(reader.result);

//       const prompt = "Opisz co przedstawia zdjęcie, po polsku";

//       const imagePart = {
//         inlineData: {
//           data: base64Data,
//           mimeType: file.type,
//         },
//       };

//       const generateResult = await model.generateContent([prompt, imagePart]);
//       const text = await generateResult.response.text();
//       setResult(text);
//     };
//     reader.readAsDataURL(file);
//   };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageSrc) {
        const imagePart = {
            inlineData: {
                data: imageSrc.split(",")[1],
                mimeType: "image/jpeg"
            }
        }
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = await result.response.text();
        setResult(responseText)
        setPrompt("")
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onloadend = ()=> {
            setImageSrc(reader.result)
        }
        reader.readAsDataURL(file)
    }
  }

  return (
    <div className="imagetotext">
      <h1>Image to Text</h1>
      <form onSubmit={handleSubmit}>
      <input 
          type="text" 
          value={prompt} 
          onChange={handleInputChange} 
          placeholder="Enter your prompt here"
        />
        <input type="file" accept="image/*" onChange={handleImageChange}  />
        <button type="submit">Generate</button>
      </form>
      {imageSrc && (
        <div className="image-preview">
          <img src={imageSrc} alt="Selected" />
        </div>
      )}
      {result && (
        <div className="result">
          <h2>Description:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default ImageToText;
