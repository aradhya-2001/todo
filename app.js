//jshint esversion:6
const exp = require("express");
const bp = require("body-parser");
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

const route_schema=new mongoose.Schema({
  route:String,
  name:String
})

const route_model=mongoose.model("title",route_schema)

let curr_date,date_space  /* for making global variable */
app.get("/", (req, res) => {
  var options = {
    month: "short",
    day: "numeric",
    weekday: "long",
  };
  var today = new Date();
  curr_date = today.toLocaleDateString("en-US", options);
  date_space=curr_date.substring(0, curr_date.indexOf(' '));  /* curr_date="Friday, Dec 30", date_space="Friday," */
  
  let item=new route_model({
    route:curr_date,
    name:"default",
  })
  item.save()

  route_model.find({route:curr_date}, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("list", { title: curr_date, items: docs }); /* on visiting the home pg, each time full document of our db is sent to list.ejs intead of an array  */
    }
  });
});

app.get("/:topic",(req,res)=>{
  let title=req.params.topic
  route_model.find({route:title},(err,doc)=>{   /* here, if we write .findOne() then it find a single document like {} and list.ejs is iterating over an array and printing item so this will cause error. On writing .find(), instead of giving a single document it is giving an array having single doc in it like [{}]. */
    if(!err){
      if(!doc){  /* if the path of root url is entered 1st time then 1st save it then render */
        let new_route=new route_model({
          route:title,
          name:"default",  /* when we get to the path 1st time then route has to be set but there is no list entered but if we are saving the route in db then we have to enter some value in name feild also. Thats why we are putting it to string "default" so that those items having name set to "default" can be skipped in the for loop in list.ejs */ 
        })
        new_route.save()
      }
      res.render("list",{title:title, items:doc})
    }else{
      console.log(err)
    }
  })
})

app.post("/", (req, res) => {   /*after pressing + , console.log(req.body) will give {new_item:'text entered' ,btn_name:'value of btn'} therefore req.body.btn_name will give value stored in button i.e the name of the title */
  let ni = req.body.new_item;
  let title =req.body.btn_name  /* when we post from home pg having title like "Friday, Dec 30" i.e "Friday,". Therefore console.log(title) will print only "Friday,". */
  console.log(title)
  if(title==date_space){
    let item=new route_model({
      route:curr_date,
      name:ni,
    })
    item.save();
    res.redirect("/"); 
  }else{
    let item=new route_model({
      route:title,
      name:ni,
    })
    item.save();
    res.redirect("/"+title); 
  }
  
});

app.post("/delete",(req,res)=>{
  let cond=req.body /* console.log(cond) logs {name of checkbox:'id of the note' }, like->{check: '63aead6e9706b3ca5c039bb3'}. If none checkboxes are clicked then it will print empty {} */
  if(cond){
    h_model.deleteOne({id:cond.check},(err)=>{
      if(err){
        console.log(err)
      }else{
        console.log("deleted")
      }
    })
  }
  res.redirect("/")
})

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("started");
});
