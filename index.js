import dotenv from 'dotenv'
dotenv.config();

import express from 'express'
import bodyParser from 'body-parser';
import axios from 'axios';
import nodeHtmlToImage from 'node-html-to-image';
import buildHtml from './html/build-html.js'

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

import getDepositCounts from './http/getDepositCounts.js';

const { TOKEN, SERVER_URL } = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL = SERVER_URL + URI
const PORT = process.env.PORT || 3000

const RANK_IMAGE_NAME = 'rankings.jpg'
const MS_BETWEEN_UPDATES = 10 * 60 * 1000 // 10 MINUTES
var lastCheck = new Date().getTime() - MS_BETWEEN_UPDATES*2 //Force update on restart

const app = express()
app.use(bodyParser.json())
app.use(express.static('public'))
app.set('etag', false)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
  console.log(res.data)
}

app.get('/getImage', (req, res) => {
  return res.sendFile(__dirname + '/temp/' + RANK_IMAGE_NAME);
})

app.post(URI, async (req, res) => {
  if(!req.body.message){
    console.log('Request from unknwon source ', req.get('host'))
    return res.status(400).send({
      message: 'What are you trying to do man!!??'
    });
  }
  const chatId = req.body.message.chat.id
  const username = req.body.message.from.username
  const text = req.body.message.text
  console.log('Request from ' + chatId + ' @' + username)
  
  var tg_response = "";
  if (text && text === '/start') {
    tg_response = "Please, use /show_ranks command to show the current DRIP rankings";
    
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: tg_response
    })
  } else if (text && text === '/show_ranks') {
    try {
      const now = new Date().getTime();
      const nextUpdate = lastCheck + MS_BETWEEN_UPDATES;
      if(now > nextUpdate){
        lastCheck = now;
        const stats = await getDepositCounts([
          1, 10, 50, 100, 500, 1000, 2000, 5000
        ])

        await nodeHtmlToImage({
          output: 'temp/' + RANK_IMAGE_NAME,
          html: buildHtml(stats.data, chatId, __dirname),
          puppeteerArgs: { args: ['--no-sandbox'] },
          quality: process.env.IMAGE_QUALITY || 80,
        });
      }

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: 'Hang on... '
      })
      
      await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        caption: "Ranks",
        photo: SERVER_URL + '/getImage?chatId=' +chatId + '&dynamic=' + Math.random()
      })

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: 'Please, consider dotating to the dev wallet, if you enjoy my work!'
      })
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: '0x1e4ec21e0643B689d252A1462C8f126156e62c21'
      })


    } catch (e) {
      console.log('the error', e)
    }
  } else {
    tg_response = "<b>WTF</b> are you talking about!?!?";
  }

  return res.send()
})

app.listen(PORT, async () => {
  console.log('🚀 app running on port', PORT)
  await init()
})