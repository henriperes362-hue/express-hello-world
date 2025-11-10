import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import FormData from "form-data";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// rota de teste
app.get("/", (req, res) => {
  res.send("🚀 Ark Scan 3D backend ativo e pronto!");
});

// rota de upload e envio pra KIRI API
app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const KIRI_API_KEY = process.env.KIRI_API_KEY;
    if (!KIRI_API_KEY) {
      return res.status(400).json({ error: "API key não configurada" });
    }

    const formData = new FormData();
    req.files.forEach((file) => {
      formData.append("files", fs.createReadStream(file.path));
    });

    const response = await fetch("https://api.kiriengine.app/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${KIRI_API_KEY}` },
      body: formData,
    });

    const data = await response.json();

    // limpa os arquivos temporários
    req.files.forEach((file) => fs.unlinkSync(file.path));

    if (response.ok) {
      res.json({
        message: "✅ Upload enviado com sucesso pra KIRI!",
        data,
      });
    } else {
      res.status(500).json({
        error: "❌ Erro ao enviar pra KIRI",
        details: data,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.listen(PORT, () => console.log(`🔥 Servidor rodando na porta ${PORT}`));