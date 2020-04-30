const puppeteer= require('puppeteer');
const CrawlerPost=require('../routes/CrawlerData');
const CrawlerShares=require('./DoCrawlerShare');
const CrawlerMenuSchema=require('../routes/CrawlerMenuSchema');
//twitter
//Chairslatech@gmail.com
//chairslatw0409

//椅斯拉個人 FB
//k88654321100@gmail.com
//k65432110
async function CrawlerAll(){  
  //ManyCraynamicPuppeteer('facebook');
  //ManyCraynamicPuppeteer('ig',loopIG);
  //ManyCraynamicPuppeteer('twitter');      
  
  // CrawlerMenuSchema.InsertMenu({
  //   kind:'facebook',
  //   data:loopdata99
  // });
  // CrawlerMenuSchema.InsertMenu({
  //   date:"2020,4,29",
  //   kind:'tiktok',
  //   data:tiktok
  // });
  // CrawlerMenuSchema.InsertMenu({
  //   kind:'IG',
  //   data:loopIG
  // });
  // CrawlerMenuSchema.InsertMenu({
  //   kind:'twitter',
  //   data:twitterloop
  // });  
  //let BOOlS=[false,false,false,false];
  let BOOlS=[true,false,true,true];
  let CCN=0;
  while(CCN<BOOlS.length){
    if(CCN==0&&BOOlS[CCN]==false){
      BOOlS[CCN]=true;
      let DataMenu=await CrawlerMenuSchema.GetSingleMenu('tiktok');      
      if(DataMenu==false){
        BOOlS[CCN]=false;
        CCN++;
        continue;
      }
      await CrawlerShares.GetShares('tiktok',DataMenu.data).catch((e)=>{
        BOOlS[CCN]=false;        
        console.log(e);
      });            
    }else if(CCN==1&&BOOlS[CCN]==false){ 
      BOOlS[CCN]=true;       
      let DataMenu=await CrawlerMenuSchema.GetSingleMenu('IG');      
      if(DataMenu==false){
        BOOlS[CCN]=false;
        CCN++;
        continue;
      }
      await ManyCraynamicPuppeteer('ig',DataMenu.data).catch((e)=>{
        BOOlS[CCN]=false;
        console.log(e);
      });
    }else if(CCN==2&&BOOlS[CCN]==false){ 
      BOOlS[CCN]=true;           
      let DataMenu=await CrawlerMenuSchema.GetSingleMenu('twitter');      
      if(DataMenu==false){
        BOOlS[CCN]=false;
        CCN++;
        continue;
      }
      await ManyCraynamicPuppeteer('twitter',DataMenu.data).catch((e)=>{
        BOOlS[CCN]=false;
        console.log(e);
      });             
    }else if(CCN==3&&BOOlS[CCN]==false){
      BOOlS[CCN]=true;
      let DataMenu=await CrawlerMenuSchema.GetSingleMenu('facebook');      
      if(DataMenu==false){
        BOOlS[CCN]=false;        
        continue;
      }
      await ManyCraynamicPuppeteer('facebook',DataMenu.data).catch(async function(e){
        BOOlS[CCN]=false;
        console.log(e);        
      });
      if(BOOlS.includes(false))CCN=0;//Run Crawler Again for error item
    }
    CCN++;
  }
   /**/
}
function ManyCraynamicPuppeteer(KINDS,ItemData){//--puppeteer套件 動態抓取/最好的
  return new Promise(async function(resolve, reject) {
    const browser = await puppeteer.launch({
      headless: false //--code run open browser
    });
    try {
      let LPDATA=ItemData;       
      const page = await browser.newPage();
      await page.goto(LPDATA[0].url,{waitUntil: 'load'});
      await page.setViewport({width:1000, height: 800});//--設定開啟虛擬瀏覽器寬高
      let BARR=[];
      let control=0;
      while(control<LPDATA.length){
          let JData={
            title:LPDATA[control].name,
            url:LPDATA[control].url,
            tags:LPDATA[control].tags,
            data_txt:[],
          }
          if(control!=0){await page.goto(LPDATA[control].url,{waitUntil: 'load'});}
          if(KINDS=='facebook'){//循環FB 葉面
            //await WaitASec(1000);
            await page
            .waitForSelector('._14i5 ._4-u8');
            if(control!=0)await autoScroll(page,500);          
            if(LPDATA[control].type==0)JData.data_txt=await GetLogInDataFanGroup(page,control);//如果是粉專          
            else if(LPDATA[control].type==1)JData.data_txt=await GetDataGroup(page,control);//如果是社團          
          }
          else if(KINDS=='ig'){//循環IG 葉面            
            //JData.data_txt=await GetIG2(page);
            JData.data_txt=await GetIgPost(page,10,control);            
          }
          else if(KINDS=='twitter'){//循環twitter
            //JData.data_txt=await DoMutiLogInTwitterImg(page,control);
            JData.data_txt=await DoTwitterMutiAll(page,control);            
          }        
          BARR.push(JData);
          console.log("Finished:"+control+"/"+LPDATA.length);
          control++;
      }
      await CrawlerPost.CrawlerCreateSchema(BARR,null,KINDS);
      await browser.close();
      console.log("END CRAWLER!!!");
      resolve(`${KINDS}:DONE`);
    } catch (error) {
      await browser.close();
      reject(`Normal Crawker Crash ${KINDS} ERR:${error}`);
    }    
  });
}
function DoAPuppeteer(urls,kind){//--抓一個
  return new Promise(async function(resolve, reject) {
    const browser = await puppeteer.launch({
      headless: false //--code run open browser
    });
    try {
      let JData={
        url:urls,
        data_txt:[],
        err:null,
      }
      let JG_URL=JudgeURL(urls,kind);//先判斷網址基本條件
      if(JG_URL[0]!=false){//如果輸入 網址通過基本篩選 -> 開始 Crawler
        console.log("START CRAWLER!!!");
        JData.err=JG_URL[0];        
        const page = await browser.newPage();
        await page.goto(JG_URL[1],{waitUntil: 'load'});
        await page.setViewport({width:1000, height: 800});//--設定開啟虛擬瀏覽器寬高
        /*else if(kind=='fbImgs'&&JG_URL[0]=='fbImgs'){
          JData.data_txt=await GetFbImages(page);//只抓貼文的圖片
        }*/
        if(kind=='post'&&JG_URL[0]=='fbFanGroup'){
          await autoScroll(page,1000);
          JData.data_txt=await GetDataFanGroup(page);//如果是粉專
        }
        else if(kind=='post'&&JG_URL[0]=='fbGroup'){
          await autoScroll(page,1000);
          JData.data_txt=await GetDataGroup(page,1);//如果是社團
        }
        else if(kind=='photos'&&JG_URL[0]=='fbphotos'){//Fb FanGroup抓photo
          JData.data_txt=await GetFbPGPhotos(page,30);
        }
        else if(kind=='photos'&&JG_URL[0]=='gpphotos'){//Fb Group抓photo
          JData.data_txt=await GetFbGPPhotos(page,30);
        }
        else if(JG_URL[0]=='ig'){//如果是IG
          //JData.data_txt=await GetIG2(page);
          JData.data_txt=await GetIgPost(page,8,0);
          //JData.data_txt=await GetIgSingleShare(page);
        }
        else if(JG_URL[0]=='twiter'){
          JData.data_txt=await DoMutiLogInTwitterImg(page,0);//登入 爬蟲        
        }
        await browser.close();
        console.log("END CRAWLER!!!");
        resolve(JData);
      }else{//如果網址沒通過基本篩選
        JData.err=JG_URL[1];
        resolve(JData);
      } 
    } catch (error) {
      await browser.close();
      reject(`Personal Crawler ERR:${error}`)
    }    
  });
}
async function GetLogInDataFanGroup(page,PageNB){//登入 抓公開粉專 
  if(PageNB==0){//登入    
    await WaitASec(1000);//等載入
    await page.waitForSelector('input[data-testid="royal_email"]',{timeout:10000});      
    await page.keyboard.type('k88654321100@gmail.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('k65432110');
    await page.keyboard.press('Enter');
    await WaitASec(2500);//等載入
    await autoScroll(page,500);          
 } 
 return await page.evaluate(
    () =>[...document.querySelectorAll('._14i5 ._1xnd > ._4-u8')]
        .map(function(i) {
                var heads=i.querySelector('._5eit abbr');//抓element(icon/ID/time區)
                var id=i.querySelector('._5eit h5 a');//抓element(icon/ID/time區)                
                var hreflink=i.querySelector("._5eit ._5pcq:not([role='img'])")//抓該篇PO文 href
                var likeA=i.querySelector('._78bu span._81hb');//抓like數
                var msgA=i.querySelector('._78bu a._3hg-');//抓留言數                       
                var content=i.querySelector('div.userContent p');//PO文字內容 element
                var content_img=i.querySelector('img.scaledImageFitWidth');//PO文圖片 element 1
                if(content_img==null)content_img=i.querySelector('img.scaledImageFitHeight');//PO文圖片 element 2
                var OBJ = {};
                //OBJ['child'] = heads.childNodes[0].getAttribute('class');//抓><span>
                if(hreflink!==null){
                  OBJ['href'] = hreflink.getAttribute('href');
                }
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
                }else{
                  return false;
                }
                return OBJ;
        })
    );
}
async function GetDataFanGroup(page){//抓公開粉專/ 不登入 
 return await page.evaluate(
    () =>[...document.querySelectorAll('._14i5 ._1xnd > ._4-u8')]
        .map(function(i) {
                var heads=i.querySelector('._5eit abbr');//抓element(icon/ID/time區)
                var id=i.querySelector('._5eit h5 a');//抓element(icon/ID/time區)                
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
                }else{
                  return false;
                }
                return OBJ;
        })
    );
}
async function GetDataGroup(page,PageNB){//抓公開社團用
  if(PageNB==0){//登入
    await WaitASec(1000);//等載入    
    await page.waitForSelector('input[data-testid="royal_email"]',{timeout:10000});      
    await page.keyboard.type('k88654321100@gmail.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('k65432110');
    await page.keyboard.press('Enter');
    await WaitASec(2500);//等載入
    await autoScroll(page,500);
  }
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
                  }else{
                    return false;
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
        await page
        .waitForSelector('img[data-src]');
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
async function GetFbGPPhotos(page,MaxPics){//FB Group 相簿圖
  return new Promise(async function(resolve, reject) {
    const elements = await page.$$( 'div.pas table tr td' );//抓所有符合 selector的element => 輸出成array
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
async function GetFbPGPhotos(page,MaxPics){//FB FanGroup 相簿圖
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
async function GetIG2(page){//抓IG  分段抓圖
  return new Promise(async function(resolve, reject) {
      let Outer=[];
      let sw=0;
      while(sw<4){
        await page
        .waitForSelector('.KL4Bh img');
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
async function GetIgPost(page,MaxPics,PageNB){//IG各篇爬圖/多圖可
  return new Promise(async function(resolve, reject) {
    /*IG登入 -> 沒辦法解除API超過次數問題*/
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
    
    await page
    .waitForSelector('.v1Nh3 a .KL4Bh img')
    //.then(() => console.log('First C dd'));
    const elements = await page.$$( '.v1Nh3 a .KL4Bh' );//抓所有符合 selector的element => 輸出成array
    await elements[0].click();
    await WaitASec(3500);
    let JData=[];
    let AI=0;
    while(AI<MaxPics){
      let Passed=false;
      await page
      .waitForSelector('._97aPb img',{timeout:5000})
      .then(() => {
        Passed=true;
        //console.log('Single Img dd');
      }).catch((e) => {
        Passed=false;
        console.log("IG ERR:"+e);
      });
      //await WaitASec(500);
      if(Passed){//有爬到
        //await WaitASec(1000);
        const txts =await page.evaluate(() =>{
          let Datas={
            target:'',
            time:0,
            likes:0,
            url:[]
          };
          Datas.target=document.querySelector('.eo2As .k_Q0X a').getAttribute('href');
          Datas.time=document.querySelector('.eo2As .k_Q0X time').getAttribute('title');
          Datas.likes=document.querySelector('.eo2As section.EDfFK span').textContent;
          Datas.url=[...document.querySelectorAll('._97aPb img')].map(function(i){
            return i.getAttribute('src');
          });
          return Datas;
        });
        JData.push(txts);
      }else{
        JData.push(false);
      }
      const NextArr=await page.$('a.coreSpriteRightPaginationArrow');
      if(NextArr!== null){//有下一張了
        await page.keyboard.press('ArrowRight');
        AI++;
      }else{//沒有下一張了
        AI=MaxPics;
      }
    }
    resolve(JData);
  });
}
async function GetIgSingleShare(page){//抓IG  分段抓圖
  return new Promise(async function(resolve, reject) {
      await page
      .waitForSelector('.v1Nh3 a .KL4Bh',{timeout:6000}).catch((e) => {
          console.log("0 ERR:"+e);
      });
      await page.click('.v1Nh3 a .KL4Bh');//點第一篇
      await page.waitForSelector('div.MEAGs',{timeout:10000}).catch((e) => {
          console.log("1 ERR:"+e);
      });
      const GetTime=await page.evaluate(() =>{
        return document.querySelector('.eo2As .k_Q0X time').getAttribute('datetime');
      });
      if(JudgeDate(GetTime)){//2天內
        await page.click('div.MEAGs');//分享btn1
        await page.waitForSelector('div.mt3GC',{timeout:3000}).catch((e) => {
            console.log("2 ERR:"+e);
        });
        await page.click('div.mt3GC button:nth-of-type(5)');//分享btn2
        await page.waitForSelector('textarea._4UXK0',{timeout:5000}).catch((e) => {
            console.log("3 ERR:"+e);//取得<tag>區
        });
        await page.click('label.WYMWX');//取消多於資訊
        await WaitASec(500);
        const JData=await page.evaluate(() =>{
          return document.querySelector('textarea._4UXK0').textContent;
        });
        console.log(JData.length);
        resolve(JData);
      }else{//超過2天
        resolve(false);
      }      
  });
}
async function DoTwitter(page){//抓Twitter(未登入)
  return new Promise(async function(resolve, reject) {
    let Outer=[];
      let sw=0;
      while(sw<4){
        if(sw==0){
          await WaitASec(4000);
          const BlockSS='main div[tabindex="0"][aria-haspopup="false"][role="button"][data-focusable="true"]';
          const element=await page.$(BlockSS);
          if (element !== null){
            await element.click();
            await WaitASec(3000);
          }
        }
        await page
        .waitForSelector('img[alt="圖片"]');
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
        Outer=arrayUnique(Outer.concat(littles));
        sw++;
      }
      resolve(Outer);
  });
}
async function DoTwitterMutiAll(page,NB){//Twitter "登入" 爬多個頁面
  return new Promise(async function(resolve, reject) {
    let Outer=[];
    let ImgArrs=[];
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
    while(sw<3){//7
      //let Passed=true;
      await page//等到 該element載入 (取代原本setTimeout)
        .waitForSelector('img[alt="Image"]',{timeout:5000})
        .catch((e) => {
          console.log("IG ERR:"+e);
        });      
      let littles=await page.evaluate(//get data-utime OK
        () =>
          [...document.querySelectorAll(`section[aria-labelledby='accessible-list-0']>div>div>div`)]//for 登入後
          .map(function(i) {
              var OBJ = {
                date:'',
                href:'',
                src:null,
                msg:'',
                likes:''
              };
              const imgEle=i.querySelector(`[alt="Image"]`);
              const timeEle=i.querySelector(`time`);

              //PO文 文字content
              const contentEle=i.querySelector("div[data-testid='tweet']>div:last-child>div:last-child>div:first-child");
              //PO文 案讚/轉貼數/留言數
              const msgDataEle=i.querySelector("div[data-testid='tweet']>div:last-child>div:last-child>div:last-child");
              if(imgEle!==null&&timeEle!==null){
                let imgurl=imgEle.getAttribute('src');                
                if(imgurl.includes('&name=')){
                  //imgurl=imgurl.split('&name=')[0]+'&name=small';                  
                  OBJ['src']=imgurl.split('&name=')[0]+'&name=large';//大圖
                }else{
                  OBJ['src']=imgurl;
                }
                OBJ['date']=timeEle.getAttribute('datetime');
                OBJ['href']="https://twitter.com"+timeEle.closest('a').getAttribute('href');
                if(contentEle!==null)OBJ['content']=contentEle.textContent;
                if(msgDataEle!==null){
                  if(msgDataEle.querySelector('div:nth-child(1)')!==null)
                  OBJ['msg']=msgDataEle.querySelector('div:nth-child(1)').textContent;
                  if(msgDataEle.querySelector('div:nth-child(3)')!==null)
                  OBJ['likes']=msgDataEle.querySelector('div:nth-child(3)').textContent;                  
                }                
                return OBJ;
              }else{
                return false;
              }
          })
      );
      await autoScrollWithSec(page);      
      //if(littles!==null)Outer=arrayUnique(Outer.concat(littles));      
      //console.log(littles);
      if(littles!=false){
        for (let i = 0; i < littles.length; i++){
          if(littles[i]['src']!=null){
            //console.log(littles[i]['src']);
            const imglink = littles[i]['src'];
            if(ImgArrs.includes(imglink)==false){
              Outer.push(littles[i]);
              ImgArrs.push(imglink);
            }                        
          }          
        }
      }            
      sw++;
    }
    //console.log(Quter);
    resolve(Outer);
  });
}
async function DoMutiLogInTwitterImg(page,NB){//Twitter "登入" 爬多個頁面
  return new Promise(async function(resolve, reject) {
    let Outer=[];
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
    while(sw<7){
      //let Passed=true;
      await page//等到 該element載入 (取代原本setTimeout)
        .waitForSelector('img[alt="Image"]',{timeout:5000})
        .catch((e) => {
          console.log("IG ERR:"+e);
        });
      let littles=await page.evaluate(//get data-utime OK
        () =>
          [...document.querySelectorAll('[alt="Image"]')]//for 登入後
          .map(function(i) {
              let imgurl=i.getAttribute('src');
              if(imgurl.includes('&name=')){
                //imgurl=imgurl.split('&name=')[0]+'&name=small';
                imgurl=imgurl.split('&name=')[0]+'&name=large';//大圖
              }
              return [imgurl];
          })
      );
      await autoScrollWithSec(page);
      if(littles!==null)Outer=arrayUnique(Outer.concat(littles));
      sw++;
    }
    resolve(Outer);
  });
}
async function autoScroll(page,MaxTime){//---劉覽器  自動往下滑
  await page.evaluate(async (MT) => {
      await new Promise((resolve, reject) => {
          var distance = 400;
          var Maxsceonds = MT;//--秒數
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
  },MaxTime);
}
async function BeginAutoScrollWithSec(page){//---FB photos初始滑動
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var distance = 250;
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
function JudgeURL(url,kind){
  if(url.includes('facebook.com')){
    if(url.includes('facebook.com/groups/')){
      let lasts='/';
      if(kind=='photos')lasts='/photos';
      const heads=url.split(url.split('/groups/')[1])[0];
      let OUT=heads+url.split('/groups/')[1].split("/")[0]+lasts;
      if(kind=='photos')return ['gpphotos',OUT];
      else{return ['fbGroup',OUT];}
    }
    else if(url.includes('facebook.com/pg/')){
      let lasts='/posts';
      if(kind=='photos')lasts='/photos';
      const heads=url.split(url.split('/pg/')[1])[0];
      let OUT=heads+url.split('/pg/')[1].split("/")[0]+lasts;
      if(kind=='photos')return ['fbphotos',OUT];
      else{return ['fbFanGroup',OUT]};
    }
    else{return [false,'請輸入FB公開的社團或是粉絲專業網址'];}
  }
  else if(url.includes('instagram.com')){
    return ['ig',url];
  }
  else if(url.includes('twitter.com')){
    return ['twiter',url];
  }
  else{return [false,'網址類型不符合'];}
}
function JudgeDate(StrDay){
  const NOW=new Date().getTime();
  const DS=new Date(StrDay).getTime();
  if((NOW-DS)/3600000<=48)return true;//PO文在2天內
  else{return false}
}
module.exports.ManyCraynamicPuppeteer=ManyCraynamicPuppeteer;
module.exports.DoAPuppeteer=DoAPuppeteer;
module.exports.CrawlerAll=CrawlerAll;
