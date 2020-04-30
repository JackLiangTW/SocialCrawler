const puppeteer= require('puppeteer');

const loopIG=[
  'https://www.instagram.com/eom_sangmi/',//韓國妹子1
  'https://www.instagram.com/katotaka2.0official/',//加藤軍
  'https://www.instagram.com/eimi__fukada/',//日本 深田詠美
  'https://www.instagram.com/creamcandy123/',//日本 肉妹
  'https://www.instagram.com/borusushi/',//日本短髮
  'https://www.instagram.com/munkawchaosgirl/',//泰國
]
DoAPuppeteer();

function DoAPuppeteer(){//--抓一個
  console.log("START CRAWLER!!!");
  return new Promise(async function(resolve, reject) {
    const browser = await puppeteer.launch({
      headless: false //--code run open browser
    });
    const page = await browser.newPage();    
    await page.goto(loopIG[4]);    
    await page.setViewport({width:1000, height: 800});//--設定開啟虛擬瀏覽器寬高                

    let AI=0;
    let ARR0=[]; 
    let ARR1=[]; 
    while(AI<3){         
        const TheBlocks = await page.$$( '.RnEpo' );        
        if(TheBlocks.length!=0){//當 登入block出現 (不拿掉不能trigger hover!?)
            console.log(AI+"BBBKKK");
            await page.evaluate((sel) => {//移除 block Element
                var elements = document.querySelectorAll(sel);
                for(var i=0; i< elements.length; i++){
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }, '.RnEpo')            
        }
        let URLS=await GetIG0(page);//抓圖 / href
        let LKS=await GetIGLikes(page);//抓 鑽 / 留言
        ARR0.push(URLS);
        ARR1.push(LKS);        
        console.log(AI+":------");
        console.log("Likes:"+LKS.length);
        console.log("URL:"+URLS.length);
        await autoScrollWithSec(page);        
        await WaitASec(1500);
        AI++;        
    }       
    //await browser.close();
    console.log("END CRAWLER!!!");
    resolve("GOOD");
    
  }).catch((error) => {
    resolve(error);
        throw new Error(error);
    });
}

async function GetIGLikes(page){//抓IG  Original X(IG改版 圖片太多只會show固定數量)
    return new Promise(async function(resolve, reject) {          
        let JData=[];
        let AI=0;

        const elements = await page.$$( '.v1Nh3 a' );//抓所有符合 selector的element => 輸出成array        
        while(AI<elements.length){
            /*
            hover/click事件當element不在window視窗範圍內,無法執行hover()/click()
            會報錯:
            Node is either not visible or not an HTMLElement for hover
            */
           console.log(AI+'//'+elements.length);
            await elements[AI].hover();//前 3X正常hover
            const txts =await page.evaluate(() =>
             document.querySelector('.qn-0x .Ln-UN').textContent//抓element中所有文字 包含子項目
            );                        
            JData.push(txts);
            AI++;
        }        
        resolve(JData);
    }).catch((error) => {
        resolve(error);
        throw new Error(error);
    });
}

async function GetIG0(page){//抓IG  分段抓圖
    return new Promise(async function(resolve, reject) {         
        let littles=await page.evaluate(//get data-utime OK
        () =>          
            [...document.querySelectorAll('.v1Nh3 a')]
            .map(function(i) {                
                var ahref=i.getAttribute('href')
                var imgurl=i.querySelector('.KL4Bh img').getAttribute('src');
                return [ahref,imgurl];
            })
        );          
        //console.log(littles);
        resolve(littles);            
    }).catch((error) => {
        resolve(error);
        throw new Error(error);
    });
  }

async function autoScroll(page){//---劉覽器  自動往下滑
  await page.evaluate(async () => {      
      await new Promise((resolve, reject) => {                        
          var distance = 450;
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
      }).catch((error) => {
        resolve(error);
        throw new Error(error);
      });
  });
}

async function autoScrollWithSec(page){//---自動往下滑For IG
  await page.evaluate(async () => {            
      await new Promise((resolve, reject) => {          
          var distance = 400;
          var Maxsceonds = 1500;//--秒數
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

function WaitASec(a){  
  return new Promise(function(resolve, reject) {
      setTimeout(function(){          
          resolve("Wait DONE") 
      },a);
  });
}
function arrayUnique(array) {//remove dupicate value in same array
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i].toString() === a[j].toString())
              a.splice(j--, 1);
      }
  }
  return a;
}
process.on('unhandledRejection', (reason, p) => {//console抓詳細錯誤說明
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
  });

module.exports.DoAPuppeteer=DoAPuppeteer;
