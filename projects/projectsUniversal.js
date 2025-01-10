// Wait for the DOM content to fully load
document.addEventListener("DOMContentLoaded", () => {
	fetch('../header.html') // Fetch the header HTML from the server
		.then(response => response.text())
		.then(data => {
			document.querySelector('header').innerHTML = data; // Inject the header content
		});
});

// Include the 'matter-wrap' plugin
Matter.use('matter-wrap');

// HexBokeh: A customizable background effect using Matter.js
let hexBokeh = {
    // [All the existing hexBokeh code remains exactly the same]
};

// Wait for the DOM content to load and initialize HexBokeh
window.addEventListener('DOMContentLoaded', () => {
    Object.create(hexBokeh).init({
        canvasSelector: '#bg1',
        radiusRange: [15, 80],
        colors: ['#571194', '#660066', '#000000', '#000099', '#193366'],
        pixelsPerBody: 20000,
        scrollVelocity: 0.01,
        airFriction: 0.05,
        opacity: 0.6
    });

    // Type effect
    var string = document.getElementById("type").textContent;
    var array = string.split("");
    var timer;

    function frameLooper() {
        if (array.length > 0) {
            document.getElementById("type").innerHTML += array.shift();
        } else {
            clearTimeout(timer);
        }
        timer = setTimeout(frameLooper, 70);
    }

    document.getElementById("type").innerHTML = "";
    frameLooper();
});
