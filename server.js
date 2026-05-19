const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("video"), (req, res) => {
  const input = req.file.path;
  const output = "output.mp4";

  const cmd = `
ffmpeg -i ${input} \
-r 60 -vsync cfr \
-c:v libx264 -profile:v high -level 4.2 \
-preset veryfast \
-g 120 -keyint_min 120 -sc_threshold 0 \
-b:v 16M -maxrate 20M -bufsize 30M \
-pix_fmt yuv420p \
-c:a aac -b:a 128k \
-movflags +faststart ${output}
`;

  exec(cmd, (err) => {
    if (err) return res.send("Error");

    res.download(output, () => {
      fs.unlinkSync(input);
      fs.unlinkSync(output);
    });
  });
});

app.listen(3000, () => console.log("RUNNING"));
