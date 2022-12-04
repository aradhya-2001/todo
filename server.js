//jshint esversion:6
const exp = require("express");
const bp = require("body-parser");
const app = exp();

app.use(bp.urlencoded({ extended: true }));
app.use(exp.static("public"));
app.set("view engine", "ejs");

var items = ["eat", "netflix", "sleep"];
var workItems = [];

app.get("/", (req, res) => {
  var options = {
    month: "short",
    day: "numeric",
    weekday: "long",
  };
  var today = new Date();
  const day = today.toLocaleDateString("en-US", options);

  res.render("list", { title: day, newI: items});
  //coz of this newI is also array and newI = items i.e contents of newI same of items
});

app.post("/", (req, res) => {
  /*after pressing + , console.log(req.body) will give {newItem:'text entered' ,btnName:'value of btn'} therefore req.body.btnName will give value stored in button*/
  let ni = req.body.newItem;
  if (req.body.btnName === "Work") {
    /* if we write ==="Work List", then will not wrork as it is matched until a whitespace is encountered so if date is wednesday, aug 17 then req.body.btnName=wednesday, */
    workItems.push(ni);
    res.redirect("/2");
  } else {
    items.push(ni);
    res.redirect("/");
  }
});

app.get("/2", (req, res) => {
  res.render("list", { title: "Work List", newI: workItems });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("started");
});
