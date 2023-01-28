const express = require('express');
require('dotenv').config();
const app = express();
const genRouter = require('./routers/router');
const cookieParser = require("cookie-parser");
let {checkUser} = require('./middlewares/authMiddleware');
// prisma 
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
app.locals.prisma = prisma;
// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

//Router middleware 
app.get('*',checkUser);
app.use('/',genRouter);


let port = process.env.PORT || 3000;
app.listen(port,()=>{
  console.log("listening on http://localhost:"+port);
})

process.on("SIGINT", async (req,res) => {
  await app.locals.prisma.$disconnect();
  process.exit(0);
});
