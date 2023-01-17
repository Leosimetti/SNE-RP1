const express = require("express");
const api = require("../api");
const {URLS} = require("../api");
const {response} = require("express");
const mongoose = require('mongoose');
const router = express.Router();
mongoose.connect('mongodb://admin:admin@localhost:27017', {useNewUrlParser: true})
const Comment = mongoose.model('Comment', new mongoose.Schema({ text: String, pic: Number }));


const AMOUNT = 4;
const randomBackground = true;
async function load_page(res){
    res.render("index", {
        posts: await api.getPosts(AMOUNT),
        comments: await Comment.find(),
        img_url: await api.getBackImage(randomBackground),
        audio_src: URLS.RADIO,
    });
}

/* GET home page. */
router.get("/", async function (req, res, next) {
    await load_page(res)
    console.log(res);
});

router.post("/", async function (req, res, next) {
    const comment = req.body.comm_input

    await Comment.create({ text: comment, pic: Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000 });
    await load_page(res)
    console.log(res);
})

module.exports = router;
