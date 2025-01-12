// Wait for the DOM content to fully load
document.addEventListener("DOMContentLoaded", () => {
    fetch('load/header.html') // Fetch the header HTML from the server
        .then(response => response.text())
        .then(data => {
            document.querySelector('header').innerHTML = data; // Inject the header content
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
        
        // Add hover effect
        link.addEventListener('mouseenter', (e) => {
            const img = e.currentTarget.querySelector('img');
            img.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        link.addEventListener('mouseleave', (e) => {
            const img = e.currentTarget.querySelector('img');
            img.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        menuToggle.setAttribute('aria-expanded', 
            menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.main-nav')) {
            navMenu.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
});

// Include the 'matter-wrap' plugin
Matter.use('matter-wrap');

// HexBokeh: A customizable background effect using Matter.js
let hexBokeh = {
    // Default options for customization
    options: {
        canvasSelector: '', // CSS selector for the canvas element
        radiusRange: [30, 60], // Random range of hexagon radii
        xVarianceRange: [0.1, 0.3], // X velocity scaling range
        yVarianceRange: [0.5, 1.5], // Y velocity scaling range
        airFriction: 0.03, // Air friction applied to the bodies
        opacity: 0.5, // Opacity of the hexagons
        collisions: false, // Enable or disable collisions
        scrollVelocity: 0.025, // Effect of scroll on body velocities
        pixelsPerBody: 40000, // Pixels in viewport per hexagon
        colors: ['#7ef2cf', '#bea6ff', '#8ccdff'] // Hexagon fill colors
    },

    // Delays for scroll and resize event throttling
    scrollDelay: 100,
    resizeDelay: 400,

    // Variables to track event state
    lastOffset: undefined,
    scrollTimeout: undefined,
    resizeTimeout: undefined,

    // Matter.js components
    engine: undefined,
    render: undefined,
    runner: undefined,
    bodies: undefined,

    // Initialize the effect
    init(options) {
        // Merge provided options with defaults
        this.options = Object.assign({}, this.options, options);

        let viewportWidth = document.documentElement.clientWidth;
        let viewportHeight = document.documentElement.clientHeight;

        this.lastOffset = window.pageYOffset;
        this.scrollTimeout = null;
        this.resizeTimeout = null;

        // Create Matter.js engine
        this.engine = Matter.Engine.create();
        this.engine.world.gravity.y = 0;

        // Create renderer
        this.render = Matter.Render.create({
            canvas: document.querySelector(this.options.canvasSelector),
            engine: this.engine,
            options: {
                width: viewportWidth,
                height: viewportHeight,
                wireframes: false,
                background: 'transparent'
            }
        });
        Matter.Render.run(this.render);

        // Create runner
        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);

        // Create and add bodies to the engine
        this.bodies = [];
        let totalBodies = Math.round(viewportWidth * viewportHeight / this.options.pixelsPerBody);
        for (let i = 0; i <= totalBodies; i++) {
            let body = this.createBody(viewportWidth, viewportHeight);
            this.bodies.push(body);
        }
        Matter.World.add(this.engine.world, this.bodies);

        // Attach event listeners for scroll and resize
        window.addEventListener('scroll', this.onScrollThrottled.bind(this));
        window.addEventListener('resize', this.onResizeThrottled.bind(this));
    },

    // Shutdown and clean up the engine
    shutdown() {
        Matter.Engine.clear(this.engine);
        Matter.Render.stop(this.render);
        Matter.Runner.stop(this.runner);

        window.removeEventListener('scroll', this.onScrollThrottled);
        window.removeEventListener('resize', this.onResizeThrottled);
    },

    // Generate a random number within a range
    randomize(range) {
        let [min, max] = range;
        return Math.random() * (max - min) + min;
    },

    // Create a hexagonal body with random properties
    createBody(viewportWidth, viewportHeight) {
        let x = this.randomize([0, viewportWidth]);
        let y = this.randomize([0, viewportHeight]);
        let radius = this.randomize(this.options.radiusRange);
        let color = this.options.colors[this.bodies.length % this.options.colors.length];

        return Matter.Bodies.polygon(x, y, 6, radius, {
            render: {
                fillStyle: color,
                opacity: this.options.opacity
            },
            frictionAir: this.options.airFriction,
            collisionFilter: {
                group: this.options.collisions ? 1 : -1
            },
            plugin: {
                wrap: {
                    min: { x: 0, y: 0 },
                    max: { x: viewportWidth, y: viewportHeight }
                }
            }
        });
    },

    // Handle scroll events (throttled)
    onScrollThrottled() {
        if (!this.scrollTimeout) {
            this.scrollTimeout = setTimeout(this.onScroll.bind(this), this.scrollDelay);
        }
    },

    // Update body velocities based on scroll movement
    onScroll() {
        this.scrollTimeout = null;

        let delta = (this.lastOffset - window.pageYOffset) * this.options.scrollVelocity;
        this.bodies.forEach((body) => {
            Matter.Body.setVelocity(body, {
                x: body.velocity.x + delta * this.randomize(this.options.xVarianceRange),
                y: body.velocity.y + delta * this.randomize(this.options.yVarianceRange)
            });
        });

        this.lastOffset = window.pageYOffset;
    },

    // Handle resize events (throttled)
    onResizeThrottled() {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(this.onResize.bind(this), this.resizeDelay);
        }
    },

    // Restart the engine with updated dimensions
    onResize() {
        this.shutdown();
        this.init();
    }
};

// Wait for the DOM content to load and initialize HexBokeh
window.addEventListener('DOMContentLoaded', () => {
    Object.create(hexBokeh).init({
        canvasSelector: '#bg1',
        radiusRange: [20, 90],
        colors: [
            'rgba(87, 17, 148, 0.6)',  // Purple
            'rgba(30, 92, 143, 0.6)',  // Blue
            'rgba(231, 223, 105, 0.4)', // Accent
        ],
        pixelsPerBody: 25000,
        scrollVelocity: 0.015,
        airFriction: 0.04,
        opacity: 0.7
    });
});


// Get the text content from the element with ID "type"
var string = document.getElementById("type").textContent;
var array = string.split("");
var timer;

function frameLooper() {
    if (array.length > 0) {
        // Append each character to the element with ID "type"
        document.getElementById("type").innerHTML += array.shift();
    } else {
        // Clear the timer when the string is fully typed
        clearTimeout(timer);
    }
    // Call the function again after the specified delay (70ms in this case)
    timer = setTimeout(frameLooper, 70); // change 70 for speed
}

// Clear the initial text in the "type" element and start the typing effect
document.getElementById("type").innerHTML = "";
frameLooper();
