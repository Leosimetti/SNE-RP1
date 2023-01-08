var express = require('express');
const fetch = require("node-fetch");
var router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
    const amount = 4
    const randomBackground = true
    const radio_url = "http://91.219.74.220:8000/Vanya.ogg"
    
    const apiKey =  process.env.apiKey

    const back_pic_url = randomBackground ? (await (await fetch("https://api.waifu.pics/sfw/bully")).json()).url : 'https://i.waifu.pics/PGj1tg7.gif'
    const cats = (await (await fetch(`https://api.thecatapi.com/v1/images/search?limit=${amount}&api_key=${apiKey}`)).json()).map((cat) => cat.url)
    const descriptions = await (await fetch('https://binaryjazz.us/wp-json/genrenator/v1/story/' + amount)).json()
    const posts = cats.map((catPic, index) => (
            {
                pic: catPic,
                content: descriptions[index]
            }
        )
    )

    res.render('index', {
        posts: posts,
        img_url: back_pic_url,
        audio_src: radio_url
    })
});

module.exports = router;
