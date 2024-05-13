import express from 'express';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import BaseRouter from './routes'


const app = express();

const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(BaseRouter);

app.listen(port, () => {
  console.log(`listening on port ${port}!`);
});