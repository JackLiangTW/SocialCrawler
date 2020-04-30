var config=require("config");
var express=require("express");
var request=require("request");
var bodyParser=require("body-parser");

var app=express();
app.use(bodyParser.json());

const PAGE_TOKEN=config.get('devConfig.pageAccessToken');
const VERIFY_TOKEN_0=config.get('devConfig.verifyToken');

const ResTemplate={
  //0:選擇語系
  tp0:{
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "選擇語系",          
          "buttons": [//最多3個btn
            {
              "type": "postback",
              "title": "繁體中文",
              "payload": "<GoTP1>",
            },                       
          ],
        }]
      }
    }
  },
  //1: 功能3btn attach
  tp1:{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",      
          "text":"來去逛逛",
          "buttons": [//最多3個btn
            {                                          
              "type": "web_url",
              "url": "https://www.messenger.com",
              "title": "Ami黃頁",              
            },
            {               
              "type": "web_url",
              "url": "https://www.messenger.com",
              "title": "社群動態",              
            },
            {
              "type": "web_url",
              "url": "https://www.messenger.com",
              "title": "個人設定",              
            }            
          ],
        }                    
  }
  },
  tp2:{
    "text": "馬上簡易刊登:",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"我是店家",
        "payload":"<GoTP3a>",        
      },
      {
        "content_type":"text",
        "title":"我有商品",
        "payload":"<GoTP3b>",        
      },
      {
        "content_type":"text",
        "title":"我要提供服務",
        "payload":"<GoTP3c>",        
      },
      {
        "content_type":"text",
        "title":"刊登分類小廣告",
        "payload":"<GoTP3d>",        
      },      
    ]    
  },
  tp3a:{
    "text":"請輸入店家名稱:"
  },
  tp3b:{
    "text":"請輸入商品名稱:"
  },
  tp3c:{
    "text":"請輸入服務名稱:"
  },
  tp3d:{
    "text":"請輸入廣告名稱:"
  },
  //5: 選擇地區-大區
  tp4:{
    "text": "選擇您的位置:",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"北部",
        "payload":"<GoTP4a>",        
      },
      {
        "content_type":"text",
        "title":"中部",
        "payload":"<GoTP4b>",        
      },
      {
        "content_type":"text",
        "title":"南部",
        "payload":"<GoTP4c>",        
      },
      {
        "content_type":"text",
        "title":"東部/其他地區",
        "payload":"<GoTP4d>",        
      },
      {
        "content_type":"text",
        "title":"不分區域",
        "payload":"<GoTP4e>",        
      },      
    ]
  },
  //4a 北部細地區
  tp4a:{
    "text": "選擇您的位置(縣市):",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"基隆",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"台北",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"新北",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"桃園",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"新竹",
        "payload":"<GoTP5>",        
      },      
    ]
  },
  //4b 中部細地區
  tp4b:{
    "text": "選擇您的位置(縣市):",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"苗栗",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"台中",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"彰化",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"南投",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"彰化",
        "payload":"<GoTP5>",        
      },
    ]
  },
  //4c 南部細地區
  tp4c:{
    "text": "選擇您的位置(縣市):",
    "quick_replies":[      
      {
        "content_type":"text",
        "title":"雲林",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"嘉義",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"台南",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"高雄",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"屏東",
        "payload":"<GoTP5>",        
      },
    ]
  },
  //4d 東部細地區
  tp4d:{
    "text": "選擇您的位置(縣市):",
    "quick_replies":[      
      {
        "content_type":"text",
        "title":"宜蘭",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"花蓮",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"台東",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"金門",
        "payload":"<GoTP5>",        
      },
      {
        "content_type":"text",
        "title":"澎湖",
        "payload":"<GoTP5>",        
      },
    ]
  },
  //5: 成功 attach
  tp5:{ 
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"恭喜!",
        "buttons":[
          {
            "type":"web_url",
            "url":"https://www.messenger.com",
            "title":"Visit Messenger"
          },
          {
            "type":"web_url",
            "url":"https://www.messenger.com",
            "title":"Visit Messenger"
          },  
        ]
      }
    }
  },
};

app.get('/webhook', (req, res) => {
  
    //const VERIFY_TOKEN = VERIFY_TOKEN_0;
    if(req.query['hub.mode'] === 'subscribe' &&req.query['hub.verify_token'] ===VERIFY_TOKEN_0){
      console.log("Sc webhook");//-驗證權杖通過 (webhook每換一次都要驗證一次  權杖是:VERIFY_TOKEN_0)
      res.status(200).send(req.query['hub.challenge']);
    }else{
      console.error("Faild");
      res.sendStatus(403);
    }
    
  })
app.post('/webhook', (req, res) => {  

    let body = req.body;
    if (body.object === 'page') {  
      // Iterate over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
        let webhook_event = entry.messaging[0];
        let sender_psid = webhook_event.sender.id;
        
        if (webhook_event.message) {
          if(webhook_event.message.quick_reply){
            handlePostback(sender_psid,webhook_event.message.quick_reply);
          }else{
            handleMessage(sender_psid, webhook_event.message);        
          }          
        } else if (webhook_event.postback) {                    
          handlePostback(sender_psid, webhook_event.postback);
        }        
        //console.log(webhook_event);        
      });
      res.status(200).send('EVENT_RECEIVED');
  
    } else {
      res.sendStatus(404);
    }
  });

  function handleMessage(sender_psid, received_message) {//-判斷輸入的message是啥
  let response;
  
  // Checks if the message contains text
  if (received_message.text) {    
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
    }
  }else if (received_message.attachments) {
    // Get the URL of the message attachment
    //let attachment_url = received_message.attachments[0].payload.url;
    response = ResTemplate.tp1;
  } 
  callSendAPI(sender_psid, response,false);    
}

function handlePostback(sender_psid, received_postback) {//-IF reply msg是面板典籍的button (點及面板button觸發)
  
  let response;//傳出回復的值
  let payload = received_postback.payload;
  let IsQickMode=false;
  // if(payload ==='QICKUPLOAD'){    
  //   response =  ResTemplate.tp1;
  // }else if(payload ==='ABOUTAMI'){
  //   //response = { "text": "Ami是一個社交購物網站。對於買家而言可以準確、方便的找尋到便宜、優良的商品。對於賣家而言，可以快速刊登商品，找到許多潛在購買者。" }
  //   response =  ResTemplate.tp1;
  // }else if (payload === 'GoTP2') {    
  //   response =  ResTemplate.tp2;
  // } else if (payload === 'GoTP3') {    
  //   response =  ResTemplate.tp3;
  // }else if (payload === 'GoTP4') {    
  //   response =  ResTemplate.tp4;
  // } else if (payload === 'GoTP5') {    
  //   response =  ResTemplate.tp5;
  // }else if (payload === 'GoTP6') {    
  //   response =  ResTemplate.tp6;
  // }
  switch (payload) {    
    case 'QICKUPLOAD':
        response =  ResTemplate.tp0;
        break;
    case 'ABOUTAMI':
        response =  ResTemplate.tp5;
        break;
    case '<GoTP1>':
        response =  ResTemplate.tp1;
        
        callSendAPI(sender_psid, response,IsQickMode);
        IsQickMode=true;
        response =  ResTemplate.tp2;
        break;
    case '<GoTP3a>':
        IsQickMode=true;
        response =  ResTemplate.tp4;
        break;
    case '<GoTP4a>':
        IsQickMode=true;
        response =  ResTemplate.tp4a;
        break;
    case '<GoTP4b>':
        IsQickMode=true;
        response =  ResTemplate.tp4b;
        break;
    case '<GoTP4c>':
        IsQickMode=true;
        response =  ResTemplate.tp4c;
        break;
    case '<GoTP4d>':
        IsQickMode=true;
        response =  ResTemplate.tp4d;
        break;
    case '<GoTP4e>':       
        response =  ResTemplate.tp5;
        break;
    case '<GoTP5>':
        response =  ResTemplate.tp5;
        break;
    default:
        response ={ "text": "過程發生錯誤!!!" }
         console.log('Sorry,ERRRRRR');
  }
  
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response,IsQickMode);
}

function callSendAPI(sender_psid, response,IsQickMode) {
    let request_body;    
    if(IsQickMode){
      console.log("IS Q");
      request_body = {
        "recipient": {
          "id": sender_psid
        },
        "messaging_type":"RESPONSE",
        "message": response
      }
    }else{
      console.log("IS N-Q");
      request_body = {
        "recipient": {
          "id": sender_psid
        },
        "message": response
      }
    }    
  
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!');
        //console.log("5");
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }
  
  app.listen(4000,function(){
    console.log("LS4000");
  });

//  var c=
//   {
//     "message":{
//       "text":"Your Location",
//       "quick_replies":[{"content_type":"location"}]
//       },
//       "recipient":
//       {"id":"1652173738173043"},
//       "messaging_type":"RESPONSE"
//   }
 