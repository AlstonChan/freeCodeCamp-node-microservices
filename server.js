require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
var dns = require("dns");
const { nanoid } = require("nanoid");
const myWebUrl = "https://UrlShortener-freeCodeCamp.alstonchan.repl.co"; //when using replit

const mongo = process.env.MONGOCRED;
mongoose
  .connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(err));

const urlShortenSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
  shorten_url: String,
});

const UrlShorten = mongoose.model("UrlShorten", urlShortenSchema);
// Basic Configuration
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  try {
    const myURL = new URL(req.body.url);
    // console.log(myURL.protocol);
    if (myURL.protocol == "http:" || myURL.protocol == "https:") {
      dns.lookup(myURL.host, function onLookup(err, addresses, family) {
        if (addresses) {
          UrlShorten.exists({ original_url: myURL.href }, async (err, doc) => {
            if (err) {
              console.log(err);
            } else if (doc) {
              const shortPath = await UrlShorten.findOne({
                original_url: myURL.href,
              });
              res.json({
                original_url: req.body.url,
                short_url: shortPath.short_url,
                shorten_url: shortPath.shorten_url,
              });
            } else {
              const shortPath = nanoid(20);
              const shorten_url = `${req.hostname}/api/shorturl/${shortPath}`;
              const shortUrl = new UrlShorten({
                original_url: req.body.url,
                short_url: shortPath,
                shorten_url,
              });

              shortUrl.save();
              res.json({
                original_url: req.body.url,
                short_url: shortPath,
                shorten_url,
              });
            }
          });
        } else {
          res.json({ error: "invalid url" });
        }
      });
    } else {
      res.json({ error: "invalid url" });
    }
  } catch (error) {
    res.json({ error: "invalid url" });
    res.end;
  }
  // console.log(myURL);
});

app.get("/api/shorturl/:route", async (req, res) => {
  const { route } = req.params;
  route.toString();
  // console.log(typeof route);
  try {
    const ans = await UrlShorten.findOne({ short_url: route }, (err, data) => {
      if (err) console.log(err);
      // console.log(data);
      // console.log(route);
    });
    if (ans) {
      res.redirect(ans.original_url);
    } else {
      res.send("Not found");
    }
  } catch (error) {
    console.log(error);
  }
  // console.log(ans);
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
