const mongoose=require("mongoose");

const crawlermenu=new mongoose.Schema({
    date:{
        type:String,
        default:'0',
    },
    kind:{
        type:String,
        default:'facebook',
    },
    data:{
        type:Array,      
    }
});
module.exports=mongoose.model('CrawlerMenu',crawlermenu);
