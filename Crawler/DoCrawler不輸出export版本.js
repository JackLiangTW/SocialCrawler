const puppeteer= require('puppeteer');
const fs = require('fs');
const CrawlerPost=require('../routes/CrawlerData');
const mongoose=require("mongoose");
mongoose.connect(
  'mongodb+srv://jack:k65432110@postchapter-nxl4n.mongodb.net/test?retryWrites=true&w=majority',
  { useUnifiedTopology: true },
  ()=>console.log("Connected mongoose!")
)

let dataName="CP0";//妹子團
const loopdata=[
  {name:'加藤軍2.0',type:0,url:'https://www.facebook.com/pg/KATOTAKA2.0/posts/'},
  {name:'爆料公社',type:0,url:'https://www.facebook.com/pg/%E7%88%86%E6%96%99%E5%85%AC%E7%A4%BE-162608724089621/posts'},
  {name:'蘋果日報',type:0,url:'https://www.facebook.com/pg/appledaily.tw/posts/?ref=page_internal'},
  /*XX*/{name:'妹子團',type:0,url:'https://www.facebook.com/pg/%E5%A6%B9%E5%AD%90%E5%B0%88%E5%8D%80-823320937840113/posts/'},
  {name:'BC&Lowy',type:0,url:'https://www.facebook.com/pg/bclowy/posts/?ref=page_internal'},
  {name:'梗圖集中營',type:1,url:'https://www.facebook.com/groups/256720108361190/?ref=group_browse'},  
  {name:'提姆正妹',type:0,url:'https://www.facebook.com/pg/timliaofb.beauty/posts/?ref=page_internal'},    
  {name:'地球圖輯',type:0,url:'https://www.facebook.com/pg/yamworld/posts/?ref=page_internal'},
];

ManyCraynamicPuppeteer();
//Craynamic_puppeteer(5);

async function ManyCraynamicPuppeteer(){//--puppeteer套件 動態抓取/最好的
  (async () => {
    const browser = await puppeteer.launch({
      headless: false //--code run open browser
    });
    const page = await browser.newPage();        
    await page.goto(loopdata[0].url);
    await page.setViewport({width:1000, height: 800});//--設定開啟虛擬瀏覽器寬高
    
    let BARR=[];
    let control=0;
    while(control<loopdata.length){
        let JData={
          title:loopdata[control].name,
          url:loopdata[control].url,
          data_txt:[],
        }
        //let data_txt;

        if(control!=0){          
          await page.goto(loopdata[control].url);
          await WaitASec(2000);
        }        
        await autoScroll(page);
        console.log("CStart:"+control+"/"+loopdata.length);
        
        if(loopdata[control].type==0)JData.data_txt=await GetDataFanGroup(page);//如果是粉專
        else if(loopdata[control].type==1)JData.data_txt=await GetDataGroup(page);//如果是社團
        //dataName=loopdata[control].name;
        //Dojson(data_txt,dataName);
        BARR.push(JData);
        console.log("CEnd:"+control+"/"+loopdata.length);
        control++;
    }

    await CrawlerPost.CrawlerCreateSchema(BARR);
    await browser.close();
    return BARR;
    
  })();
}

function Craynamic_puppeteer(nb){//--puppeteer套件 動態抓取/最好的
  (async () => {
    const browser = await puppeteer.launch({
      headless: false //--code run open browser
    });
    const page = await browser.newPage();
    await page.goto(loopdata[nb].url);
    await page.setViewport({width:1000, height: 800});//--設定開啟虛擬瀏覽器寬高
        
    let control=0;
    while(control<1){
        let data_txt;    
        //dataName=loopdata[nb].name;
        dataName='CP00';
        await autoScroll(page);        
        if(loopdata[nb].type==0)data_txt=await GetDataFanGroup(page);//如果是粉專
        else if(loopdata[nb].type==1)data_txt=await GetDataGroup(page);//如果是社團

        control++;
    }    
    Dojson(data_txt,dataName);

    //await browser.close();
    
  })();
}

async function GetDataFanGroup(page){//抓公開社團用 
 return await page.evaluate(//get data-utime OK
    () =>
        [...document.querySelectorAll('._14i5 ._1xnd > ._4-u8')]                  
        .map(function(i) {
                var heads=i.querySelector('._5eit abbr');//抓element(icon/ID/time區)
                var id=i.querySelector('._5eit h5 a');//抓element(icon/ID/time區)
                var likeA=i.querySelector('._7a9u span._81hb');//抓like數 element 
                var msgA=i.querySelector('._7a9u a._3hg-');//抓留言數 element 
                var content=i.querySelector('div.userContent p');//PO文字內容 element                         
                var content_img=i.querySelector('img.scaledImageFitWidth');//PO文圖片 element 1
                if(content_img==null)content_img=i.querySelector('img.scaledImageFitHeight');//PO文圖片 element 2
                var OBJ = {};
                var TT={};                   
                //OBJ['child'] = heads.childNodes[0].getAttribute('class');//抓><span>
                if(heads!=null){
                  OBJ['date'] = heads.title;
                  OBJ['nb'] = heads.getAttribute('data-utime');
                }

                if(id!=null){
                  OBJ['name'] = id.textContent;
                  OBJ['url'] = id.getAttribute('href');
                }                        

                if(likeA!=null){//OBJ['likes'] = likeA.textContent;
                  let numb=likeA.textContent;
                  if(numb.includes('萬')){
                    numb.split("萬");
                    numb=numb+"000";
                  }
                  numb = numb.match(/\d/g);
                  numb = parseInt(numb.join(""));                          
                  OBJ['likes'] = numb;
                }else{OBJ['likes'] = 0;}

                if(msgA!=null){
                  OBJ['msg'] = msgA.textContent;
                }else{OBJ['msg'] = "0則留言";}

                if(content!=null)OBJ['content'] = content.textContent;

                if(content_img!=null){
                  //OBJ['img-data-src'] = content_img.getAttribute('data-src');
                  OBJ['img-src'] = content_img.getAttribute('src');
                }

                return OBJ;
        })
    );
}

async function GetDataGroup(page){//抓公開社團用 
   return await page.evaluate(//get data-utime OK
      () =>
          [...document.querySelectorAll('._14i5 ._5pcb > ._4-u8')]                  
          .map(function(i) {
                  var heads=i.querySelector('._5eit abbr');//抓element(icon/ID/time區)
                  //var id=i.querySelector('._5eit h5 ._39_n');//抓element(icon/ID/time區)
                  var id=i.querySelector('._5eit h5');//抓element(icon/ID/time區)
                  var likeA=i.querySelector('._7a9u span._81hb');//抓like數 element 
                  var msgA=i.querySelector('._7a9u a._3hg-');//抓留言數 element 
                  var content=i.querySelector('div.userContent p');//PO文字內容 element                         
                  var content_img=i.querySelector('img.scaledImageFitWidth');//PO文圖片 element 1
                  if(content_img==null)content_img=i.querySelector('img.scaledImageFitHeight');//PO文圖片 element 2
                  var OBJ = {};               
                  //OBJ['child'] = heads.childNodes[0].getAttribute('class');//抓><span>
                  if(heads!=null){
                    OBJ['date'] = heads.title;
                    OBJ['nb'] = heads.getAttribute('data-utime');
                  }

                  if(id!=null){
                    OBJ['name'] = id.textContent;
                    //OBJ['url'] = id.getAttribute('href');
                  }                        

                  if(likeA!=null){//OBJ['likes'] = likeA.textContent;
                    let numb=likeA.textContent;
                    if(numb.includes('萬')){
                      numb.split("萬");
                      numb=numb+"000";
                    }
                    numb = numb.match(/\d/g);
                    numb = parseInt(numb.join(""));                          
                    OBJ['likes'] = numb;
                  }else{OBJ['likes'] = 0;}

                  if(msgA!=null){
                    OBJ['msg'] = msgA.textContent;
                  }else{OBJ['msg'] = "0則留言";}

                  if(content!=null)OBJ['content'] = content.textContent;

                  if(content_img!=null){                          
                    OBJ['img-src'] = content_img.getAttribute('src');
                  }
                  return OBJ;
          })
  );

}

async function autoScroll(page){//---劉覽器  自動往下滑
  await page.evaluate(async () => {      
      await new Promise((resolve, reject) => {                        
          var distance = 400;
          var Maxsceonds = 10000;//--秒數
          var CountSec= 0;//--秒數
          var timer = setInterval(() => {
              window.scrollBy(0, distance);              
              CountSec=CountSec+ 100;//--秒數                            
              if(CountSec >= Maxsceonds){
                  clearInterval(timer);
                  console.log("Scroll DONE");
                  resolve();                                 
              }
          }, 100);
      });
  });
}

function Dojson(arr,name){  
  let jj0=JSON.stringify(arr);  
  //fs.writeFileSync(`${name}.json`,jj);//把Object轉成json處存
  let jj=`var ${name}=${jj0}`;
  fs.writeFileSync(`${name}.js`,jj);//把Object轉成json處存
}

function WaitASec(a){  
  return new Promise(function(resolve, reject) {
      setTimeout(function(){          
          resolve("Wait DONE") 
      },a);
  });
}

