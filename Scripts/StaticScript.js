




const sofaIcon=document.getElementById("sofa-icon");

sofaIcon.addEventListener("mouseenter", ()=>{
    if(sofaIcon.bouncing!=true){
        sofaIcon.classList.add("fa-bounce");
        sofaIcon.bouncing=true;
    }
});

sofaIcon.addEventListener("mouseleave", ()=>{
    sofaIcon.classList.remove("fa-bounce");
    sofaIcon.bouncing=false;
});


document.querySelectorAll(".navbar-icon").forEach(icon=>{
    icon.addEventListener("mouseenter", ()=>{
        icon.classList.add("navbar-icon-hover");
    });

    icon.addEventListener("mouseleave", ()=>{
        icon.classList.remove("navbar-icon-hover");
    });
});



