const config=require("config");
const express=require("express");
const mongoose=require("mongoose");
const path=require('path');
const bodyParser=require("body-parser");
var schedule = require('node-schedule');
const router = express.Router();
var app=express();
app.use(express.json());
app.use(express.static(__dirname + '/public'));//allows access to public directory
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router);//use app/router要放在最後(至少要bodyParser之後)
const CrawlerPost=require('./routes/CrawlerData');
const DoCrawler=require('./Crawler/DoCrawler');
const CrawlerMenuSchema=require('./routes/CrawlerMenuSchema');

mongoose.connect(
  'mongodb+srv://jack:k65432110@postchapter-nxl4n.mongodb.net/test?retryWrites=true&w=majority',
  { useUnifiedTopology: true },
  ()=>console.log("Connected mongoose!")
)
const PAGE_TOKEN=config.get('devConfig.pageAccessToken');
const VERIFY_TOKEN_0=config.get('devConfig.verifyToken');

schedule.scheduleJob('0 0 * * *', function(){// 秒/分/時/日/月/星期
  console.log('Schedule Run!!!');
  DoCrawler.CrawlerAll();
});
router.get('/news', (req, res) => {//router Render html
  res.sendFile(path.join(__dirname, './public', 'showPost.html'))
});
router.get('/crawler', (req, res) => {//router Render html
  res.sendFile(path.join(__dirname, './public', 'Crawlering.html'))
});
router.get('/menu', (req, res) => {//router Render html
  res.sendFile(path.join(__dirname, './public', 'showMenus.html'))
});
router.post('/getAllTime',async function(req, res) {//取得DB 多少筆天數資料
  let datas=await CrawlerPost.CrawlerGetAllSchema();
  res.send({data:datas});
});
router.get('/getAllmenu',async function(req, res) {//取得DB 多少筆天數資料
  let datas=await CrawlerMenuSchema.GetAllMenu();
  //res.send({data:datas});
  res.send(datas);
});
router.get('/getData',async function(req, res) {//抓該schema的crawler資料
  let VAL;
  let TP=0;
  let KIND=req.query.kind;
  if(Object.keys(req.query)[0]=='_id'){//if use _id findOne
    VAL=req.query['_id'];    
    TP=1;
  }else{//if use 日期 findOne
    let Days=req.query.date;
    Days=Days.split(',');
    VAL=new Date(parseInt(Days[0]),parseInt(Days[1]),parseInt(Days[2]));
  }  
  let datas=await CrawlerPost.CrawlerGetSchema(
    Object.keys(req.query)[0],
    VAL,
    TP,
    KIND
  );
  res.send({data:datas});
});
router.post('/UpdateMenu',async function(req, res, next) {  
  let re=await CrawlerMenuSchema.InsertMenu(req.body);
  res.send({data:re});
});
router.post('/DoCrawler',async function(req, res, next) {//執行爬蟲 爬當下
  req.connection.setTimeout( 1000 * 60 * 30 );//設置30分鐘 避免再次執行crawler
  console.log("App DoCrawler!!");
  //let datas=await DoCrawler.ManyCraynamicPuppeteer();
  //console.log(datas);
  //res.send({data:datas});
  DoCrawler.CrawlerAll();
  res.send({data:'Do All Start!!'});
});
router.post('/DoACrawler',async function(req, res, next) {//執行爬蟲 爬當下
  req.connection.setTimeout( 1000 * 60 * 10 );//設置10分鐘 避免再次執行crawler
  console.log("App Do A Crawler!!");
  let datas=await DoCrawler.DoAPuppeteer(req.body.urls,req.body.kind);
  res.send({data:datas});
});
router.post('/ChangeDB',async function(req, res, next) {//修改 該id的DB data
  //console.log(req.body);    
  let datas=await CrawlerPost.ChangeSchema(req.body.id,req.body.val);  
  res.send({data:datas});
}); 
app.listen(process.env.port || 4000,function(){  
  console.log("LS4000");
});
 