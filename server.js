const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// const week = ['Mon', 'Tue', 'Wed', "Thu", "Fri", "Sat", "Sun"]
// const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const mongo =
  "mongodb+srv://Alston-url:JaONjYpc95dqCYjd@cluster0.14p2z.mongodb.net/exerciseTracker?retryWrites=true&w=majority";
mongoose
  .connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log("connected to mongodb"))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("user", userSchema);

const exerciseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  ids: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

const Exercise = mongoose.model("exercise", exerciseSchema);

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app
  .route("/api/users")
  .post((req, res) => {
    try {
      if (req.body.username) {
        User.findOne({ username: req.body.username }, async (err, data) => {
          if (err) return res.end(err);
          if (data) {
            res.json({
              username: data.username,
              _id: data._id,
            });
          } else {
            const newUser = new User({ username: req.body.username });
            newUser.save();
            const thisUser = await User.findOne({
              username: req.body.username,
            });
            res.json({
              username: thisUser.username,
              _id: thisUser._id,
            });
          }
        });
      } else {
        res.send("You have to enter a username");
      }
    } catch (error) {
      console.log(error);
      res.send("error + /api/users");
    }
  })
  .get(async (req, res) => {
    const allUser = await User.find();
    res.json(allUser);
  });

app.post("/api/users/:_id/exercises", async (req, res) => {
  let { description, duration, date } = req.body;
  if (!description) return res.end("You have to enter a description");
  if (!duration) return res.end("You have to enter a duration");
  duration = parseInt(duration);
  if (!date) {
    function formatDate() {
      const d = new Date();
      const newD = d.toString().slice(0, 15);
      return newD;
    }
    date = formatDate();
  }
  function formatDateTwo(date) {
    const d = new Date(date);
    const newD = d.toString().slice(0, 15);
    return newD;
  }
  date = formatDateTwo(date);
  try {
    const thisUser = await User.findById(req.params._id);
    const newExercise = new Exercise({
      description,
      duration,
      date,
      ids: thisUser._id,
      username: thisUser.username,
    });
    newExercise.save();
    // const thisExercise = await Exercise.findOne({ ids: req.params._id });
    // const { ids, username, description, duration, date } = thisExercise;
    res.json({
      _id: thisUser._id,
      username: thisUser.username,
      date,
      duration,
      description,
    });
  } catch (error) {
    res.end("error");
    console.log(error);
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const thisUser = await User.findById(req.params._id);
    const thisExercise = await Exercise.find({ ids: req.params._id });
    // console.log(thisUser, thisExercise);
    function isBetweenTime(data) {
      const dateFrom = new Date(req.query.from);
      const dateTo = new Date(req.query.to);
      const dateThis = new Date(data.date);
      if (dateTo >= dateThis && dateFrom <= dateThis) {
        return true;
      } else {
        return false;
      }
    }

    if (req.query.from && req.query.to) {
      const time = thisExercise.filter(isBetweenTime);
    }

    if (req.query.limit) {
      thisExercise.splice(0, req.query.limit);
    }
    res.json({
      _id: thisUser._id,
      username: thisUser.username,
      count: thisExercise.length,
      log: thisExercise.map((data) => {
        const { description, duration, date } = data;
        return { description, duration, date };
      }),
    });
  } catch (error) {
    res.end(error);
  }
});

app.use("/*", (req, res) => {
  res.status(404).send("Not Found");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
