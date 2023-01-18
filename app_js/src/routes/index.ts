import express from 'express'
import { URLS, getBackImage, getPosts } from '../api'

export const router = express.Router()

/* GET home page. */
router.get('/', async function (req, res, next) {
  const AMOUNT = 5
  const RANDOM_BACKGROUND = true

  console.log({
    posts: getPosts(AMOUNT),
    img_url: getBackImage(RANDOM_BACKGROUND),
    audio_src: URLS.RADIO,
  })

  res.render('index', {
    posts: await getPosts(AMOUNT),
    img_url: await getBackImage(RANDOM_BACKGROUND),
    audio_src: URLS.RADIO,
  })
})
