//const puppeteer= require('puppeteer');
const puppeteer = require('puppeteer-extra')
const CrawlerPost=require('../routes/CrawlerData');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())


function GetShares(KINDS,UrlArray){//--puppeteer套件 動態抓取/最好的  
  return new Promise(async function(resolve, reject) {    
    const browser = await puppeteer.launch({
      //executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      headless: false
    });
    try {      
      const page = await browser.newPage();
      await page.goto(UrlArray[0].url,{waitUntil: 'load'});
      await page.setViewport({width:1000, height: 800});//--設定開啟虛擬瀏覽器寬高
      let BARR=[];
      let control=0;
      while(control<UrlArray.length){
          let JData={
            title:UrlArray[control].name,
            url:UrlArray[control].url,
            tags:UrlArray[control].tags,
            data_txt:[],
          }
          if(control!=0){await page.goto(UrlArray[control].url,{waitUntil: 'load'});}
          if(KINDS=='facebook'){//循環FB 葉面
            JData.data_txt=await GetFbShare(page,control,browser);          
          }
          else if(KINDS=='ig'){//循環IG 葉面          
            JData.data_txt=await GetIgSingleShare(page,control);
          }
          else if(KINDS=='twitter'){//循環twitter
            JData.data_txt=await GetTwitterShare(page,control,browser);          
          }
          else if(KINDS=='tiktok'){//循環tik tok
            JData.data_txt=await GetTikTokShare(page);
            //JData.data_txt=await GetTikTokSinglePageShare(page);
            //JData.data_txt=JSON.stringify(DDSD);
          };
          BARR.push(JData);
          console.log("Finished:"+control+"/"+UrlArray.length);
          control++;
      }
      await browser.close();
      await CrawlerPost.CrawlerCreateSchema(BARR,null,`${KINDS}test`);            
      console.log("END CRAWLER!!!");
      resolve(`${KINDS}:DONE`);        
      /*
      if(KINDS!=='facebook'){
        await CrawlerPost.CrawlerCreateSchema(BARR,null,`${KINDS}test`);        
        resolve(`${KINDS}:DONE`);
      }else{
        resolve(BARR);
      } 
      */  
    } catch (error) {
      console.log("????????");
      await browser.close();
      reject(`Crawler ${KINDS} Share ERR: ${error}`);
    }      
  });
}
async function GetIgSingleShare(page,PageNB){//抓IG  分段抓圖
  return new Promise(async function(resolve, reject) {
    let ChaptNumber=0;    
    let ARR=[];
    if(PageNB==0){
      await WaitASec(3500);//等載入
      const eleLOG=await page.$('a.tdiEy');
      await eleLOG.click();
      await WaitASec(2000);
      await page.keyboard.press('Tab');
      await page.keyboard.type('0975534363');
      await page.keyboard.press('Tab');
      await page.keyboard.type('ka3708852');
      await page.keyboard.press('Enter');
    }
    while(ChaptNumber<5){
      await page
      .waitForSelector('.v1Nh3 a .KL4Bh',{timeout:6000}).catch((e) => {
          console.log("0 ERR:"+e);
      });
      await page.click('.v1Nh3 a .KL4Bh');//點第一篇
      await page.waitForSelector('div.MEAGs',{timeout:8000}).catch((e) => {
          console.log("1 ERR:"+e);
      });
      let GetTime=await page.evaluate(() =>{
        return document.querySelector('.eo2As .k_Q0X time').getAttribute('datetime');
      });
      if(JudgeDate(GetTime)||ARR.length<3){//2天內超過5偏曲5篇 || 每人至少要3篇(如果PO文多數超過2天)
        await page.click('div.MEAGs');//分享btn1
        await page.waitForSelector('div.mt3GC',{timeout:6000}).catch((e) => {
            console.log("2 ERR:"+e);
        });
        await page.click('div.mt3GC button:nth-of-type(5)');//分享btn2
        await page.waitForSelector('textarea._4UXK0',{timeout:6000}).catch((e) => {
            console.log("3 ERR:"+e);//取得<tag>區
        });
        await page.click('label.WYMWX');//取消多於資訊
        await WaitASec(1000);
        let JData=await page.evaluate(() =>{
          return document.querySelector('textarea._4UXK0').textContent;
        });
        //console.log(JData.length);
        ARR.push(JData);
        ChaptNumber++;        
        //await page.click('div.RnEpo');//關UI
        await page.mouse.click(10,10);
        await page.keyboard.press('ArrowRight');
      }else{//該篇時間over 2天 && 前面Crawler數目(至少3最多5)已達標 -> 略過跳出
        ChaptNumber=99;        
      }
    }
    resolve(ARR);
  });
}
async function GetFbShare(page,PageNB,browser){//抓IG  分段抓圖
  return new Promise(async function(resolve, reject) {
    let ChaptNumber=0;
    let MaxChap=3;
    let ARR=[];    
    if(PageNB==0){//登入
      await WaitASec(2500);//等載入
      await page.waitForSelector('input[data-testid="royal_email"]',{timeout:10000});      
      await page.keyboard.type('k88654321100@gmail.com');
      await page.keyboard.press('Tab');
      await page.keyboard.type('k65432110');
      await page.keyboard.press('Enter');
    }
    while(ChaptNumber<MaxChap){
      let NoEmded=false;      
      await page.waitForSelector('div._1xnd ._4-u8 a[data-testid="post_chevron_button"]'
      ,{timeout:10000}).catch((e) => {
        console.log("0 ERR:"+e);        
      });      
      const UIeles = await page.$$('div._1xnd ._4-u8 a[data-testid="post_chevron_button"]');
      await UIeles[ChaptNumber].click({ clickCount: 1 });//clickCount: 2
      //console.log('Length:',(await page.$$('div._1xnd ._4-u8 a[data-testid="post_chevron_button"]')).length);
      await WaitASec(1500);          
      await page.waitForSelector(`#globalContainer>div.uiContextualLayerPositioner:last-child ul[role="menu"]>li[data-feed-option-name="FeedEmbedOption"]`,
      {timeout:5000}).catch((e) => {//找不到 "內嵌" btn
        NoEmded=true;                     
      });      
      if(NoEmded==false){//該篇分享btn可直接點 (沒被覆蓋)
        let SomeThingCrash=false;        
        if((await browser.pages()).length>2){//如果跳新page -> 關新page
          //console.log("開新頁太早0");
          (await browser.pages())[2].close();
          await WaitASec(800);
        }
        if(await page.$(`#globalContainer>div.uiContextualLayerPositioner:last-child ul[role="menu"]>li[data-feed-option-name="FeedEmbedOption"]`) !== null){
          await page.click(`#globalContainer>div.uiContextualLayerPositioner:last-child ul[role="menu"]>li[data-feed-option-name="FeedEmbedOption"]`);                              
          //console.log("內嵌CC");
        }else{
          MaxChap++;
          ChaptNumber++;
          console.log("內嵌btn 錯誤顯示!!");
          continue;
        }               
        let HasThreePG=false;
        await WaitASec(1000);
        while(HasThreePG==false){//如果視窗沒開成功 -> 循環
          await page.waitForSelector(`input.inputtext`,{timeout:15000}).catch((e) => {SomeThingCrash=true;});
          if((await browser.pages()).length<=2){//還沒開 新頁         
            await page.click(`._pig ._3-8n>div>a:last-child`);
            await WaitASec(1500);
            if((await browser.pages()).length>2)HasThreePG=true;
          }else if((await browser.pages()).length>2){//自動多開新頁
            (await browser.pages())[2].close();
          }else if(SomeThingCrash){//link 跳轉視窗 載入失敗
            await page.keyboard.press('Escape');            
          }
        }        
        let pages = await browser.pages();
        const popup = pages[pages.length - 1];
        await WaitASec(2000);
        //await popup.waitForSelector(`div[data-show-text="true"]`,{timeout:15000}).catch((e) => {console.log("3 ERR:"+e);});
        await popup.waitForSelector(`input.wideinputtext`,{timeout:15000}).catch((e) => {SomeThingCrash=true;});
        await popup.waitForSelector(`a.selected`,{timeout:15000}).catch((e) => {SomeThingCrash=true;});
        (await popup.$$(`a.selected`))[0].click({clickCount:2})//Click "取得程式碼"
        await WaitASec(1000);
        await popup.waitForSelector(`ul[role="tablist"] li`,{timeout:10000}).catch((e) => {SomeThingCrash=true;});
        if (await popup.$(`ul[role="tablist"] li`) == null)SomeThingCrash=true;
        if(SomeThingCrash!=true){//開新頁面有錯誤 -> 不抓這篇
          await popup.click(`ul[role="tablist"] li:last-child`);//Click "iframe"
          await WaitASec(1000);
          await popup.waitForSelector(`#snip-iframe pre`,{timeout:10000}).catch((e) => {console.log("popup ERR:"+e);});        
          let TXT=await popup.evaluate(() =>{
            return document.querySelector('#snip-iframe pre').textContent;
          });                
          ARR.push(TXT);
        }else{
          MaxChap+1;
        }        
        await popup.close();
        await WaitASec(1000);        
      }else{
        MaxChap++;
        ChaptNumber++;
        continue;
      }
      await page.keyboard.press('Escape');
      await WaitASec(500);
      ChaptNumber++;              
    }
    resolve(ARR);
  });
}
async function GetTikTokShare(page){//抓IG  分段抓圖
  return new Promise(async function(resolve, reject) {
    let ChaptNumber=0;    
    let ARR=[];    
    while(ChaptNumber<15){      
      if(ChaptNumber==0){
        await page
        .waitForSelector('div._explore_feed_card_item',{timeout:15000}).catch((e) => {
          reject("0 ERR:"+e);
        });
        await page.click('div._explore_feed_card_item');//點第一篇
      }
      await WaitASec(1500); 
      await page.waitForSelector('.video-infos-container div.share-group a img',{timeout:8000}).catch((e) => {
        reject("1 ERR:"+e);
      });            
      await page.click('.video-infos-container div.share-group > a:nth-of-type(4) img');//分享btn1
      await page.waitForSelector('div.embed-card',{timeout:6000}).catch((e) => {
        reject("2 ERR:"+e);
      });
      //await page.click('div.mt3GC button:nth-of-type(5)');//分享btn2
      await page.waitForSelector('textarea.embed-code',{timeout:6000}).catch((e) => {
        reject("3 ERR:"+e);//取得<tag>區
      });
      let JData=await page.evaluate(() =>{
        return document.querySelector('textarea.embed-code').textContent;
      });      
      console.log(JData.length);
      ARR.push(JData);
      ChaptNumber++;        
      await page.click('div.embed-card > p:last-child');//關閉內嵌btn      
      //await page.mouse.click(10,10);
      await page.keyboard.press('ArrowRight');    
    }
    resolve(ARR);

  });
}
async function GetTikTokSinglePageShare(page){//抓IG  分段抓圖
  return new Promise(async function(resolve, reject) {
    let ChaptNumber=0;    
    let ARR=[];    
    while(ChaptNumber<7){      
      if(ChaptNumber==0){
        await page
        .waitForSelector('div.video-feed-item',{timeout:15000}).catch((e) => {
          reject("0 ERR:"+e);
        });
        await page.click('div.video-feed-item');//點第一篇
      }
      await WaitASec(1500); 
      await page.waitForSelector('.video-infos-container div.share-group a img',{timeout:8000}).catch((e) => {
          reject("1 ERR:"+e);
      });            
      await page.click('.video-infos-container div.share-group > a:nth-of-type(4) img');//分享btn1
      await page.waitForSelector('div.embed-card',{timeout:6000}).catch((e) => {
          reject("2 ERR:"+e);
      });
      //await page.click('div.mt3GC button:nth-of-type(5)');//分享btn2
      await page.waitForSelector('textarea.embed-code',{timeout:6000}).catch((e) => {
          reject("3 ERR:"+e);//取得<tag>區
      });
      let JData=await page.evaluate(() =>{
        return document.querySelector('textarea.embed-code').textContent;
      });      
      console.log(JData.length);
      ARR.push(JData);
      ChaptNumber++;        
      await page.click('div.embed-card > p:last-child');//關閉內嵌btn      
      //await page.mouse.click(10,10);
      await page.keyboard.press('ArrowRight');    
    }
    resolve(ARR);

  });
}
async function GetTwitterShare(page,NB,browser){//Twitter "登入" 爬多個頁面
  return new Promise(async function(resolve, reject) {    
    let ARRR=[];
    let sw=0;
    if(NB==0){//判斷頁數
      await WaitASec(3500);//等載入
      const eleLOG=await page.$('a[href="/login"]');
      await eleLOG.click();
      await WaitASec(2000);
      await page.keyboard.type('Chairslatech@gmail.com');
      await page.keyboard.press('Tab');
      await page.keyboard.type('chairslatw0409');
      await page.keyboard.press('Enter');
    }    
    while(sw<3){                              
      let SUS=false;      
      while(SUS==false){
        await page.waitForSelector(`section>div>div>div>div div[data-testid="caret"]>div`,{timeout:5000})
        .catch((e) => {console.log("初始等待單篇btn ele ERR:"+e);});
        const UIeles = await page.$$(`section>div>div>div>div div[data-testid="caret"]`);
        await UIeles[sw].click({ clickCount: 1 });
        await WaitASec(1000);        
        await page.waitForSelector(`div[role="menuitem"]`,{timeout:5000})        
        .catch((e) => {console.log("展開menu UI等待 ERR:"+e);});
        await page.click(`div[role="menuitem"]:first-child`);        
        await WaitASec(1000);
        if((await browser.pages()).length>2)SUS=true;
      }     
     //console.log((await browser.pages()).length);
      let pages = await browser.pages();
      const popup = pages[pages.length - 1];
      await popup.waitForSelector(`code`,{timeout:15000})
      .catch((e) => {console.log("popup ERR:"+e);});
      let TXT=await popup.evaluate(() =>{
          return document.querySelector('code').textContent;
      });
      ARRR.push(TXT);      
      await popup.close();     
      await WaitASec(1000);            
      sw++;
    }        
    resolve(ARRR);
  });
}
function WaitASec(a){
  return new Promise(function(resolve, reject) {
      setTimeout(function(){
          resolve("Wait DONE")
      },a);
  });
}
function JudgeDate(StrDay){
  const NOW=new Date().getTime();
  const DS=new Date(StrDay).getTime();
  if((NOW-DS)/3600000<=48)return true;//PO文在2天內
  else{return false}
}
async function BeginAutoScrollWithSec(page){//---FB photos初始滑動  
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var distance = -75;
          var timer = setInterval(() => {
          window.scrollBy(0, distance);
          clearInterval(timer);
          resolve();
          }, 100);
      });
  });
}

module.exports.GetShares=GetShares;
