import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config();

const URL = process.env.API_URL || 'http://localhost:3000/'

export default async function get(route, params) {
  try {
    const encodedUrl = encodeURI(URL + route + (params ? '?' + params : ''))
    
    const response = await axios.get(encodedUrl)
    return response
  } catch (e) {
    console.log(e.message)
  }
}
