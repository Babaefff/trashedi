const express = require("express")
const ejs = require("ejs");

const mongoose = require("mongoose");
const port = process.env.PORT || 5000;

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const fs = require('fs');
const { dirname } = require("path");
var ObjectId = require('mongodb').ObjectID;


const app = express();
app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({ extended: true }));
app.use(session(
    {
        secret: 'my', resave: false, saveUninitialized: false,
    }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false)
mongoose.connect('mongodb+srv://babaef:ronaldoo123@cluster0.yljpnc2.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true });

const cuponSchema = new mongoose.Schema({
    title: String,
    article: String,
    cuponImage: {
        data: Buffer,
        contentType: String
    }
})
const Cupon = new mongoose.model("Cupon", cuponSchema)


// newcupon = Cupon({
//     title: "Araz Cafe",
//     article: "Bridge Plaza - nın birinci mərtəbəsində yerləşən Bridge cafe - nin artıq çoxdan çoxsaylı daimi müştəriləri formalaşıb.Bu səbəbsiz deyil.Burada istirahət günləri sevimli filmlərə baxmaqla yanaşı, məkanın əla menyusundan zövq ala bilərsiniz",
//     cuponImage: {
//         data: fs.readFileSync(__dirname + "/public/img/araz.jpg"),
//         contentType: 'image/png'
//     }





const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    bottle: Number,
    cuponum: [cuponSchema]

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
    Cupon.find(function (err, result) {
        const bottle = req.session.bottle;
        res.render(__dirname + "/views/index", { cupons: result, botl: bottle, user: req.user })
    })


})




app.get("/my-profile", function (req, res) {
    if (!req.user) {
        res.redirect("/login")
    }
    const bottle = req.session.bottle;
    const profileCupon = req.user.cuponum;
    res.render(__dirname + "/views/my-profile", { cupons: profileCupon, user: req.user, botl: bottle })

})
app.get("/login", function (req, res) {
    res.render(__dirname + "/views/login")
});
app.get("/register", function (req, res) {
    res.render(__dirname + "/views/register")
});

app.get("/:cuponid", function (req, res) {

    const cuponid = req.params.cuponid.trim();
    if (!req.user) {
        res.redirect("/login");
    } else {
        Cupon.findById(ObjectId(cuponid), function (err, result) {
            if (err) {
                console.log(err)
            } else {
                User.updateOne({ _id: ObjectId(req.user._id) }, { $push: { cuponum: result } }, function (err, doc) {
                    if (err) {
                        console.log(err)
                    }
                })
                res.redirect("/")
            }
        })
    }
})


app.post("/register", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function () {
                User.updateOne({ username: user.username }, { bottle: 0 }, function (err, result) {
                    if (err) {
                        console.log(err)
                    }
                })
                User.findOne({ username: user.username }, function (err, userim) {
                    if (err) {
                        res.redirect("/register")
                    }
                    req.session.bottle = userim.bottle;

                })

                res.redirect("/")
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
                                        req.session.bottle = u.bottle;
                                        res.redirect("/",);
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





app.listen(port, function (err) {
    console.log("server running")
})
