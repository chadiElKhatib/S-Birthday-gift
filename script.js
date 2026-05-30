// MUSIC
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const slideSubText = document.getElementById("slideSubText");

function animateSlide(element, index) {
    const animations = ["slide-zoom", "slide-left", "slide-float"];

    element.classList.remove("slide-zoom", "slide-left", "slide-float", "cinematic-active");

    element.style.animation = "none";
    void element.offsetWidth;
    element.style.animation = "";

    const animation = animations[index % animations.length];
    element.classList.add(animation);

    setTimeout(() => {
        element.classList.add("cinematic-active");
    }, 1500);
}

const title = "Tillykke med fødselsdagen";
const birthdayTitle = document.getElementById("birthdayTitle");

const middle = (title.length - 1) / 2;

title.split("").forEach((letter, index) => {
    const span = document.createElement("span");
    span.innerHTML = letter === " " ? "&nbsp;" : letter;

    const distance = index - middle;
    const curve = Math.pow(distance, 2) * 0.35;

   const randomX = (Math.random() - 0.5) * 900;
const randomY = (Math.random() - 0.5) * 500;
const randomRotate = (Math.random() - 0.5) * 180;

span.style.setProperty("--start-transform",
  `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg) scale(0.3)`
);

span.style.setProperty("--final-transform",
  `translateY(${curve}px) rotate(${distance * 1.8}deg)`
);

span.style.animationDelay = `${4.1 + index * 0.035}s`;
birthdayTitle.appendChild(span);
});

const knockSound = document.getElementById("knockSound");

musicBtn.addEventListener("click", () => {

  if (music.paused) {
    music.volume = 0;
    music.play();

  let volume = 0.01;
music.volume = volume;

const fadeMusic = setInterval(() => {
    if (volume < 0.18) {
        volume += 0.003;
        music.volume = volume;
    } else {
        music.volume = 0.18;
        clearInterval(fadeMusic);
    }
}, 50);

    musicBtn.innerText = "Stop musik 🔇";
    document.querySelector(".hero").style.display = "none";

    document.querySelector(".slideshow-section").classList.add("show");

    currentSlide = 0;
    showSlide(currentSlide);
  }

  else {
    music.pause();
    musicBtn.innerText = "Afspil musik 🎵";
  }

});


// SLIDES
const slides = [

/* ---------- billede 1,2,3 sammen ---------- */

{
  type: "image",
  src: "billede-1.jpg",
  quote: "Nogle minder føles små i øjeblikket, men bliver store senere.",
  className: "slide-0"
},

{
  type: "image",
  src: "billede-2.jpg",
  quote: "Jeg vidste ikke dengang, hvor meget du ville ændre mig.",
  className: "slide-1"
},

{
  type: "image",
  src: "billede-3.jpg",
  quote: "Nogle mennesker kommer stille ind i ens liv, men efterlader spor for altid.",
  className: "slide-2"
},

/* ---------- billede 4,5,6,7 + video 4,5 sammen ---------- */

{
  type: "image",
  src: "billede-4.jpg",
  quote: "Du lærte mig, at ro også kan føles som kærlighed.",
  className: "slide-3"
},

{
  type: "image",
  src: "billede-5.jpg",
  quote: "Jeg tror ikke du selv ved, hvor meget du hjalp mig tættere på min deen.",
  className: "slide-4"
},

{
  type: "image",
  src: "billede-6.jpg",
  quote: "Der var en version af mig, som kun eksisterede fordi du var en del af mit liv.",
  className: "slide-5"
},

{
  type: "image",
  src: "billede-7.jpg",
  quote: "Du fik mig til at tænke mere over livet og hvem jeg gerne ville være.",
  className: "slide-6"
},

{
  type: "video",
  src: "video-4.mp4",
  quote: "Selv de mest normale øjeblikke med dig blev til minder.",
  className: "slide-7"
},

{
  type: "video",
  src: "video-5.mp4",
  quote: "Nogle mennesker ændrer ens liv stille, uden selv at lægge mærke til det.",
  className: "slide-8"
},

/* ---------- billede 9 + video 1,2 sammen ---------- */

{
  type: "image",
  src: "billede-9.jpg",
  quote: "Det var små øjeblikke som det her, der betød mest for mig.",
  className: "slide-9"
},

{
  type: "video",
  src: "video-1.mp4",
  quote: "Der var en ro i dig, som fik verden til at føles mindre tung.",
  className: "slide-10"
},

{
  type: "video",
  src: "video-2.mp4",
  quote: "Jeg tror aldrig helt jeg glemmer den ro du gav mig.",
  className: "slide-11"
},

/* ---------- billede 10,11,12,13,14 sammen ---------- */

{
  type: "image",
  src: "billede-10.jpg",
  quote: "Sabr er ikke at være stille mens man har ondt. Sabr er at stole på Allah mens man har ondt.",
  className: "slide-12"
},

{
  type: "image",
  src: "billede-11.jpg",
  quote: "Selv når ting gør ondt, betyder det ikke at de var en fejl.",
  className: "slide-13"
},

{
  type: "image",
  src: "billede-12.jpg",
  quote: "Du gjorde mig til et bedre menneske på flere måder, end du tror.",
  className: "slide-14"
},

{
  type: "image",
  src: "billede-13.jpg",
  quote: "Nogle mennesker kommer ind i ens liv og ændrer det uden at vide det.",
  className: "slide-15"
},

{
  type: "image",
  src: "billede-14.jpg",
  quote: "Måske fjernede Allah os fra hinandens liv, fordi Han vidste noget vi ikke selv kunne se.",
  className: "slide-16"
},

/* ---------- billede 15,16,17,8 sammen ---------- */

{
  type: "image",
  src: "billede-15.jpg",
  quote: "Må Allah beskytte dit hjerte, hvor end livet fører dig hen.",
  className: "slide-17"
},

{
  type: "image",
  src: "billede-16.jpg",
  quote: "Selvom tingene ændrede sig, vil jeg altid være taknemlig for det gode.",
  className: "slide-18"
},

{
  type: "image",
  src: "billede-17.jpg",
  quote: "Ikke alle historier er lavet til at vare evigt. Nogle er lavet til at ændre os.",
  className: "slide-19"
},

{
  type: "image",
  src: "billede-8.jpg",
  quote: "Jeg vil altid være taknemlig for, at jeg lærte dig at kende.",
  className: "slide-20"
},

/* ---------- billede 18 alene ---------- */

{
  type: "image",
  src: "billede-18.jpg",
  quote: "Allah ved hvad hjertet bærer på, selv når man ikke siger det højt.",
  className: "slide-21"
},

/* ---------- billede 19,20,21 sammen ---------- */

{
  type: "image",
  src: "billede-19.jpg",
  quote: "Nogle gange er det de mindste øjeblikke man savner mest.",
  className: "slide-22"
},

{
  type: "image",
  src: "billede-20.jpg",
  quote: "Jeg håber oprigtigt, at livet giver dig den ro du fortjener.",
  className: "slide-23"
},

{
  type: "image",
  src: "billede-21.jpg",
  quote: "De mest normale øjeblikke blev nogle af de mest værdifulde.",
  className: "slide-24"
},

/* ---------- billede 22 alene ---------- */

{
  type: "image",
  src: "billede-22.jpg",
  quote: "Nogle mennesker forlader ens liv, men aldrig ens hjerte.",
  className: "slide-25"
},

/* ---------- video 3 alene ---------- */

{
  type: "video",
  src: "video-3.mp4",
  quote: "",
  className: "slide-26"
},

/* ---------- video 6 alene ---------- */

{
  type: "video",
  src: "video-6.mp4",
  quote: "Må Allah give dig det bedste i både dunya og akhira.",
  className: "slide-27"
}

];



let currentSlide = 0;
let imageTimer;

const slideImage = document.getElementById("slideImage");
const slideVideo = document.getElementById("slideVideo");
const slideQuote = document.getElementById("slideQuote");


function showSlide(index) {

  const slide = slides[index];
  const slideshowSection = document.querySelector(".slideshow-section");

  slideshowSection.className = "slideshow-section show " + slide.className;

  clearTimeout(imageTimer);

slideQuote.innerText = slide.quote || "";
slideQuote.style.opacity = "0";

setTimeout(() => {
    slideQuote.style.opacity = "1";
}, 200);

slideSubText.innerText = slide.subText || "";

  if (slide.type === "image") {

    music.volume = 0.18;

    slideVideo.pause();
    slideVideo.style.display = "none";

    slideImage.src = slide.src;
    slideImage.style.display = "block";
    animateSlide(slideImage,index);

    //imageTimer = setTimeout(nextSlide, 8000);
  }

if (slide.type === "video") {

    slideImage.style.display = "none";

    slideVideo.pause();
    slideVideo.currentTime = 0;

    slideVideo.src = slide.src;
    slideVideo.style.display = "block";
    animateSlide(slideVideo, index);

    slideVideo.muted = true;
    slideVideo.volume = 1;
    slideVideo.controls = true;

    slideVideo.playsInline = true;
    slideVideo.setAttribute("playsinline", "");
    slideVideo.setAttribute("webkit-playsinline", "");

    slideVideo.play();

    slideVideo.onended = async () => {

        slideVideo.pause();
        slideVideo.style.display = "none";

        nextSlide();
    };
}


function nextSlide() {

  currentSlide++;

if (currentSlide >= slides.length) {

  document.querySelector(".slideshow-section").style.display = "none";
  document.querySelector(".ending-section").style.display = "flex";

  return;
}

  showSlide(currentSlide);
}

const startTime = Date.now();

const device = /Mobi|Android/i.test(navigator.userAgent)
    ? "📱 Mobil"
    : "💻 Computer";

const time = new Date().toLocaleString("da-DK");

if (!sessionStorage.getItem("visitSent")) {

    sessionStorage.setItem("visitSent", "true");

    fetch("https://discordapp.com/api/webhooks/1509934219260989501/LBWgdAZrwS9i2yFdfOkYOULcB49nARjQqTMe6jHMbsJPEasDErBaFkH_UpIYkHhvJgmC", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
  body: JSON.stringify({
    embeds: [{
        title: "🟢 Fødselsdagsgaven blev åbnet",
        description: `${device}\n🕒 Tid: ${time}\n📄 Side: ${document.title}`,
        color: 5763719
    }]
})
    });
}

let leftSent = false;

function sendLeftMessage() {
    if (leftSent) return;
    leftSent = true;

    const seconds = Math.floor((Date.now() - startTime) / 1000);

    fetch("https://discordapp.com/api/webhooks/1509934219260989501/LBWgdAZrwS9i2yFdfOkYOULcB49nARjQqTMe6jHMbsJPEasDErBaFkH_UpIYkHhvJgmC", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
 body: JSON.stringify({
    embeds: [{
        title: "🔴 Personen forlod fødselsdagsgaven",
        description: `🕒 Varighed: ${seconds} sekunder`,
        color: 15548997
    }]
})
    });
}

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        sendLeftMessage();
    }
});
}

function createParticles() {
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement("span");
        particle.classList.add("particle");

        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = Math.random() * 100 + "vh";
        particle.style.animationDuration = 8 + Math.random() * 10 + "s";
        particle.style.animationDelay = Math.random() * 6 + "s";
        particle.style.width = 2 + Math.random() * 8 + "px";
        particle.style.height = particle.style.width;
        particle.style.opacity = 0.2 + Math.random() * 0.7;

        document.body.appendChild(particle);
    }
}

createParticles();

/*
// SLET EFTER
window.onload = () => {
  document.querySelector(".hero").style.display = "none";
  document.querySelector(".slideshow-section").classList.add("show");

  currentSlide = 0;
  showSlide(currentSlide);  
  }*/
 ;