var express = require("express");
var cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

var app = express();

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  if (req.file === undefined) {
    res.json({ error: "file invalid or you didn't provide any file" });
    res.end();
  } else {
    const { originalname, mimetype, size } = req.file;
    res.json({ name: originalname, type: mimetype, size });
  }
});

const port = 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
