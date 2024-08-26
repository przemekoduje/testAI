import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, Temperature }  from "@google/generative-ai";


const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ];

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_PUBLIC_KEY);
  
  const generationConfig = {
    // stopSequences: ["red"],
    // maxOutputTokens: 200,
    temperature: 0.9,
    // topP: 0.1,
    // topK: 16,
  };
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash-001", 
  safetySettings,
  generationConfig,
});

export default model;