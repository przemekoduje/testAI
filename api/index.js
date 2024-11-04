import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors"; // Import cors
import mongoose from "mongoose";
import Prompt from "./models/prompts.js";
// import Story from "./models/Story.js";
import Chat from "./models/chat.js";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 8800;

// Sprawdzamy, czy folder 'uploads' istnieje, jeśli nie - tworzymy go
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Konfiguracja multer do przechowywania plików
const upload = multer({ dest: "uploads/" });

app.use(
  cors({
    origin: "http://localhost:3000", // lub odpowiednia domena frontendowa
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("connected to Mongodb");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

// Inicjalizacja GoogleAIFileManager i GoogleGenerativeAI
const apiKey = process.env.REACT_APP_GEMINI_PUBLIC_KEY;
const fileManager = new GoogleAIFileManager(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

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
      const filePath = path.join(__dirname, "uploads", newFileName);

      fs.renameSync(file.path, filePath);

      uploadedFiles.push({
        fileUri: `http://localhost:${port}/uploads/${newFileName}`,
        fileName: file.originalname,
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
app.use(
  "/uploads",
  (req, res, next) => {
    // Dodaj nagłówki CORS i Content-Disposition
    res.setHeader("Access-Control-Allow-Origin", "*"); // Pozwala na wyświetlanie plików w iframe z dowolnej domeny
    res.setHeader("Content-Disposition", "inline"); // Umożliwia bezpośrednie wyświetlanie plików PDF
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

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

// const convertPDFToBase64 = (filePath) => {
//   try {
//     const fileData = fs.readFileSync(filePath); // Odczytaj plik jako dane binarne
//     return fileData.toString("base64"); // Konwertuj na base64
//   } catch (error) {
//     throw new Error("Błąd przy konwersji pliku PDF na base64");
//   }
// };

// Endpoint do generowania treści na podstawie wielu plików i promptu
// Endpoint do generowania treści na podstawie wielu plików i promptu
app.post("/api/generate", async (req, res) => {
  try {
    const { fileUris, prompt } = req.body;

    if (!fileUris || fileUris.length === 0) {
      return res.status(400).json({ error: "Brak plików do analizy" });
    }

    // Zanim wywołamy model, musimy najpierw przesłać pliki do Google File API.
    const uploadedFiles = await Promise.all(
      fileUris.map(async (fileUri) => {
        const filePath = path.join(
          __dirname,
          fileUri.replace("http://localhost:8800", "")
        );

        const uploadResponse = await fileManager.uploadFile(filePath, {
          mimeType: "application/pdf",
          displayName: path.basename(filePath),
        });
        return uploadResponse.file.uri;
      })
    );

    // Teraz wywołajmy model AI z wygenerowanymi URI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "application/pdf",
          fileUri: uploadedFiles[0], // Tutaj można przekazać wiele plików
        },
      },
      { text: prompt },
    ]);

    const summary = result.response.text();

    console.log(summary);
    const summaryParts = summary
      .split(/<section[^>]*>/)
      .filter((part) => part.trim() !== "");

    res.json({
      sections: summaryParts.map((part, index) => `<p>${part.trim()}</p>`), // Sekcje dynamicznie podzielone
    });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Error generating content" });
  }
});

// Endpoint do generowania odpowiedzi na pytanie dotyczące pliku PDF
app.post("/api/ask", async (req, res) => {
  try {
    const { fileUris, question } = req.body;

    if (!fileUris || fileUris.length === 0) {
      return res.status(400).json({ error: "Brak plików do analizy" });
    }

    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "Pytanie nie może być puste" });
    }

    // Zanim wywołamy model, musimy najpierw przesłać pliki do Google File API.
    const uploadedFiles = await Promise.all(
      fileUris.map(async (fileUri) => {
        const filePath = path.join(
          __dirname,
          fileUri.replace("http://localhost:8800", "")
        );

        const uploadResponse = await fileManager.uploadFile(filePath, {
          mimeType: "application/pdf",
          displayName: path.basename(filePath),
        });
        return uploadResponse.file.uri;
      })
    );

    // Teraz wywołajmy model AI z wygenerowanymi URI i pytaniem
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "application/pdf",
          fileUri: uploadedFiles[0], // Możesz przekazać wiele plików
        },
      },
      {
        text: `${question} Proszę odpowiedzieć w formacie HTML, używając odpowiednich znaczników HTML takich jak <p>, <ul>, <li>.`,
      }, // Przekazujemy pytanie użytkownika
    ]);

    const answer = result.response.text(); // Pobieramy odpowiedź

    res.json({ answer }); // Zwracamy odpowiedź w formacie JSON
  } catch (error) {
    console.error("Error generating answer:", error);
    res.status(500).json({ error: "Error generating answer" });
  }
});

//Endpoint do zapisywania promptu i odpowiedzi
app.post("/api/chats", async (req, res) => {
  try {
    const { prompt, response } = req.body;

    if (!prompt || !response) {
      return res
        .status(400)
        .json({ error: "Prompt and response are required" });
    }

    // const newPrompt = new Prompt({ prompt, response });

    // const savedChat = await newPrompt.save();
    // console.log(savedChat)

    // res.status(201).json(savedChat);
    const newChat = new Chat({
      // userId,
      history: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
        {
          role: "model",
          parts: [{ text: response }],
        },
      ],
    });

    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    console.error("Error saving prompt and response:", error);
    res.status(500).json({ error: "Error saving prompt and response" });
  }
});

//UPDATE RESPONSE BY USER
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

    res
      .status(200)
      .json({ message: "Response updated successfully", updatedPrompt });
  } catch (error) {
    console.error("Error updating response:", error);
    res.status(500).json({ error: "Error updating response" });
  }
});

// Konfiguracja transportera Nodemailer (SMTP)
const transporter = nodemailer.createTransport({
  service: "Gmail", // Możesz użyć innych usług, np. Outlook, Yahoo
  auth: {
    user: process.env.EMAIL_USER, // Twój e-mail
    pass: process.env.EMAIL_PASS, // Twoje hasło lub App Password
  },
});

// Backend: Express endpoint do wysyłania maili
app.post("/api/send-email", async (req, res) => {
  const { recipientEmail, title, content, pdfLink } = req.body;

  if (!recipientEmail || !title || !content) {
    return res.status(400).json({ error: "Brak wymaganych danych" });
  }

  try {
    // Zbudowanie treści e-maila
    const mailOptions = {
      from: process.env.EMAIL_USER, // Adres nadawcy
      to: recipientEmail, // Adres odbiorcy
      subject: `Notatka: ${title}`, // Temat e-maila
      html: `
        <h1>${title}</h1>
        <p>${content}</p>
        ${pdfLink ? `<p><a href="${pdfLink}">Otwórz PDF</a></p>` : ""}
      `,
    };

    // Wysyłanie e-maila
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Mail wysłany!" });
  } catch (error) {
    console.error("Błąd podczas wysyłania maila:", error);
    res.status(500).json({ error: "Nie udało się wysłać maila." });
  }
});

app.listen(port, () => {
  connect();
  console.log(`Server is running on ${port}`);
});
