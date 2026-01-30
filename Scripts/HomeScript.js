
import { registerUser, loginUser, forgotPassword} from "./AuraHomeServices.js";

import { loadProducts} from "./AuraHomeServices.js";


//await registerUser("mustafawork911@gmail.com", "147852369");
//console.log(await loginUser("mustafawork911@gmail.com", "147852369"));

//await forgotPassword("mustafawork911@gmail.com");
//await loginUser("mustafawork911@gmail.com", "147852369");

//await loadProducts();


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




const words = ["Elevated", "Tailored", "Artisanal", "Curated", "Flawless"];
const textEl = document.getElementById("typing");

let wordIndex = 0;
let letterIndex = 0;

function type() {
    if (letterIndex < words[wordIndex].length) {
        textEl.textContent += words[wordIndex][letterIndex];
        letterIndex++;
        setTimeout(type, 100);
    } else {
        setTimeout(erase, 1500);
    }
}

function erase() {
    if (letterIndex > 0) {
        textEl.textContent = words[wordIndex].substring(0, letterIndex - 1);
        letterIndex--;
        setTimeout(erase, 50);
    } else {
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 300);
    }
}

type();

