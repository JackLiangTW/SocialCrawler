function WS(a){
  return new Promise(function(resolve, reject) {      
      setTimeout(function(){
        console.log("Rrr:"+a);
          resolve("Wait DONE")
      },a);
  });
}
function WSB(a){
  return new Promise(function(resolve, reject) {      
      setTimeout(function(){
        console.log("Break:"+a);
        reject("Wait Bad DONE");
      },a);
  });
}
async function a(s){//Twitter "登入" 爬多個頁面
  return new Promise(async function(resolve, reject) {
    // try {       
    //   await WS(1500);
    //   await WSB(1500);  
    // } catch (error) {
    //   reject(error);
    // }
    await WS(1500);
    await WSB(1500).catch((e)=>{
      console.log("Deal ERRR"+e);
    });  
    if(s==0){
      resolve('GOOD 0');
    }else{
      reject('Bad 0');
    }
  });
}
async function m(){
  console.log("Start");  
  await a(1).catch((e)=>{
    console.log(e);  
  });  
  console.log("End");
}
m();