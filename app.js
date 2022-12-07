const express = require("express");
const ejs = require("ejs");
const app = express();


app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "public"))
app.listen(3000, function (err) {
    console.log("server running")
})


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/views/index.html")

})