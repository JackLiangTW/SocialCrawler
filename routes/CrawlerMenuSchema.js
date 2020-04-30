const CrawlerMenu=require('./schema/CrawlerMenu');

function ToDate(){
    let dd = new Date();
    let years=dd.toString().slice(11,15);
    let month=dd.getMonth()+1;
    let days=dd.toString().slice(8,10);
    let out=`${years}/${month}/${days}`
    return out;
}
async function GetAllMenu(){
    return new Promise(async function(resolve,reject){
        await CrawlerMenu.find({}, function (err, userDoc) { 
            if(err){
                resolve(['Menu 錯誤!',false]);
            }
            if(!userDoc){//找不到對應DB
                resolve(['Menu 沒有資料',false]);
            }
            else{//正確找到對應DB
                resolve(userDoc);
            }
        })
    })
}
async function GetSingleMenu(kind){
    return new Promise(async function(resolve,reject){
        await CrawlerMenu.findOne({kind:`${kind}`},function (err, userDoc) { 
            if(err){
                console.log(`${kind} Menu Single 錯誤!`);
                resolve(false);
            }
            if(!userDoc){//找不到對應DB
                console.log(`${kind} Menu Single 沒有資料!`);
                resolve(false);
            }
            else{//正確找到對應DB
                resolve(userDoc);
            }
        })
    })
}
async function DeleteMenu(KD){
    return new Promise(async function(resolve,reject){
        await CrawlerMenu.deleteMany({kind:`${KD}`},function (err) {
            if (err){
                console.log(`D0::`+err);
                resolve(err)
            }
        });
        resolve('Menu Delete Done');
    })  
}
async function InsertMenu(data){
    return new Promise(async function(resolve,reject){        
        await DeleteMenu(data.kind);
        const menuschem=new CrawlerMenu({
            date:data.date,
            kind:data.kind,
            data:data.data
        });
        try{
            await menuschem.save();
            console.log(`Menu Insert ${data.kind} DONE`);
            resolve(`Menu Change ${data.kind} DONE`);
        }catch(err){
            console.log("DB ERR:"+err);  
            reject(`Menu Insert ${data.kind} ERR:${err}`)
        }
    })
}
module.exports.GetAllMenu=GetAllMenu;
module.exports.InsertMenu=InsertMenu;
module.exports.GetSingleMenu=GetSingleMenu;

