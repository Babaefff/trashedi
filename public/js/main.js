const account = document.querySelector(".dropdown")
const open = document.getElementById("open-btn")
account.addEventListener("click", function () {
    document.querySelector(".dropdown-content").classList.toggle("active")
})
open.addEventListener("click", function () {
    const responsive_list = document.querySelector(".navbar-main .list ul")

    if (responsive_list.style.transform == "translateX(100%)") {
        responsive_list.style.transform = "translateX(-50%)";
    }
    else {
        responsive_list.style.transform = "translateX(100%)";
    }
})