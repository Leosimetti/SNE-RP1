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

router.get('/metrics', async function (req, res, next) {
  res.send("# HELP http_requests_total The total number of HTTP requests.\n" +
    "# TYPE http_requests_total counter\n" +
    "http_requests_total{method=\"post\",code=\"200\"} 1027 1395066363000\n" +
    "http_requests_total{method=\"post\",code=\"400\"}    3 1395066363000\n" +
    "\n" +
    "# Escaping in label values:\n" +
    "msdos_file_access_time_seconds{path=\"C:\\\\DIR\\\\FILE.TXT\",error=\"Cannot find file:\\n\\'FILE.TXT\\'\"} 1.458255915e9\n" +
  "\n" +
  "# Minimalistic line:\n" +
  "metric_without_timestamp_and_labels 12.47\n" +
  "\n" +
  "# A weird metric from before the epoch:\n" +
  "something_weird{problem=\"division by zero\"} +Inf -3982045\n" +
  "\n" +
  "# A histogram, which has a pretty complex representation in the text format:\n" +
  "# HELP http_request_duration_seconds A histogram of the request duration.\n" +
  "# TYPE http_request_duration_seconds histogram\n" +
  "http_request_duration_seconds_bucket{le=\"0.05\"} 24054\n" +
  "http_request_duration_seconds_bucket{le=\"0.1\"} 33444\n" +
  "http_request_duration_seconds_bucket{le=\"0.2\"} 100392\n" +
  "http_request_duration_seconds_bucket{le=\"0.5\"} 129389\n" +
  "http_request_duration_seconds_bucket{le=\"1\"} 133988\n" +
  "http_request_duration_seconds_bucket{le=\"+Inf\"} 144320\n" +
  "http_request_duration_seconds_sum 53423\n" +
  "http_request_duration_seconds_count 144320\n" +
  "\n" +
  "# Finally a summary, which has a complex representation, too:\n" +
  "# HELP rpc_duration_seconds A summary of the RPC duration in seconds.\n" +
  "# TYPE rpc_duration_seconds summary\n" +
  "rpc_duration_seconds{quantile=\"0.01\"} 3102\n" +
  "rpc_duration_seconds{quantile=\"0.05\"} 3272\n" +
  "rpc_duration_seconds{quantile=\"0.5\"} 4773\n" +
  "rpc_duration_seconds{quantile=\"0.9\"} 9001\n" +
  "rpc_duration_seconds{quantile=\"0.99\"} 76656\n" +
  "rpc_duration_seconds_sum 1.7560473e+07\n" +
  "rpc_duration_seconds_count 2693")
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
