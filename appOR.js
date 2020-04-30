var config=require("config");
var express=require("express");
var request=require("request");
var bodyParser=require("body-parser");

var app=express();
app.use(bodyParser.json());

const PAGE_TOKEN=config.get('devConfig.pageAccessToken');
const VERIFY_TOKEN_0=config.get('devConfig.verifyToken');

const ResTemplate={
  //1: Img+postback button
  tp1:{
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Is this the right picture?",
          "subtitle": "Tap a button to answer.",
          // "image_url": attachment_url,
          "buttons": [//最多3個btn
            {
              "type": "postback",
              "title": "GoTP2",
              "payload": "GoTP2",
            },
            {
              "type": "postback",
              "title": "GoTP3",
              "payload": "GoTP3",
            },
            {
              "type": "postback",
              "title": "GoTP3",
              "payload": "GoTP3",
            }            
          ],
        }]
      }
    }
  },
  //2: Send Img
  tp2:{
    "attachment":{
      "type":"image", 
      "payload":{
        "is_reusable": true,
        "url":"https://i2-prod.mirror.co.uk/incoming/article21565991.ece/ALTERNATES/s615/1_THP_MDG_240220Slug_15879JPG.jpg"
      }
    }
  },
  //3: Slick
  tp3:{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title": "Is SlickA",
            "subtitle": "SlickA",            
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              },
            ],
          },
          {
            "title": "Is SlickB",
            "subtitle": "SlickB",            
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              },
            ],
          },
          {
            "title": "Is SlickC",
            "subtitle": "SlickC",            
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              },
            ],
          },
        ]
      }
    }
  },
  //4: qick replies
  tp4:{
    "text": "我的居住地區:",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"北北基",
        "payload":"<TEXT>",
        // "image_url":"https://i2-prod.mirror.co.uk/incoming/article21565991.ece/ALTERNATES/s615/1_THP_MDG_240220Slug_15879JPG.jpg"
      },
      {
        "content_type":"text",
        "title":"桃竹苗",
        "payload":"<TEXT>",        
      },
      {
        "content_type":"text",
        "title":"台中",
        "payload":"<TEXT>",        
      },
      {
        "content_type":"text",
        "title":"彰化雲林",
        "payload":"<TEXT>",        
      },
      {
        "content_type":"text",
        "title":"台南高雄",
        "payload":"<TEXT>",        
      },
      {
        "content_type":"text",
        "title":"彰化雲林",
        "payload":"<TEXT>",        
      },
    ]    
  },
  //5: get Location
  tp5:{
    "text": "Phone",
    "quick_replies":[
      {"content_type":"user_phone_number"}
    ]
  },
  //5: get phone
  tp6:{    
    "text": "Location",
    "quick_replies":[
      {"content_type":"location"}
    ]
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
        let TypeClass=0;    
        if (webhook_event.message) {
          TypeClass=1;
          handleMessage(sender_psid, webhook_event.message);        
        } else if (webhook_event.postback) {          
          TypeClass=2;
          handlePostback(sender_psid, webhook_event.postback);
        }
        console.log(`${TypeClass}:`);
        console.log(webhook_event);
        
      });

      // Return a '200 OK' response to all events
      res.status(200).send('EVENT_RECEIVED');
  
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
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
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {//-IF reply msg是面板典籍的button (點及面板button觸發)
  
  let response;//傳出回復的值
  let payload = received_postback.payload;
  //response = { "text": "阿你點了Yes" }
  if(payload ==='QICKUPLOAD'){    
    response =  ResTemplate.tp1;
  }else if(payload ==='ABOUTAMI'){
    response = { "text": "Ami是一個社交購物網站。對於買家而言可以準確、方便的找尋到便宜、優良的商品。對於賣家而言，可以快速刊登商品，找到許多潛在購買者。" }
  }else if (payload === 'GoTP2') {    
    response =  ResTemplate.tp2;
  } else if (payload === 'GoTP3') {    
    response =  ResTemplate.tp3;
  }else if (payload === 'GoTP4') {    
    response =  ResTemplate.tp4;
  } else if (payload === 'GoTP5') {    
    response =  ResTemplate.tp5;
  }else if (payload === 'GoTP6') {    
    response =  ResTemplate.tp6;
  }

  
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    let request_body;    
    if(response.text=='Location'||response.text=='Phone'){
      console.log("IS LO/PH");
      request_body = {
        "recipient": {
          "id": sender_psid
        },
        "messaging_type":"RESPONSE",
        "message": response
      }
    }else{
      console.log("IS NORMAL");
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
 