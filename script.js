const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('lobotomy') && (urlParams.get('lobotomy') === 'true' || urlParams.get('lobotomy') === '' || urlParams.get('lobotomy') === null)) {
    const script = document.createElement('script');
    script.src = 'lobotomy.js';
    document.head.appendChild(script);
    throw new Error('Lobotomy mode enabled. Stopping main script.');
}
var gameCanvas = document.getElementById("gameCanvas");
var ctx = gameCanvas.getContext("2d");
var animationFrame = 0;
var bombAnimationFrame = 0;
var exploded = false;
var won = false;
var bgImage = new Image();
var macamoImage = new Image();
var catImage = new Image();
var bombImage = new Image();
var wallImage = new Image();
var cannonImage = new Image();
var leftArrow = new Image();
var rightArrow = new Image()
var nut = new Image();
var floor = new Image();
var catPosition;
var bombPosition;
var catAnimation = "idle";
var bombAnimation = "idle";
var macamoAnimation = "idle";
// no cannon animation variable since it's always the same as macamo's
var leftArrowAnimation = "idle";
var rightArrowAnimation = "idle";
var nutAnimation = "hit0";
var wallEnabled = false;
var shot = false
var nutX = 900;
var nutY = 1100;
var shootDirection = 1;
var hitSfx = new Audio("assets/sounds/hit.wav");
var boomSfx = new Audio("assets/sounds/explode.wav");
var meowSfx = new Audio("assets/sounds/meow.wav");
var cannonSfx = new Audio("assets/sounds/cannon.wav");
var song = new Audio("assets/sounds/song.wav");
var textureSet = "default";
var textureSets = {
    "default": [

    ],
    "noDither": [
        "cat",
        "macamo"
    ]
};
function init () {
    catPosition = Math.round(Math.random());
    bombPosition = 1-catPosition;
    wallEnabled = (Math.random()*3)>2;
}
init();
setInterval(function() {
    animationFrame += 1;
    bombAnimationFrame += 1;
}, 250);
ctx.imageSmoothingEnabled = false;
gameCanvas.style.imageRendering = "pixelated";
function getImagePath(object, animation, frameCount, animationFrame2) {
    if (!animationFrame2) {
        animationFrame2 = animationFrame
    }
    // Check if the object exists in the current textureSet
    if (
        textureSets[textureSet] &&
        Array.isArray(textureSets[textureSet]) &&
        textureSets[textureSet].includes(object)
    ) {
        return "assets/" + textureSet + "/" + object + "/" + animation + "/" + (animationFrame2 % frameCount).toString() + ".png";
    }
    return "assets/images/" + object + "/" + animation + "/" + (animationFrame2 % frameCount).toString() + ".png";
}
function drawBackground() {
    bgImage.src = getImagePath("world", "bg", 1);
    bgImage.onload = function() {
        ctx.drawImage(bgImage, 0, 0, bgImage.width * 10, bgImage.height * 10);
    };
}
function drawMacamo() {
    macamoImage.src = getImagePath("macamo", macamoAnimation, 2);
    macamoImage.onload = function() {
        ctx.drawImage(macamoImage, 1460, 710, macamoImage.width * 10, macamoImage.height * 10);
    };
}
function drawCat() {
    catImage.src = getImagePath("cat", catAnimation, 2);
    catImage.onload = function() {
        if (catPosition === 0) {
            ctx.drawImage(catImage, 170, 80, catImage.width * 10, catImage.height * 10);
        } else {
            ctx.drawImage(catImage, 1430, 80, catImage.width * 10, catImage.height * 10);
        }
    };
}
function drawBomb() {
    if (exploded) {
        bombImage.src = getImagePath("bomb", bombAnimation, 3, bombAnimationFrame);
    } else {
        bombImage.src = getImagePath("bomb", bombAnimation, 2, bombAnimationFrame);
    }
    bombImage.onload = function() {
        if (bombPosition === 0) {
            ctx.drawImage(bombImage, 170, 80, bombImage.width * 10, bombImage.height * 10);
        } else {
            ctx.drawImage(bombImage, 1430, 80, bombImage.width * 10, bombImage.height * 10);
        }
    };
}
function drawWall() {
    if (wallEnabled) {
        wallImage.src = getImagePath("world", "wall", 1);
        wallImage.onload = function() {
            ctx.drawImage(wallImage, 740, 130, wallImage.width * 10, wallImage.height * 10);
        };
    }
}
function drawCannon() {
    cannonImage.src = getImagePath("cannon", macamoAnimation, 2)
    cannonImage.onload = function() {
        ctx.drawImage(cannonImage, 820, 880, cannonImage.width * 10, cannonImage.height * 10);
    };
}
function drawArrows() {
    leftArrow.src = getImagePath("arrow/left", leftArrowAnimation, 2)
    leftArrow.onload = function() {
        ctx.drawImage(leftArrow, 590, 830, leftArrow.width * 10, leftArrow.height * 10);
    };
    rightArrow.src = getImagePath("arrow/right", rightArrowAnimation, 2)
    rightArrow.onload = function() {
        ctx.drawImage(rightArrow, 1050, 830, rightArrow.width * 10, rightArrow.height * 10);
    };
}
function drawNut() {
    nut.src = getImagePath("nut", nutAnimation, 2)
    nut.onload = function() {
        ctx.drawImage(nut, nutX, nutY, nut.width * 10, nut.height * 10);
    };
}
function drawFloor() {
    floor.src = getImagePath("world", "floor", 1)
    floor.onload = function() {
        ctx.drawImage(floor, 810, 1180, floor.width * 10, floor.height * 10);
    };
}
function gameLoop() {
    drawBackground();
    drawNut();
    drawFloor();
    // Run Macamo, Cat, and Bomb drawing asynchronously
    Promise.all([
        new Promise(resolve => { drawMacamo(); setTimeout(resolve, 0); }),
        new Promise(resolve => { drawCat(); setTimeout(resolve, 0); }),
        new Promise(resolve => {
            if (!(bombAnimationFrame != animationFrame && bombAnimationFrame > 2)) {
                drawBomb();
            }
            setTimeout(resolve, 0);
        })
    ]);
    drawWall();
    drawCannon();
    drawArrows();
    requestAnimationFrame(gameLoop);
    if (!started) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.font = "80px Arial";
        ctx.globalAlpha = 1
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("Please click so audio can play.", gameCanvas.width / 2, gameCanvas.height / 2);
        ctx.restore();
    }
    if (shot) {
        nutY -= 13;
        nutX += 27 * shootDirection;
        if (nutAnimation != "hit2") {
            if (nutX > 1250 || nutX < 520) {
                shootDirection *= -1
                if (nutAnimation == "hit1") {
                    nutAnimation = "hit2"
                }
                if (nutAnimation == "hit0") {
                    nutAnimation = "hit1"
                };
                hitSfx.pause();
                hitSfx.currentTime = 0;
                hitSfx.play();
            }
        } else if (wallEnabled) {
            if (nutX > 740 && nutX < 1030) {
                shootDirection *= -1
                hitSfx.pause();
                hitSfx.currentTime = 0;
                hitSfx.play();
            }
        } 
        if (nutAnimation == "hit2") {
            if (nutX > 1500 || nutX < 190) {
                nutY = -999
                if (nutX < 190) {
                    if (bombPosition == 0 && !exploded) {
                        exploded = true
                        bombAnimation = "explode"
                        catAnimation = "sad"
                        bombAnimationFrame = 0
                        boomSfx.play()
                    }
                    if (bombPosition == 1 && !won) {
                        won = true
                        catAnimation = "happy"
                        meowSfx.play()
                    }
                }
                if (nutX > 1000) {
                    if (bombPosition == 1 && !exploded) {
                        exploded = true
                        bombAnimation = "explode"
                        catAnimation = "sad"
                        bombAnimationFrame = 0
                        boomSfx.play()
                    }
                    if (bombPosition == 0 && !won) {
                        won = true
                        catAnimation = "happy"
                        meowSfx.play()
                    }
                }
            }
        }
    }
}
function handleClick (event) {
    if (started) {
        const rect = gameCanvas.getBoundingClientRect();
        const scaleX = gameCanvas.width / rect.width;
        const scaleY = gameCanvas.height / rect.height;
        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;
        if (canvasX > 590 && canvasX < 850) {
            if (canvasY > 830 && canvasY < 1090) {
                if (!shot) {
                    shootDirection = -1
                    shot = true
                    leftArrowAnimation = "clicked"
                    macamoAnimation = "left"
                    cannonSfx.play()
                }
            }
        }
        if (canvasX > 1050 && canvasX < 1310) {
            if (canvasY > 830 && canvasY < 1090) {
                if (!shot) {
                    shootDirection = 1
                    shot = true
                    rightArrowAnimation = "clicked"
                    macamoAnimation = "right"
                    cannonSfx.play()
                }
            }
        }
    }
}
var started = false;
gameLoop();
function startGameOnce() {
    if (!started) {
        gameCanvas.addEventListener('click', handleClick)
        started = true;
        song.play();
    }
}
gameCanvas.addEventListener('click', startGameOnce, { once: true });
song.addEventListener('ended', function() {
    location.reload();
});
var link = document.createElement('link');
link.rel = 'icon';
link.type = 'image/png';
document.head.appendChild(link);
function updateFavicon() {
    link.href = getImagePath("nut", nutAnimation, 2);
}
setInterval(updateFavicon, 250);
document.getElementById('noDithering').addEventListener('change', function(e) {
    textureSet = e.target.checked ? 'noDither' : 'default';
    document.cookie = "textureSet=" + textureSet + "; path=/";
});

// On page load, set checkbox and textureSet from cookie if present
(function() {
    var matches = document.cookie.match(/(?:^|; )textureSet=([^;]*)/);
    if (matches) {
        textureSet = matches[1];
        document.getElementById('noDithering').checked = (textureSet === 'noDither');
    }
})();
var extrasOpened = false
document.getElementById("extrasOpenClose").addEventListener("click", function() {
    extrasOpened = !extrasOpened
    if (extrasOpened) {
        document.getElementById("extras").style.right = "0"
    } else {
        document.getElementById("extras").style.right = "-31%"
    }
});