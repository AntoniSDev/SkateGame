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
const backgroundLayer5 = new Image();
backgroundLayer5.src = "";

const skaterImage = new Image();
skaterImage.src = "img/skater.png";



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

const layer4 = new Layer(backgroundLayer4, 0.1);
const layer5 = new Layer(backgroundLayer5, 0.5);



const gameFond = [layer4, layer5];

class Player {
  constructor() {
    this.width = 80;
    this.height = 80;
    this.position = {
      x: (world.width - this.width) / 10,
      y: world.height - this.height - 60,
    };
    this.isJumping = false;
    this.jumpHeight = 100;
    this.jumpDuration = 500;
    this.jumpStartTime = 0;
    this.velocityY = 0;
    this.gravity = 0.5;

    // Création des objets audio
    this.skateJumpSound = new Audio('skateJump.mp3');
    this.skateRetombeSound = new Audio('skateRetombe.mp3');
    this.skateRouleSound = new Audio('skateRoule.mp3');
    this.skateRouleSound.loop = true; // Activer la lecture en boucle pour le son de roulement
  }

  render() {
    c.drawImage(skaterImage, this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    
    if (this.isJumping)if (this.isJumping) {
      // Ajout de la gravité pour donner une impression de réalisme
      this.velocityY += this.gravity;
      this.position.y += this.velocityY;

      // Vérification de la collision avec le sol
      if (this.position.y >= world.height - this.height - 60) {
        this.position.y = world.height - this.height - 60;
        this.velocityY = 0;
        this.isJumping = false;

        // Jouer le son de retombée et reprendre la lecture du son de roulement
        this.skateRetombeSound.play();
        this.skateRouleSound.play();
      }
    } else {
      // Si le joueur n'est pas en train de sauter, jouer le son de roulement en boucle
      if (this.skateRouleSound.paused) {
        this.skateRouleSound.play();
      }
    }
    this.render();
  }

  jump() {
    if (!this.isJumping) {
      // Arrêter la lecture du son de roulement et jouer le son de saut
      this.skateRouleSound.pause();
      this.skateJumpSound.play();

      // Démarrer le saut
      this.isJumping = true;
      this.velocityY = -12;
      this.jumpStartTime = Date.now();
    }
  }
}

const player = new Player();

// Gestionnaire d'événements pour la touche Espace
document.addEventListener('keydown', (event) => {
  if (event.keyCode === 32) {
    player.jump();
  }
});

// Boucle d'animation
function animationLoop() {
  requestAnimationFrame(animationLoop);
  c.clearRect(0, 0, world.width, world.height);
  gameFond.forEach(obj => {
    obj.update();
    obj.drawImage();
  });
  player.update();
}
animationLoop();
