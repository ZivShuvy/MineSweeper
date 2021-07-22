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