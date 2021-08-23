// projectName: ToDoList web application
// Author: Lilian Umeakunne
// Date created: August 2021

const PORT = process.env.PORT || 3000;
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require ("lodash");
const app = express();


// connection to mongodb.
mongoose.connect("mongodb+srv://admin-Lilian:Test123@cluster0.6gjuc.mongodb.net/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true}, { useFindAndModify: false });

// new Items Schema.
const itemsSchema = ({
    name: String,
});
// a model made off of the Schema(Capitalized).

const Item = mongoose.model("Item", itemsSchema);

// Create new Document using Mongoose.
const Laundry = new Item({ name: "Laundry" });
const Cook = new Item({ name: "Cook" });
const Eat = new Item({ name: "Eat" });

// default array.
const defaultItems = [Laundry, Cook, Eat];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.set("view engine", "ejs"); 

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.get("/", function(req, res){

 // Read data stored inside the itemsDB from within the code file.

Item.find({}, function(err, foundItems){

if (foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
        if (err){
            console.log(err);
        }else {
            console.log("Successful!");
        }
    });
    res.redirect("/");
}else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});  
}        
});
    
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if (!foundList){
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                });
                list.save();

                res.redirect("/" + customListName);

            } else{
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});  
            }
        }
    });
   
});

// Push new TodoList items to DB and finish with a re-direct to the home route.

app.post("/", function (req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({name: itemName});

    if (listName === "Today"){
        item.save();
        res.redirect("/");

    } else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});
    

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndDelete(checkedItemId, function(err){
        if (!err){
         console.log("successfully deleted this entry!");
         res.redirect("/"); 
        }
    });
 
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err){
                res.redirect("/" + listName);
            }
        });
    }
  
});
 
app.get("/about", function(req, res){
    res.render("about");
});

app.listen(PORT, function(){
    console.log("Server has started successfully");
});