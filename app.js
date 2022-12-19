//jshint esversion:6
const exp = require("express");
const bp = require("body-parser");
const mongoose = require("mongoose");
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
const uSchema = new mongoose.Schema({
  name: String,
});
const hModel = mongoose.model("home", uSchema);
const wModel = mongoose.model("work", uSchema);

app.get("/", (req, res) => {
  var options = {
    month: "short",
    day: "numeric",
    weekday: "long",
  };
  var today = new Date();
  const day = today.toLocaleDateString("en-US", options);

  hModel.find({}, (err, i) => {
    if (err) {
      console.log(err);
    } else {
      res.render("list", { title: day, items: i }); /* on visiting the home pg, each time full document of our db is sent to list.ejs intead of an array  */
    }
  });
});

app.get("/2", (req, res) => {
  wModel.find({}, (err, i) => {
    if (err) {
      console.log(err);
    } else {
      res.render("list", { title: "Work List", items: i });
    }
  });
});

app.post("/", (req, res) => {
  /*after pressing + , console.log(req.body) will give {newItem:'text entered' ,btnName:'value of btn'} therefore req.body.btnName will give value stored in button*/
  let ni = req.body.newItem;
  if (req.body.btnName === "Work") {
    /* if we write ==="Work List", then will not wrork as it is matched until a whitespace is encountered so if date is wednesday, aug 17 then req.body.btnName=wednesday, */
    let wrk_l = new wModel({
      name: ni,
    });
    wrk_l.save();

    res.redirect("/2");
  } else {
    let hm_l = new hModel({
      name: ni,
    });
    hm_l.save();
    res.redirect("/");
  }
});

app.post("/delete",(req,res)=>{
  let cond=req.body
  console.log(cond)
  if(cond){
    hModel.deleteOne({id:cond.check},(err)=>{
      if(err){
        console.log(err)
      }else{
        console.log("deleted")
      }
    })
  }
})

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("started");
});