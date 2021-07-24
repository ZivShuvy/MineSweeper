'use strict';

function init() {
    document.body.style.backgroundImage = 'url(img/homepage.jpg)';
}

function onReject() {
    var elTransBox = document.querySelector('.trans-box');
    elTransBox.style.display = 'none';
    var elH1 = document.querySelector('h1');
    elH1.style.display = 'none';
    var elRejected = document.querySelector('.rejected');
    elRejected.style.display = 'block';
}

function onAccept() {
    var openCaveSound = new Audio('sound/opencave.mp3');
    openCaveSound.volume = 0.3;
    openCaveSound.play();
    
    var elTransBoxes = document.querySelectorAll('.fade');
    elTransBoxes[0].style.transition = 'opacity 3s';
    elTransBoxes[0].style.opacity = 0;
    elTransBoxes[1].style.transition = 'opacity 3s';
    elTransBoxes[1].style.opacity = 0;
    elTransBoxes[2].style.transition = 'opacity 3s';
    elTransBoxes[2].style.opacity = 0;

    document.body.style.transition = 'background 4s'
    document.body.style.backgroundImage = 'url(img/gamepage.png)';
    setTimeout(function () {
        window.location.href = 'game.html';
    }, 3000)
}