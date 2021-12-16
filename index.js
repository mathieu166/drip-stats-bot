import dotenv from 'dotenv'
dotenv.config();

import fs from 'fs'
import express from 'express'
import bodyParser from 'body-parser';
import axios from 'axios';
import nodeHtmlToImage from 'node-html-to-image';
import buildRankingHtml from './html/build-ranking-html.js'
import buildChartHtml from './html/build-chart-html.js'

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
const NEW_ACCOUNTS_30_DAYS = 'chart_new_accounts_30_days.jpg'
const NEW_ACCOUNTS_MONTHLY = 'chart_new_accounts_monthly.jpg'

const MS_BETWEEN_UPDATES = 10 * 60 * 1000 // 10 MINUTES
var lastCheck = new Date().getTime() - MS_BETWEEN_UPDATES*2; //Force update on restart

var lastCheckCharts = {
  newAccounts30days: lastCheck,
  newAccountMonthly: lastCheck
}

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
  const chart = req.query.chart;
  if(chart){
    if(chart === 'last30days'){
      return res.sendFile(__dirname + '/temp/' + NEW_ACCOUNTS_30_DAYS);    
    }else if(chart === 'monthly'){
      return res.sendFile(__dirname + '/temp/' + NEW_ACCOUNTS_MONTHLY);    
    }
  }
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
          0.9, 10, 50, 100, 500, 1000, 2000, 5000
        ])

        await nodeHtmlToImage({
          output: 'temp/' + RANK_IMAGE_NAME,
          html: buildRankingHtml(stats.data, chatId, __dirname),
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
        photo: SERVER_URL + '/getImage?timestamp='+new Date().getTime()
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
  } else if (text && text === '/show_last_30_days_new_accounts') {
    try {
      const now = new Date().getTime();
      const nextUpdate = lastCheckCharts.newAccounts30days + MS_BETWEEN_UPDATES;
      const fileExists = fs.existsSync(__dirname + '/temp/' + NEW_ACCOUNTS_30_DAYS)
      if(now > nextUpdate || !fileExists){
        lastCheckCharts.newAccounts30days = now;
        const chartId = '52daca07-c1f1-4e80-b099-9c8c15aeee3b';
        await nodeHtmlToImage({
          output: 'temp/' + NEW_ACCOUNTS_30_DAYS,
          html: buildChartHtml(chartId, __dirname),
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
        caption: "Last 30 days - New Accounts",
        photo: SERVER_URL + '/getImage?chart=last30days&timestamp='+new Date().getTime()
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
  }else if (text && text === '/show_monthly_new_accounts') {
    try {
      const now = new Date().getTime();
      const nextUpdate = lastCheckCharts.newAccountMonthly + MS_BETWEEN_UPDATES;
      const fileExists = fs.existsSync(__dirname + '/temp/' + NEW_ACCOUNTS_MONTHLY)
      if(now > nextUpdate || !fileExists){
        lastCheckCharts.newAccountMonthly = now;
        const chartId = 'c7266f7d-a82f-4bd3-bf26-a7f07ab160f6';
        await nodeHtmlToImage({
          output: 'temp/' + NEW_ACCOUNTS_MONTHLY,
          html: buildChartHtml(chartId, __dirname),
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
        caption: "Monthly - New Accounts",
        photo: SERVER_URL + '/getImage?chart=monthly&timestamp='+new Date().getTime()
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
  }
  else {
    tg_response = "<b>WTF</b> are you talking about!?!?";
  }

  return res.send()
})

app.listen(PORT, async () => {
  console.log('🚀 app running on port', PORT)
  await init()
})