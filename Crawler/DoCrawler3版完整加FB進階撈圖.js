const puppeteer= require('puppeteer');
const fs = require('fs');
const CrawlerPost=require('../routes/CrawlerData');

const loopdata=[
  {name:'加藤軍2.0',type:0,url:'https://www.facebook.com/pg/KATOTAKA2.0/posts/'},
  {name:'爆料公社',type:0,url:'https://www.facebook.com/pg/%E7%88%86%E6%96%99%E5%85%AC%E7%A4%BE-162608724089621/posts'},  
  {name:'蘋果日報',type:0,url:'https://www.facebook.com/pg/appledaily.tw/posts/?ref=page_internal'},  
  /*XX*/{name:'妹子團',type:0,url:'https://www.facebook.com/pg/%E5%A6%B9%E5%AD%90%E5%B0%88%E5%8D%80-823320937840113/posts/'},
  {name:'BC&Lowy',type:0,url:'https://www.facebook.com/pg/bclowy/posts/?ref=page_internal'},
  {name:'梗圖集中營',type:1,url:'https://www.facebook.com/groups/256720108361190/?ref=group_browse'},  
  {name:'提姆正妹',type:0,url:'https://www.facebook.com/pg/timliaofb.beauty/posts/?ref=page_internal'},      
  {name:'Coser亞提',type:0,url:'https://www.facebook.com/pg/ArtyCos/posts/?ref=page_internal'},
];
const loopIG=[
  'https://www.instagram.com/eom_sangmi/',//韓國妹子1
  'https://www.instagram.com/katotaka2.0official/',//加藤軍
  'https://www.instagram.com/eimi__fukada/',//日本 深田詠美
  'https://www.instagram.com/creamcandy123/',//日本 肉妹
  'https://www.instagram.com/borusushi/',//日本短髮
  'https://www.instagram.com/munkawchaosgirl/',//泰國
  'https://www.instagram.com/p/B-LurKkDpEK/',//藍星雷
  '',//
  '',//
  '',//
]

function ManyCraynamicPuppeteer(){//--puppeteer套件 動態抓取/最好的  
  return new Promise(async function(resolve, reject) {
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

        if(control!=0){
          //console.log("GoToPG:"+control+"/"+loopdata.length);
          await page.goto(loopdata[control].url);
          await WaitASec(1000);
        }        
        await autoScroll(page);
        //console.log("CStart:"+control+"/"+loopdata.length);        
        if(loopdata[control].type==0)JData.data_txt=await GetDataFanGroup(page);//如果是粉專
        else if(loopdata[control].type==1)JData.data_txt=await GetDataGroup(page);//如果是社團

        BARR.push(JData);
        console.log("Finished:"+control+"/"+loopdata.length);        
        control++;
    }

    await CrawlerPost.CrawlerCreateSchema(BARR);
    await browser.close();
    console.log("END CRAWLER!!!");
    resolve("DONE");

  }).catch((e) => {//-解決Uncaught (in promise)
    console.log("E:"+e);
  });
}

function DoAPuppeteer(urls,kind){//--抓一個
  console.log("START CRAWLER!!!");
  return new Promise(async function(resolve, reject) {
    const browser = await puppeteer.launch({
      headless: false //--code run open browser
    });
    const page = await browser.newPage();        
    await page.goto(urls);
    await page.setViewport({width:1000, height: 800});//--設定開啟虛擬瀏覽器寬高    
    let JData={      
      url:urls,
      data_txt:[],
    }
    if(kind=='fbFanGroup'){
      await autoScroll(page);
      JData.data_txt=await GetDataFanGroup(page);//如果是粉專      
    }else if(kind=='fbGroup'){
      await autoScroll(page);
      JData.data_txt=await GetDataGroup(page);//如果是社團
    }else if(kind=='ig'){      
      JData.data_txt=await GetIG2(page);//如果是IG      
    }else if(kind=='fbImgs'){  
      JData.data_txt=await GetFbImages(page);//只抓PO文圖片
    }else if(kind=='fbphotos'){  
      JData.data_txt=await GetFbPhotos(page,25);//只抓photo
    }else if(kind=='twiter'){  

      await WaitASec(7000);//等attribute載入完畢       
      //selector選擇element: 在<main>中 && 是div(並符合[]中所有attribute)
      const BlockSS='main div[tabindex="0"][aria-haspopup="false"][role="button"][data-focusable="true"]';
      const element=await page.$(BlockSS);  
      if (element !== null){//找到該element == 如果頁面被btn block
        console.log('BK found');        
        await element.click();//觸發該element"點擊"  ==  關掉block
        await WaitASec(3000);//等載入完畢
        JData.data_txt=await DoTwitter(page);                         
      }else{//找到該element == 如果沒被block
        console.log('BK Not found');
        JData.data_txt=await DoTwitter(page);                  
      }            
    }
    await browser.close();
    console.log("END CRAWLER!!!");
    resolve(JData);
    
  });  
}

async function GetDataFanGroup(page){//抓公開粉專/個人用 
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
async function GetFbImages(page){//FB 所有PO文圖片
  return new Promise(async function(resolve, reject) {
    let Outer=[];
      let sw=0;
      while(sw<4){        
        if(sw==0){
          await WaitASec(3000);
        }
        let littles=await page.evaluate(//get data-utime OK
          () =>                      
            [...document.querySelectorAll('img[data-src]')]            
            .map(function(i) {
                //var ahref=i.getAttribute('href')                
                let imgurl=i.getAttribute('src');                                      
                return [imgurl];
            })
        );
        await autoScrollWithSec(page);        
        Outer=arrayUnique(Outer.concat(littles));              
        sw++;
      }
      resolve(Outer);   
  });
}
async function GetFbPhotos(page,MaxPics){//FB 相簿圖
  return new Promise(async function(resolve, reject) {    
    const elements = await page.$$( '._2eec div' );//抓所有符合 selector的element => 輸出成array    
    await BeginAutoScrollWithSec(page);
    await elements[0].click();//前 3X正常hover
    await WaitASec(3500);
    let JData=[];
    let AI=0;
    while(AI<MaxPics){
        await WaitASec(500);        
        const txts =await page.evaluate(() =>
          document.querySelector('img.spotlight').getAttribute('src')
        );              
        await page.keyboard.press('ArrowRight');
        //await page.$$('a.next li')[0].click();                 
        JData.push(txts);
        AI++;
    }
    //console.log(JData);
    resolve(JData);
  });
}
async function GetIG(page){//抓IG  Original X(IG改版 圖片太多只會show固定數量)
  return await page.evaluate(//get data-utime OK
     () =>
         [...document.querySelectorAll('.KL4Bh img')]                  
         .map(function(i) {                
                return i.getAttribute('src');                                
         })
      );
}
async function GetIG2(page){//抓IG  分段抓圖
  return new Promise(async function(resolve, reject) {
      let Outer=[];
      let sw=0;
      while(sw<4){
        await autoScrollWithSec(page);
        let littles=await page.evaluate(//get data-utime OK
          () =>          
            //[...document.querySelectorAll('.KL4Bh img')]
            [...document.querySelectorAll('.v1Nh3 a')]
            .map(function(i) {                
                var ahref=i.getAttribute('href')
                var imgurl=i.querySelector('.KL4Bh img').getAttribute('src');
                return [ahref,imgurl];
            })
        );
        Outer=arrayUnique(Outer.concat(littles));
        sw++;
      }
      resolve(Outer);            
  });
}
async function DoTwitter(page){//Twitter
  return new Promise(async function(resolve, reject) {
    let Outer=[];
      let sw=0;
      while(sw<4){        
        if(sw==0){
          await WaitASec(3000);
        }
        let littles=await page.evaluate(//get data-utime OK
          () =>                      
            [...document.querySelectorAll('[alt="圖片"]')]            
            .map(function(i) {
                //var ahref=i.getAttribute('href')                
                let imgurl=i.getAttribute('src');                
                if(imgurl.includes('&name=')){
                  imgurl=imgurl.split('&name=')[0]+'&name=small';
                }
                return [imgurl];
            })
        );
        await autoScrollWithSec(page);
        //console.log(littles);
        Outer=arrayUnique(Outer.concat(littles));              
        sw++;
      }
      resolve(Outer);   
  });
  //.querySelectorAll('[data-foo="value"]');
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

async function BeginAutoScrollWithSec(page){//---FB photos初始滑動
  await page.evaluate(async () => {            
      await new Promise((resolve, reject) => {          
          var distance = 400;
          var Maxsceonds = 200;//--秒數
          var CountSec= 0;//--秒數
          var timer = setInterval(() => {
              window.scrollBy(0, distance);              
              CountSec=CountSec+ 100;//--秒數                            
              if(CountSec >= Maxsceonds){
                  clearInterval(timer);                  
                  resolve();                                 
              }
          }, 100);
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


module.exports.ManyCraynamicPuppeteer=ManyCraynamicPuppeteer;
module.exports.DoAPuppeteer=DoAPuppeteer;
