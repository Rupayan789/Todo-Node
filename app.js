//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB',{ useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify: false });
const itemschema=new mongoose.Schema({
  todo:{
    type:String,
    required:[true,"Please mention what to do"]
  }
});
const Item=mongoose.model("Item",itemschema);
const item1=new Item({
  todo:"Get up early in the morning"
});
const item2=new Item({
  todo:"Go to Gym"
});
const item3=new Item({
  todo:"Have a heavy breakfast"
});
const itemarr=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemschema]
});
const List=mongoose.model("List",listSchema);
const day = date.getDate();
app.get("/", function(req, res) {


  Item.find(function(err,foundItems){
    if(foundItems.length===0)
    {
      Item.insertMany(itemarr,(err)=>{
        if(!err)
        console.log("Successfully inserted");
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: day, newListItems:foundItems});
    }

  });


});

app.post("/", function(req, res){
  const cominglistname=req.body.list;
  const comingitemname=req.body.newItem;
  const item=new Item({
    todo:comingitemname
  });
  if(cominglistname === day)
  {

    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:cominglistname},function(err,Foundlist){
      Foundlist.items.push(item);
      Foundlist.save();
      res.redirect("/"+cominglistname);
    });
  }


});
app.post("/delete",(req,res)=>{
  const iditem=req.body.checkbox;
  const bodylistname=req.body.ListName;
  if(bodylistname===day)
  {
    Item.findByIdAndRemove(iditem,function(err){
      if(!err)
      res.redirect("/");
    });
  }
  else
  {
    List.findOneAndUpdate({name:bodylistname},{$pull:{items:{_id:iditem}}},(err,FoundList)=>{
      if(!err)
      res.redirect("/"+bodylistname);
    });
  }

});


app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.deleteMany({name:"favicon.ico"},(err)=>{

  })
  List.findOne({name:customListName},(err,foundList)=>{
    if(!err)
    {
      if(!foundList)
      {
          const newList=new List({
          name:customListName,
          items:itemarr
          });
          newList.save();
          res.redirect("/"+customListName);
      }
      else
      {
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
      }

    }

  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
