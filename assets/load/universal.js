// Wait for the DOM content to fully load
document.addEventListener("DOMContentLoaded", () => {
    fetch('load/header.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('header').innerHTML = data;
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
        
        link.addEventListener('mouseenter', (e) => {
            const img = e.currentTarget.querySelector('img');
            img.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        link.addEventListener('mouseleave', (e) => {
            const img = e.currentTarget.querySelector('img');
            img.style.transform = 'scale(1) rotate(0deg)';
        });
    });
});

Matter.use('matter-wrap');

let hexBokeh = {
    options: {
        canvasSelector: '',
        radiusRange: [30, 60],
        xVarianceRange: [0.1, 0.3],
        yVarianceRange: [0.5, 1.5],
        airFriction: 0.03,
        opacity: 0.5,
        collisions: false,
        scrollVelocity: 0.025,
        pixelsPerBody: 40000,
        colors: ['#7ef2cf', '#bea6ff', '#8ccdff']
    },

    scrollDelay: 100,
    resizeDelay: 400,
    lastOffset: undefined,
    scrollTimeout: undefined,
    resizeTimeout: undefined,
    engine: undefined,
    render: undefined,
    runner: undefined,
    bodies: undefined,

    init(options) {
        this.options = Object.assign({}, this.options, options);

        let viewportWidth = document.documentElement.clientWidth;
        let documentHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );

        this.lastOffset = window.pageYOffset;
        this.scrollTimeout = null;
        this.resizeTimeout = null;

        this.engine = Matter.Engine.create();
        this.engine.world.gravity.y = 0;

        this.render = Matter.Render.create({
            canvas: document.querySelector(this.options.canvasSelector),
            engine: this.engine,
            options: {
                width: viewportWidth,
                height: documentHeight,
                wireframes: false,
                background: 'transparent'
            }
        });
        Matter.Render.run(this.render);

        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);

        this.bodies = [];
        let totalBodies = Math.round(viewportWidth * documentHeight / this.options.pixelsPerBody);
        
        for (let i = 0; i <= totalBodies; i++) {
            let body = this.createBody(viewportWidth, documentHeight);
            this.bodies.push(body);
        }
        Matter.World.add(this.engine.world, this.bodies);

        window.addEventListener('scroll', this.onScrollThrottled.bind(this));
        window.addEventListener('resize', this.onResizeThrottled.bind(this));
    },

    shutdown() {
        Matter.Engine.clear(this.engine);
        Matter.Render.stop(this.render);
        Matter.Runner.stop(this.runner);

        window.removeEventListener('scroll', this.onScrollThrottled);
        window.removeEventListener('resize', this.onResizeThrottled);
    },

    randomize(range) {
        let [min, max] = range;
        return Math.random() * (max - min) + min;
    },

    createBody(viewportWidth, documentHeight) {
        let x = this.randomize([0, viewportWidth]);
        let y = this.randomize([0, documentHeight]);
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
                    max: { x: viewportWidth, y: documentHeight }
                }
            }
        });
    },

    onScrollThrottled() {
        if (!this.scrollTimeout) {
            this.scrollTimeout = setTimeout(this.onScroll.bind(this), this.scrollDelay);
        }
    },

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

    onResizeThrottled() {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(this.onResize.bind(this), this.resizeDelay);
        }
    },

    onResize() {
        this.shutdown();
        this.init(this.options);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    Object.create(hexBokeh).init({
        canvasSelector: '#bg1',
        radiusRange: [20, 90],
        colors: [
            'rgba(87, 17, 148, 0.6)',
            'rgba(30, 92, 143, 0.6)',
            'rgba(231, 223, 105, 0.4)',
        ],
        pixelsPerBody: 25000,
        scrollVelocity: 0.015,
        airFriction: 0.04,
        opacity: 0.7
    });
});

// Typing effect
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
