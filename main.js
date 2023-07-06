let world = document.querySelector("#container");
let c = world.getContext("2d");

world.width = world.clientWidth;
world.height = world.clientHeight;

const CANVAS_WIDTH = world.width;
const CANVAS_HEIGHT = world.height;
let gameSpeed = 2;

const backgroundLayer1 = new Image();
backgroundLayer1.src = "img/ville.png";
const backgroundLayer2 = new Image();
backgroundLayer2.src = "img/ville.png";
const backgroundLayer3 = new Image();
backgroundLayer3.src = "img/ville.png";
const backgroundLayer4 = new Image();
backgroundLayer4.src = "img/ville.png";

const backgroundLayer6 = new Image();
backgroundLayer6.src = "img/banc.png";

const skaterImage1 = new Image();
skaterImage1.src = "img/skater1.png";
const skaterImage2 = new Image();
skaterImage2.src = "img/skater2.png";
const skaterImage3 = new Image();
skaterImage3.src = "img/skater3.png";

const bancPositions = Array.from(
  { length: 10 },
  (_, i) => (i * CANVAS_WIDTH) / 10
);


const skateRouleSound = new Audio('skateRoule.mp3');
skateRouleSound.loop = true; // Activer la lecture en boucle pour le son de roulement

const crashSound = new Audio('crash.mp3');

class Layer {
  constructor(image, speedModifier) {
    this.x = 0;
    this.y = 0;
    this.width = 2580;
    this.height = 750;
    this.x2 = this.width;
    this.image = image;
    this.speedModifier = speedModifier;
    this.speed = gameSpeed * this.speedModifier;
  }

  update() {
    this.speed = gameSpeed * this.speedModifier;
    if (this.x <= -this.width) {
      this.x = this.width + this.x2 - this.speed;
    }
    if (this.x2 <= -this.width) {
      this.x2 = this.width + this.x - this.speed;
    }
    this.x = Math.floor(this.x - this.speed);
    this.x2 = Math.floor(this.x2 - this.speed);
  }

  drawImage() {
    c.drawImage(this.image, this.x, this.y, this.width, this.height);
    c.drawImage(this.image, this.x2, this.y, this.width, this.height);
  }
}

class BancLayer {
  static activeBancs = []; // Ajout d'une propriété de classe pour stocker les bancs actifs

  constructor(image, speedModifier, x, y) {
    this.x = x;
    this.y = y;
    this.width = 160;
    this.height = 100;
    this.image = image;
    this.speedModifier = speedModifier;
    this.speed = gameSpeed * this.speedModifier;
    BancLayer.activeBancs.push(this); // Ajout de chaque nouvelle instance à la liste des bancs actifs
  }

  update() {
    this.speed = gameSpeed * this.speedModifier;
    if (this.x + this.width < 0) {
      const index = BancLayer.activeBancs.indexOf(this);
      if (index > -1) {
        BancLayer.activeBancs.splice(index, 1); // Supprimer les bancs qui ne sont plus visibles de la liste des bancs actifs
      }
    } else {
      this.x = Math.floor(this.x - this.speed);
    }
  }

  drawImage() {
   c.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

const layer4 = new Layer(backgroundLayer4, 5);

const gameFond = [layer4];

class Player {
  constructor() {
    this.width = 100;
    this.height = 150;
    this.jumpWidth = 130; // Largeur de l'image du skateur en saut
    this.jumpHeight = 100; // Hauteur de l'image du skateur en saut
    this.position = {
      x: (world.width - this.width) / 40,
      y: world.height - this.height - 60,
    };
    this.isJumping = false;
    this.jumpHeight = 100;
    this.jumpDuration = 500;
    this.jumpStartTime = 0;
    this.velocityY = 0;
    this.gravity = 0.40;

    this.skateJumpSound = new Audio('skateJump.mp3');
    this.skateRetombeSound = new Audio('skateRetombe.mp3');
    this.image = skaterImage1; // Image initiale du joueur
  }

  render() {
    if (this.isJumping) {
      c.drawImage(this.image, this.position.x, this.position.y, this.jumpWidth, this.jumpHeight);
    } else {
      c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
  }

  update() {
    if (this.isJumping) {
      this.velocityY += this.gravity;
      this.position.y += this.velocityY;

      if (this.position.y >= world.height - this.height - 60) {
        this.position.y = world.height - this.height - 60;
        this.velocityY = 0;
        this.isJumping = false;
        this.skateRetombeSound.play();
        skateRouleSound.play();
      }
    } else {
      skateRouleSound.play();

      // Vérifier la collision avec les bancs actifs
      const playerRect = {
        x: this.position.x,
        y: this.position.y,
        width: this.width,
        height: this.height,
      };

      BancLayer.activeBancs.forEach((banc) => {
        const bancRect = {
          x: banc.x,
          y: banc.y,
          width: banc.width,
          height: banc.height,
        };

        if (checkCollision(playerRect, bancRect)) {
          // Collision détectée entre le joueur et un banc
          this.image = skaterImage3; // Changer l'image du joueur à "joueur3.png"
          skateRouleSound.pause(); // Mettre en pause le son de roulement
          crashSound.play(); // Jouer le son de crash
          console.log("Collision avec un banc !");
        }
      });
    }

    this.render();
  }

  jump() {
    if (!this.isJumping) {
      skateRouleSound.pause();
      this.skateJumpSound.play();
      this.isJumping = true;
      this.velocityY = -12;
      this.jumpStartTime = Date.now();
    }
  }
}

const player = new Player();

document.addEventListener('keydown', (event) => {
  if (event.keyCode === 32) {
    player.jump();
  }
});


const genererObjet = () => {
  let xPosition;
  let overlaps;
  const safetyMargin = 350; // Ajuster en fonction de la distance minimale souhaitée entre les bancs

  do {
    overlaps = false;
    xPosition = Math.random() * CANVAS_WIDTH;

    BancLayer.activeBancs.forEach((banc) => {
      // Vérifier si la position x générée est trop proche d'un banc existant
      if (Math.abs(banc.x - xPosition) < banc.width + safetyMargin) {
        overlaps = true;
      }
    });
  } while (overlaps); // Si la position x générée se superpose à un banc existant, générer une nouvelle position

  const banc = new BancLayer(
    backgroundLayer6,
    5,
    xPosition,
    CANVAS_HEIGHT - 150
  );
  gameFond.push(banc);
};

// Appeler la fonction pour générer les bancs initiaux
for (let i = 0; i < 3; i++) {
  genererObjet();
}

var tempsAleatoire = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
setInterval(genererObjet, tempsAleatoire);

function checkCollision(rect1, rect2) {
  if (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  ) {
    // Collision détectée
    return true;
  }
  return false;
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  c.clearRect(0, 0, world.width, world.height);
  gameFond.forEach((obj) => {
    obj.update();
    obj.drawImage();
  });
  player.update();
}

animationLoop();
