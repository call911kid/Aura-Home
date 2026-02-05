
export async function load() {
    const res = await fetch("Static.html");
    const html = await res.text();

    const footer=await fetch("footer.html");
    const footerHtml=await footer.text();
    
    document.getElementById("navbar").innerHTML = html;
    let f=document.getElementById("footer");
    if(f){
        f.innerHTML=footerHtml;
    }

}

export async function setupEvents() {
    const sofaIcon = document.getElementById("sofa-icon");

    sofaIcon.addEventListener("mouseenter", () => {
        if (sofaIcon.bouncing != true) {
            sofaIcon.classList.add("fa-bounce");
            sofaIcon.bouncing = true;
        }
    });

    sofaIcon.addEventListener("mouseleave", () => {
        sofaIcon.classList.remove("fa-bounce");
        sofaIcon.bouncing = false;
    });


    document.querySelectorAll(".navbar-icon").forEach(icon => {
        icon.addEventListener("mouseenter", () => {
            icon.classList.add("navbar-icon-hover");
        });

        icon.addEventListener("mouseleave", () => {
            icon.classList.remove("navbar-icon-hover");
        });
    });


    // add cart and wish list scripts

}

