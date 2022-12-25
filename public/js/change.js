User.findOne({ username: user.username }, function (err, userim) {
    document.getElementById("mybottle").innerHTML = userim.bottle;
})