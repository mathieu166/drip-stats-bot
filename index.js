import app from './server.js'

import dotenv from 'dotenv'
dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
