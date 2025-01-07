const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRouters = require('../routers/index');
const cookieParser = require('cookie-parser');

const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json())
app.use(cookieParser());
app.use("/api", authRouters)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando ${PORT}`);
})