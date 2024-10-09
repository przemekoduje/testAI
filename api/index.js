import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
// import { GoogleAIFileManager } from "@google/generative-ai/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors"; // Import cors
import mongoose from "mongoose";
import Prompt from "./models/prompts.js"
// import Story from "./models/Story.js";
import Chat from "./models/chat.js"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 8800;

// Sprawdzamy, czy folder 'uploads' istnieje, jeśli nie - tworzymy go
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Konfiguracja multer do przechowywania plików
const upload = multer({ dest: "uploads/" });

app.use(cors({
  origin: "http://localhost:3000", // lub odpowiednia domena frontendowa
  methods: ["GET", "POST"],
}));
app.use(express.json());


const connect = async ()=> {
  try{
    await mongoose.connect(process.env.MONGO)
    console.log("connected to Mongodb")
  }catch(err){
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

// Inicjalizacja GoogleAIFileManager i GoogleGenerativeAI
// const fileManager = new GoogleAIFileManager(process.env.REACT_APP_GEMINI_PUBLIC_KEY);
// const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_PUBLIC_KEY);



// Endpoint do przesyłania wielu plików
app.post("/api/uploads", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    

    const uploadedFiles = [];

    for (const file of files) {

      const newFileName = file.originalname;
      const filePath = path.join(__dirname, 'uploads', newFileName);
      // const uploadResponse = await fileManager.uploadFile(file.path, {
      //   mimeType: "application/pdf",
      //   displayName: file.originalname,
      // });

      // uploadedFiles.push({
      //   fileUri: uploadResponse.file.uri,
      //   fileName: file.originalname
      // });

      fs.renameSync(file.path, filePath);
      
      uploadedFiles.push({
        fileUri: `http://localhost:${port}/uploads/${newFileName}`,
        fileName: file.originalname
      });
    }

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
});

// Endpoint do serwowania plików z katalogu "uploads"
app.use("/uploads", (req, res, next) => {
  // Dodaj nagłówki CORS i Content-Disposition
  res.setHeader('Access-Control-Allow-Origin', '*'); // Pozwala na wyświetlanie plików w iframe z dowolnej domeny
  res.setHeader('Content-Disposition', 'inline'); // Umożliwia bezpośrednie wyświetlanie plików PDF
  next();
}, express.static(path.join(__dirname, "uploads")));

// Endpoint do pobierania listy plików PDF
// app.get("/api/uploads", (req, res) => {
//   fs.readdir(path.join(__dirname, "uploads"), (err, files) => {
//     if (err) {
//       return res.status(500).json({ error: "Failed to read directory" });
//     }

//     const pdfFiles = files.map((file) => ({
//       fileUri: `http://localhost:${port}/uploads/${file}`,
//       fileName: file,
//     }));

//     res.json({
//       message: "Files retrieved successfully",
//       files: pdfFiles,
//     });
//   });
// });






// Endpoint do generowania treści na podstawie wielu plików i promptu
// app.post("/api/generate", async (req, res) => {
//   try {
//     const { fileUris, prompt } = req.body;

//     if (!fileUris || fileUris.length === 0 || !prompt) {
//       return res.status(400).json({ error: "File URIs and prompt are required" });
//     }

//     const model = genAI.getGenerativeModel({
//       model: "gemini-1.5-pro",
//     });

//     const fileParts = fileUris.map(fileUri => ({
//       fileData: {
//         mimeType: "application/pdf",  // Zakładamy, że MIME type jest stałe
//         fileUri,
//       },
//     }));

//     const result = await model.generateContent([
//       { text: prompt },
//       ...fileParts
//     ]);

//     res.json({
//       summary: result.response.text(),
//     });
//   } catch (error) {
//     console.error("Error generating content:", error);
//     res.status(500).json({ error: "Error generating content" });
//   }
// });



// Endpoint do zapisywania promptu i odpowiedzi
// app.post("/api/chats", async (req, res) => {
//   try {
//     const {  prompt, response } = req.body;

//     if (!prompt || !response) {
//       return res.status(400).json({ error: "Prompt and response are required" });
//     }

//     // const newPrompt = new Prompt({ prompt, response });
    
//     // const savedChat = await newPrompt.save();
//     // console.log(savedChat)



//     // res.status(201).json(savedChat);
//     const newChat = new Chat({
//       // userId,
//       history: [
//         {
//           role: "user",
//           parts: [{ text: prompt }],
//         },
//         {
//           role: "model",
//           parts: [{ text: response }],
//         },
//       ],
//     });

//     const savedChat = await newChat.save();
//     res.status(201).json(savedChat);
//   } catch (error) {
//     console.error("Error saving prompt and response:", error);
//     res.status(500).json({ error: "Error saving prompt and response" });
//   }
// });


//UPDATE RESPONSE BY USER
// app.put("/api/chats/:id", async (req, res) => {
//   try {
//     const { id } = req.params; // Identyfikator promptu
//     const { response } = req.body; // Zaktualizowana odpowiedź

//     if (!response) {
//       return res.status(400).json({ error: "Response is required" });
//     }

//     // Znalezienie i zaktualizowanie promptu na podstawie ID
//     const updatedPrompt = await Prompt.findByIdAndUpdate(
//       id,
//       { response },
//       { new: true } // Zwraca zaktualizowany dokument
//     );

//     if (!updatedPrompt) {
//       return res.status(404).json({ error: "Prompt not found" });
//     }

//     res.status(200).json({ message: "Response updated successfully", updatedPrompt });
//   } catch (error) {
//     console.error("Error updating response:", error);
//     res.status(500).json({ error: "Error updating response" });
//   }
// });




app.listen(port, () => {
  connect()
  console.log(`Server is running on ${port}`);
});
