import express from 'express'
import { URLS, getBackImage, getPosts, getEnvOrDefault } from '../api'
import { z } from 'zod'
import * as mongoose from 'mongoose'

export const router = express.Router()
mongoose.connect(process.env.dbUrl).then((r) => console.log('Connected'))
const Comment = mongoose.model('Comment', new mongoose.Schema({ text: String, pic: Number }))
const AMOUNT = Number(getEnvOrDefault('AMOUNT', '5'))
const randomBackground = JSON.parse(getEnvOrDefault('RANDOM_BACKGROUND', 'true'))

async function load_page(res) {
  const posts = await getPosts(AMOUNT)
  res.render('index', {
    posts: posts,
    comments: await Comment.find(),
    img_url: await getBackImage(randomBackground),
    audio_src: URLS().RADIO,
  })
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  await load_page(res)
})

router.post('/', async function (req, res, next) {
  const commentZ = z.string().min(1).max(240)
  try {
    const comment = commentZ.parse(req.body.comm_input)
    console.log(`User posted: ${comment}`)
    await Comment.create({
      text: comment,
      pic: Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000,
    })
  } catch {
    console.log('User posted invalid comment')
  }
  await load_page(res)
})
