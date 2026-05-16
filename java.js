// MUSIC
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const slideSubText = document.getElementById("slideSubText");

musicBtn.addEventListener("click", () => {

  if (music.paused) {
    music.play();
   music.volume = 0.18;
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

  // billede 1,2,3 sammen
  { type: "image", src: "billede-1.jpg", quote: "Nogle minder føles små i øjeblikket, men bliver store senere." },
  { type: "image", src: "billede-2.jpg", quote: "Jeg vidste ikke dengang, hvor meget du ville ændre mig." },
  { type: "image", src: "billede-3.jpg", quote: "What is written for you will reach you, even if it is beneath two mountains." },

  // billede 4,5,6,7,8 + video 4,5 sammen
  { type: "image", src: "billede-4.jpg", quote: "Nogle mennesker bliver en stille del af ens liv uden man opdager hvor meget de betyder." },
  { type: "image", src: "billede-5.jpg", quote: "Du lærte mig, at ro også kan føles som kærlighed." },
  { type: "image", src: "billede-6.jpg", quote: "Jeg tror ikke du selv ved, hvor meget du hjalp mig tættere på min deen." },
  { type: "image", src: "billede-7.jpg", quote: "Der var en version af mig, som kun eksisterede fordi du var en del af mit liv." },
  { type: "image", src: "billede-8.jpg", quote: "I think part of me will always be grateful that I got to know you." },
  { type: "video", src: "video-4.mp4", quote: "Selv de mest normale øjeblikke med dig blev til minder." },
  { type: "video", src: "video-5.mp4", quote: "Nogle mennesker ændrer ens liv stille, uden selv at lægge mærke til det." },

  // billede 9 + video 1,2 sammen
  { type: "image", src: "billede-9.jpg", quote: "Det var små øjeblikke som det her, der betød mest for mig." },
  { type: "video", src: "video-1.mp4", quote: "Du fik mig til at tænke mere over livet og hvem jeg gerne ville være." },
  { type: "video", src: "video-2.mp4", quote: "Jeg tror aldrig helt jeg glemmer den ro du gav mig." },

  // billede 10,11,12,13,14 sammen
  { type: "image", src: "billede-10.jpg", quote: "Sabr is not remaining silent while hurting. Sabr is trusting Allah while hurting." },
  { type: "image", src: "billede-11.jpg", quote: "Selv når ting gør ondt, betyder det ikke at de var en fejl." },
  { type: "image", src: "billede-12.jpg", quote: "Du gjorde mig til et bedre menneske på flere måder, end du tror." },
  { type: "image", src: "billede-13.jpg", quote: "Nogle mennesker kommer ind i ens liv som en test. Andre som en gave." },
  { type: "image", src: "billede-14.jpg", quote: "Maybe Allah removed us from each other’s lives because He knew what we could not see." },

  // billede 15,16,17 sammen
  { type: "image", src: "billede-15.jpg", quote: "May Allah protect your heart wherever life takes you." },
  { type: "image", src: "billede-16.jpg", quote: "Selvom tingene ændrede sig, vil jeg altid være taknemlig for det gode." },
  { type: "image", src: "billede-17.jpg", quote: "Ikke alle historier er lavet til at vare evigt. Nogle er lavet til at ændre os." },

  // billede 18 alene
  { type: "image", src: "billede-18.jpg", quote: "Allah knows what the heart hides." },

  // billede 19,20,21 sammen
  { type: "image", src: "billede-19.jpg", quote: "Nogle gange er det de mindste øjeblikke man savner mest." },
  { type: "image", src: "billede-20.jpg", quote: "Jeg håber oprigtigt livet behandler dig godt." },
  { type: "image", src: "billede-21.jpg", quote: "De mest normale øjeblikke blev nogle af de mest værdifulde." },

  // billede 22 alene
  { type: "image", src: "billede-22.jpg", quote: "Du behøver ikke svare på noget af det her." },

  // video 3 alene
  { type: "video", src: "video-3.mp4", quote: "" },

  // video 6 alene
  { type: "video", src: "video-6.mp4", quote: "Må Allah give dig det bedste i både dunya og akhira." }

];



let currentSlide = 0;
let imageTimer;

const slideImage = document.getElementById("slideImage");
const slideVideo = document.getElementById("slideVideo");
const slideQuote = document.getElementById("slideQuote");


function showSlide(index) {

  const slide = slides[index];

  clearTimeout(imageTimer);

  slideQuote.innerText = slide.quote || "";
  slideSubText.innerText = slide.subText || "";

  if (slide.type === "image") {

    music.volume = 0.18;

    slideVideo.pause();
    slideVideo.style.display = "none";

    slideImage.src = slide.src;
    slideImage.style.display = "block";

    imageTimer = setTimeout(nextSlide, 5000);
  }

if (slide.type === "video") {

    slideImage.style.display = "none";

    slideVideo.pause();
    slideVideo.currentTime = 0;

    slideVideo.src = slide.src;
    slideVideo.style.display = "block";

    music.volume = 0.05;

    slideVideo.muted = false;
    slideVideo.controls = true;

    slideVideo.playsInline = true;
    slideVideo.setAttribute("playsinline", "");
    slideVideo.setAttribute("webkit-playsinline", "");

    slideVideo.play();

    slideVideo.onended = () => {

        music.volume = 0.18;

        slideVideo.pause();
        slideVideo.style.display = "none";

        nextSlide();
    };
}
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