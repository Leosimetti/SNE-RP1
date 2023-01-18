import express from "express";
import { URLS, getBackImage, getPosts, getEnvOrDefault } from "../api";
import * as mongoose from "mongoose";

export const router = express.Router();
mongoose.connect("mongodb://admin:admin@mongo-nodeport-svc:27017").then(r => console.log("Connected"));
const Comment = mongoose.model("Comment", new mongoose.Schema({ text: String, pic: Number }));
const AMOUNT = Number(getEnvOrDefault("AMOUNT", "5"));
const randomBackground = JSON.parse(getEnvOrDefault("RANDOM_BACKGROUND", "true"));


async function load_page(res) {
  const posts = await getPosts(AMOUNT);
  res.render("index", {
    posts: posts,
    comments: await Comment.find(),
    img_url: await getBackImage(randomBackground),
    audio_src: URLS.RADIO
  });
}

/* GET home page. */
router.get("/", async function(req, res, next) {
  await load_page(res);
  console.log(res);
});

router.post("/", async function(req, res, next) {
  const comment = req.body.comm_input;

  await Comment.create({ text: comment, pic: Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000 });
  await load_page(res);
  console.log(res);
});
