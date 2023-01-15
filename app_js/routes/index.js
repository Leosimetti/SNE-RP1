const express = require("express");
const api = require("../api");
const {URLS} = require("../api");
const router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
    const AMOUNT = 4;
    const randomBackground = true;

    const response = {
        posts: await api.getPosts(AMOUNT),
        img_url: await api.getBackImage(randomBackground),
        audio_src: URLS.RADIO,
    }

    console.log(response);
    res.render("index", response);
});

module.exports = router;
