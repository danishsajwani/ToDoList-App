const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")
// const date = require(__dirname + "/date.js") // two function will be shown which is exported from the date.js file

// console.log(date);   // two function will be shown which is exported from the date.js file

const app = express()

// let items = ['Buy Food', 'Cook Food', 'Eat Food']
// let workItems = []

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))


mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model('Item', itemsSchema)

const item1 = new Item({
  name: "Welcome ToDoList!"
})

const item2 = new Item({
  name: "Hit + button to add new item"
})

const item3 = new Item({
  name: "Hit here to delete item"
})

const defaultitems = [item1, item2, item3]


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model('List', listSchema)


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {     // find() will give the foundItems results in a array.

    if (foundItems.length === 0) {
      Item.insertMany(defaultitems, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Successfully")
        }
      })
      res.redirect("/")
    } else {
      res.render('list', {listTitle: "Today", newListItems: foundItems})
    }
  })
})


app.post("/", function(req, res) {
  const itemName = req.body.newitem;
  const listName = req.body.list;
  // console.log(itemName, typeof itemName);
  // console.log(listName, typeof listName);

  const newItem = new Item({
    name: itemName
  })

  if (listName === "Today") {
    newItem.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(newItem)
      foundList.save()
    })
  }
})


app.post("/delete", function(req, res) {
  const checkboxIdChecked = req.body.checkbox
  const checkboxListItem = req.body.listItem
  // console.log(checkboxIdChecked)
  // console.log(checkboxListItem)

  if (checkboxListItem === "Today") {
    Item.findByIdAndDelete({ _id: checkboxIdChecked }, function(err) {
      if (!err) {
        console.log("deleted")
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name: checkboxListItem}, {$pull: {items: { _id: checkboxIdChecked }}}, function(err, found) {
      if (!err) {
        res.redirect("/" + checkboxListItem)
      }
    })
  }
})


app.get("/:customNameList", function(req, res) {
  var customListName = _.capitalize(req.params.customNameList)

  List.findOne({name: customListName}, function(err, foundList) { // findOne() will give the foundItems results in a object.
    if (!err) {
      if (!foundList) {
        // create a new list
        const listName = new List({
          name: customListName,
          items: defaultitems
        })
        listName.save()

        res.redirect("/" + customListName)

      } else {
        // show exiting list
        res.render('list', {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
})



app.listen(3000, function() {
  console.log("Server is running at port 3000.")
})
