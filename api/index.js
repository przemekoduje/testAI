import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors"; // Import cors
import mongoose from "mongoose";
import Prompt from "./models/prompts.js"
// import Story from "./models/Story.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8800;

// Konfiguracja multer do przechowywania plików
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());


const connect = async ()=> {
  try{
    await mongoose.connect(process.env.MONGO)
    console.log("connected to Mongodb")
  }catch(err){
    console.log(err)
  }
}

// Inicjalizacja GoogleAIFileManager i GoogleGenerativeAI
const fileManager = new GoogleAIFileManager(process.env.REACT_APP_GEMINI_PUBLIC_KEY);
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_PUBLIC_KEY);

// Endpoint do przesyłania wielu plików
app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const uploadResponse = await fileManager.uploadFile(file.path, {
        mimeType: "application/pdf",
        displayName: file.originalname,
      });

      uploadedFiles.push({
        fileUri: uploadResponse.file.uri,
        fileName: file.originalname
      });

      fs.renameSync(file.path, path.join('uploads', file.originalname));
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

// Endpoint do generowania treści na podstawie wielu plików i promptu
app.post("/api/generate", async (req, res) => {
  try {
    const { fileUris, prompt } = req.body;

    if (!fileUris || fileUris.length === 0 || !prompt) {
      return res.status(400).json({ error: "File URIs and prompt are required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const fileParts = fileUris.map(fileUri => ({
      fileData: {
        mimeType: "application/pdf",  // Zakładamy, że MIME type jest stałe
        fileUri,
      },
    }));

    const result = await model.generateContent([
      { text: prompt },
      ...fileParts
    ]);

    res.json({
      summary: result.response.text(),
    });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Error generating content" });
  }
});

// Endpoint do zapisywania promptu i odpowiedzi
app.post("/api/chats", async (req, res) => {
  try {
    const { prompt, response } = req.body;

    if (!prompt || !response) {
      return res.status(400).json({ error: "Prompt and response are required" });
    }

    const newPrompt = new Prompt({ prompt, response });
    const savedChat = await newPrompt.save();

    res.status(201).json(savedChat);
  } catch (error) {
    console.error("Error saving prompt and response:", error);
    res.status(500).json({ error: "Error saving prompt and response" });
  }
});


app.put("/api/chats/:id", async (req, res) => {
  try {
    const { id } = req.params; // Identyfikator promptu
    const { response } = req.body; // Zaktualizowana odpowiedź

    if (!response) {
      return res.status(400).json({ error: "Response is required" });
    }

    // Znalezienie i zaktualizowanie promptu na podstawie ID
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      { response },
      { new: true } // Zwraca zaktualizowany dokument
    );

    if (!updatedPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    res.status(200).json({ message: "Response updated successfully", updatedPrompt });
  } catch (error) {
    console.error("Error updating response:", error);
    res.status(500).json({ error: "Error updating response" });
  }
});


// app.post("/api/stories", async (req, res) => {
//   try {
//     const { imageSrc, prompt, response } = req.body;

//     const newStory = new Story({
//       imageSrc,
//       prompts: [{ prompt, response }],
//     });

//     const savedStory = await newStory.save();
//     res.status(201).json(savedStory);
//   } catch (error) {
//     console.error("Error creating story:", error);
//     res.status(500).json({ error: "Error creating story" });
//   }
// });


// app.put("/api/stories/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { prompt, response } = req.body;

//     const updatedStory = await Story.findByIdAndUpdate(
//       id,
//       { $push: { prompts: { prompt, response } } },
//       { new: true }
//     );

//     if (!updatedStory) {
//       return res.status(404).json({ error: "Story not found" });
//     }

//     res.status(200).json(updatedStory);
//   } catch (error) {
//     console.error("Error updating story:", error);
//     res.status(500).json({ error: "Error updating story" });
//   }
// });

// app.get("/api/stories", async (req, res) => {
//   try {
//     const stories = await Story.find();
//     res.status(200).json(stories);
//   } catch (error) {
//     console.error("Error fetching stories:", error);
//     res.status(500).json({ error: "Failed to fetch stories" });
//   }
// });



app.listen(port, () => {
  connect()
  console.log(`Server is running on ${port}`);
});
