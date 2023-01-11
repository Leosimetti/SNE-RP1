const express = require("express");
const api = require("../api");
const router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
  const AMOUNT = 4;
  const randomBackground = true;

  console.log({
    posts: api.getPosts(AMOUNT),
    img_url: api.getBackImage(randomBackground),
    audio_src: api.RADIO_URL,
  });

  res.render("index", {
    posts: await api.getPosts(AMOUNT),
    img_url: await api.getBackImage(randomBackground),
    audio_src: api.RADIO_URL,
  });
});

module.exports = router;
