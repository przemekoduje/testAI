import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors"; // Import cors

dotenv.config();

const app = express();
const port = process.env.PORT || 8800;

// Konfiguracja multer do przechowywania plików
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

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
      model: "gemini-1.5-flash",
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

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
