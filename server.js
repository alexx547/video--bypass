const express = require("express");
const multer = require("multer");
const cors = require("cors");
const ffmpegPath = require("ffmpeg-static");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(cors());

const upload = multer({
  dest: "uploads/"
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando ✔");
});

app.post("/upload", upload.single("video"), (req, res) => {

  if (!req.file) {
    return res.status(400).send("No video uploaded");
  }

  const input = req.file.path;
  const output = `output-${Date.now()}.mp4`;

  const cmd = `
"${ffmpegPath}" -y -i "${input}" \
-r 60 \
-vsync cfr \
-c:v libx264 \
-preset ultrafast \
-profile:v high \
-level 4.2 \
-g 120 \
-keyint_min 120 \
-sc_threshold 0 \
-b:v 16M \
-maxrate 20M \
-bufsize 30M \
-pix_fmt yuv420p \
-c:a aac \
-b:a 128k \
-movflags +faststart \
"${output}"
`;

  console.log(cmd);

  exec(cmd, (err) => {

    if (err) {
      console.error(err);
      return res.status(500).send("FFmpeg Error");
    }

    res.download(output, () => {

      try {
        fs.unlinkSync(input);
        fs.unlinkSync(output);
      } catch {}

    });

  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
