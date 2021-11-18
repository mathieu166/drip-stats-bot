import express, { json, urlencoded } from 'express';
const app = express();
import router from './routes/router.js';

app.use(json());
app.use(urlencoded());

app.use('/', router);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  
  return;
});

export default app