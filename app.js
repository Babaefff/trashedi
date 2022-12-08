const express = require("express")
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const session = require('express-session');


app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "public"))
app.use(express.urlencoded({ extended: true }));
app.use(session(
    {
        secret: 'mySecret', resave: false, saveUninitialized: false,
    }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false)
mongoose.connect("mongodb://127.0.0.1:27017/recycleDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    bottle: Number

})
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/views/index.html")

})
app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/views/login.html")
});
app.get("/register", function (req, res) {
    res.sendFile(__dirname + "/views/register.html")
});


app.post("/register", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/");
            })
        }
    })
})
app.post("/login", (req, res) => {
    const email = req.body.email;
    User.findOne({ username: email }, function (err, u) {
        if (err) {
            console.log(err);
        } else {
            if (u) {
                u.authenticate(req.body.password, (err, model, info) => {
                    if (info) {
                        res.send("Wrong email or password!");
                    }
                    if (err) {
                        console.log(err);
                    } else if (model) {
                        req.login(u, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                passport.authenticate("local");
                                req.session.save((error) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.redirect("/");
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.send("Wrong email or password!");
            }
        }
    });
});





app.listen(3000, function (err) {
    console.log("server running")
})
