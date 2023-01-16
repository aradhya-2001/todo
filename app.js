//jshint esversion:6
const exp = require("express");
const bp = require("body-parser");
const _ = require("lodash")
const mongoose = require("mongoose");
const { render } = require("ejs");
mongoose.set('strictQuery', true);
const app = exp();

app.use(bp.urlencoded({ extended: true }));
app.use(exp.static("public"));
app.set("view engine", "ejs");

const url = "mongodb://localhost:27017/itemsDb";
mongoose.connect(url, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("db created");
  }
});
const items_schema=new mongoose.Schema({
  name:String,
})

const route_schema=new mongoose.Schema({
  route:String,
  names_ar:[items_schema], /* we created names_ar as the array of items_schema  instead of simply creating it as  [String] or array of strings coz by this meathod each name item will be a doc having its id and we need this id to del that unique item in del route. If we made name as string array only, then if 2 names are equal then 'pull' will del every matching string so we need the unique id of every item  */
})

const items_model=mongoose.model("items",items_schema)
const route_model=mongoose.model("route",route_schema)

let curr_date,date_space  /* for making global variable */
function today(){
  var options = {
    month: "short",
    day: "numeric",
    weekday: "long",
  };
  var today = new Date();
  curr_date = today.toLocaleDateString("en-US", options);
  date_space=curr_date.substring(0, curr_date.indexOf(' '));  /* curr_date="Friday, Dec 30", date_space="Friday," */
}

  
app.get("/", (req, res) => {
  today()
  route_model.findOne({route:curr_date}, (err, doc) => {
    if (err) {
      console.log(err);
    }if(!doc){
      doc=new route_model({
        route:curr_date,
        names_ar:[],
      })
      doc.save()
    }
    res.render("list", { title: curr_date, route_doc: doc}); /* here doc will be like {_id:" ",route:" ",names_ar:[{_id:" ",name:" "},{},{}]}. On visiting the home pg, each time full document of our db is sent to list.ejs intead of an array  */
  });
});

app.get("/:topic",(req,res)=>{
  let title=_.capitalize(req.params.topic)  
  route_model.findOne({route:title},(err,doc)=>{   /* here, if we write .findOne() then it find a single document like {} and list.ejs is iterating over an array and printing item so this will cause error. On writing .find(), instead of giving a single document it is giving an array having single doc in it like [{}]. */
    if(!err){
      if(!doc){  /* if the path of root url is entered 1st time then 1st save it then render */
      doc=new route_model({
          route:title,
          names_ar:[],  /* when we get to the path 1st time then route has to be set but there is no list entered but if we are saving the route in db then we have to enter some value in name feild also. Thats why we are putting it to string "default" so that those items having name set to "default" can be skipped in the for loop in list.ejs */ 
        })
        doc.save()
      }
      res.render("list",{title:title, route_doc:doc})
    }else{
      console.log(err)
    }
  })
})

app.post("/", (req, res) => {   /*after pressing + , console.log(req.body) will give {new_item:'text entered' ,btn_name:'value of btn'} therefore req.body.btn_name will give value stored in button i.e the name of the title */
  
let ni = req.body.new_item;
  let title =req.body.btn_name  /* when we post from home pg having title like "Friday, Dec 30" i.e "Friday,". Therefore console.log(title) will print only "Friday,". */
  let name_doc=new items_model({
    name:ni,
  })
  name_doc.save()

  if(title==date_space){
    route_model.findOne({route:curr_date},(err,doc)=>{  /* remember doc is like {_id:" ",route:" ",names_ar:[{_id:" ",name:" "},{},{}]} */
      if(!err){
        doc.names_ar.push(name_doc)
        doc.save()
        res.redirect("/"); 
      }else{
        console.log(err)
      }
    })
  }else{
    route_model.findOne({route:title},(err,doc)=>{
      if(!err){
        doc.names_ar.push(name_doc)
        doc.save()
        res.redirect("/"+title);
      }else{
        console.log(err)
      }
    })
  }
});

app.post("/delete",(req,res)=>{
  let check=req.body.check /* console.log(req.body) logs {check: '63c5a9a1a5ee1f204654f451', hidden_btn: 'Monday, Jan 9'}. If none checkboxes are clicked then it will print empty {} */
  let title=req.body.hidden_btn
 if(check){
  let update={
    $pull:{
      names_ar:{_id:check}}
  }
  route_model.updateOne({route:title},update,(err)=>{   /* {_id:" ",route:" ",names_ar:[{_id:" ",name:" "},{},{}]} */
    if(!err){
      console.log(err)
    }
  })
 }
 res.redirect("/"+title)
})

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("started");
});
