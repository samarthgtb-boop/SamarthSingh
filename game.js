import * as THREE from "three";


/* ==========================================
   BASIC SETUP
========================================== */

const canvas = document.getElementById("game-canvas");
const gameContainer = document.querySelector(".game-container");

const speedDisplay = document.getElementById("speed");
const lapDisplay = document.getElementById("lap");

const message = document.getElementById("game-message");
const startButton = document.getElementById("start-button");

const loadingText = document.getElementById("game-loading");
const restartButton = document.getElementById("restart-button");


/* ==========================================
   SCENE
========================================== */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x050505);

scene.fog = new THREE.Fog(
    0x050505,
    80,
    350
);


/* ==========================================
   CAMERA
========================================== */

const camera = new THREE.PerspectiveCamera(
    65,
    1,
    0.1,
    1000
);

camera.position.set(
    0,
    5,
    10
);


/* ==========================================
   RENDERER
========================================== */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


/* ==========================================
   LIGHTING
========================================== */

const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0x222222,
    1.8
);

scene.add(ambientLight);


const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(
    30,
    50,
    20
);

sun.castShadow = true;

scene.add(sun);


/* ==========================================
   ROAD
========================================== */

const roadWidth = 18;
const roadLength = 1000;

const roadGeometry =
    new THREE.PlaneGeometry(
        roadWidth,
        roadLength
    );

const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9
    });

const road =
    new THREE.Mesh(
        roadGeometry,
        roadMaterial
    );

road.rotation.x = -Math.PI / 2;

road.position.y = -0.05;

road.receiveShadow = true;

scene.add(road);


/* ==========================================
   GRASS
========================================== */

const grassGeometry =
    new THREE.PlaneGeometry(
        100,
        roadLength
    );

const grassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x070707
    });

const grass =
    new THREE.Mesh(
        grassGeometry,
        grassMaterial
    );

grass.rotation.x = -Math.PI / 2;

grass.position.y = -0.1;

scene.add(grass);


/* ==========================================
   ROAD MARKINGS
========================================== */

const lineMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x888888
    });


const laneLines = [];

for (
    let z = -roadLength / 2;
    z < roadLength / 2;
    z += 12
) {

    const geometry =
        new THREE.BoxGeometry(
            0.12,
            0.02,
            5
        );

    const line =
        new THREE.Mesh(
            geometry,
            lineMaterial
        );

    line.position.set(
        0,
        0.01,
        z
    );

    scene.add(line);

    laneLines.push(line);
}


/* ==========================================
   ROAD EDGE
========================================== */

const edgeMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x555555
    });


function createRoadEdge(x) {

    const geometry =
        new THREE.BoxGeometry(
            0.25,
            0.08,
            roadLength
        );

    const edge =
        new THREE.Mesh(
            geometry,
            edgeMaterial
        );

    edge.position.set(
        x,
        0.02,
        0
    );

    scene.add(edge);
}

createRoadEdge(-roadWidth / 2);
createRoadEdge(roadWidth / 2);


/* ==========================================
   CAR
========================================== */

const car =
    new THREE.Group();

scene.add(car);

car.position.set(
    0,
    0.65,
    0
);


/* BODY */

const bodyGeometry =
    new THREE.BoxGeometry(
        2.2,
        0.55,
        4
    );

const bodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xd8d8d8,
        metalness: 0.7,
        roughness: 0.25
    });

const body =
    new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

body.castShadow = true;

car.add(body);


/* CABIN */

const cabinGeometry =
    new THREE.BoxGeometry(
        1.55,
        0.55,
        1.7
    );

const cabinMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.5,
        roughness: 0.15
    });

const cabin =
    new THREE.Mesh(
        cabinGeometry,
        cabinMaterial
    );

cabin.position.set(
    0,
    0.5,
    -0.25
);

cabin.castShadow = true;

car.add(cabin);


/* WINDSCREEN */

const windshieldGeometry =
    new THREE.BoxGeometry(
        1.35,
        0.32,
        0.05
    );

const windshieldMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x080808,
        metalness: 0.5,
        roughness: 0.05
    });

const windshield =
    new THREE.Mesh(
        windshieldGeometry,
        windshieldMaterial
    );

windshield.position.set(
    0,
    0.6,
    -1.12
);

windshield.rotation.x =
    -0.2;

car.add(windshield);


/* ==========================================
   WHEELS
========================================== */

const wheelGeometry =
    new THREE.CylinderGeometry(
        0.42,
        0.42,
        0.32,
        16
    );

const wheelMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x080808,
        roughness: 0.8
    });


function createWheel(x, z) {

    const wheel =
        new THREE.Mesh(
            wheelGeometry,
            wheelMaterial
        );

    wheel.rotation.z =
        Math.PI / 2;

    wheel.position.set(
        x,
        -0.15,
        z
    );

    wheel.castShadow = true;

    car.add(wheel);

    return wheel;
}


const wheels = [
    createWheel(-1.15, -1.25),
    createWheel(1.15, -1.25),
    createWheel(-1.15, 1.25),
    createWheel(1.15, 1.25)
];


/* ==========================================
   TREES / ENVIRONMENT
========================================== */

function createTree(x, z) {

    const tree = new THREE.Group();

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.25,
            0.35,
            2.5,
            8
        );

    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x252525
        });

    const trunk =
        new THREE.Mesh(
            trunkGeometry,
            trunkMaterial
        );

    trunk.position.y = 1.25;

    tree.add(trunk);


    const topGeometry =
        new THREE.ConeGeometry(
            1.4,
            3.5,
            8
        );

    const topMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x181818
        });

    const top =
        new THREE.Mesh(
            topGeometry,
            topMaterial
        );

    top.position.y = 3.6;

    tree.add(top);

    tree.position.set(
        x,
        0,
        z
    );

    scene.add(tree);
}


for (
    let z = -450;
    z < 450;
    z += 25
) {

    createTree(
        -22 - Math.random() * 10,
        z
    );

    createTree(
        22 + Math.random() * 10,
        z + 10
    );
}


/* ==========================================
   DISTANT LIGHTS
========================================== */

function createLight(x, z) {

    const geometry =
        new THREE.BoxGeometry(
            0.15,
            2,
            0.15
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xaaaaaa
        });

    const light =
        new THREE.Mesh(
            geometry,
            material
        );

    light.position.set(
        x,
        1,
        z
    );

    scene.add(light);
}


for (
    let z = -450;
    z < 450;
    z += 18
) {

    createLight(-11, z);

    createLight(11, z);
}


/* ==========================================
   GAME STATE
========================================== */

let running = false;

let speed = 0;

let steering = 0;

let distance = 0;

let lap = 1;

let lastTime = performance.now();


const maxSpeed = 1.25;

const acceleration = 0.018;

const braking = 0.035;

const friction = 0.008;


/* ==========================================
   KEYBOARD
========================================== */

const keys = {};


window.addEventListener(
    "keydown",
    (event) => {

        keys[event.key.toLowerCase()] = true;

        if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === " "
        ) {
            event.preventDefault();
        }

        if (
            !running &&
            (
                event.key.toLowerCase() === "w" ||
                event.key === "ArrowUp"
            )
        ) {
            startRace();
        }
    }
);


window.addEventListener(
    "keyup",
    (event) => {

        keys[event.key.toLowerCase()] = false;
    }
);


/* ==========================================
   START
========================================== */

function startRace() {

    running = true;

    message.style.display = "none";

    restartButton.style.display = "block";

    speed = 0;

    distance = 0;

    lap = 1;

    car.position.x = 0;

    car.position.z = 0;
}


/* ==========================================
   RESTART
========================================== */

function restartRace() {

    running = false;

    speed = 0;

    distance = 0;

    lap = 1;

    car.position.x = 0;

    car.position.z = 0;

    car.rotation.y = 0;

    message.style.display = "block";

    restartButton.style.display = "none";

    speedDisplay.textContent = "0";

    lapDisplay.textContent = "1";
}


startButton.addEventListener(
    "click",
    startRace
);

restartButton.addEventListener(
    "click",
    restartRace
);


/* ==========================================
   RESIZE
========================================== */

function resize() {

    const width =
        gameContainer.clientWidth;

    const height =
        gameContainer.clientHeight;

    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
        width,
        height,
        false
    );
}

window.addEventListener(
    "resize",
    resize
);

resize();


/* ==========================================
   GAME UPDATE
========================================== */

function update(delta) {

    if (!running) {
        return;
    }


    /* ACCELERATION */

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        speed += acceleration;

    } else {

        speed -= friction;
    }


    /* BRAKE */

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        speed -= braking;
    }


    speed = THREE.MathUtils.clamp(
        speed,
        0,
        maxSpeed
    );


    /* STEERING */

    steering = 0;

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        steering = -1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        steering = 1;
    }


    const steeringStrength =
        0.07 * (speed / maxSpeed);


    car.position.x +=
        steering *
        steeringStrength *
        delta;


    /* ROAD BOUNDARIES */

    const limit =
        roadWidth / 2 - 1.4;

    car.position.x =
        THREE.MathUtils.clamp(
            car.position.x,
            -limit,
            limit
        );


    /* FORWARD MOVEMENT */

    car.position.z -=
        speed * delta * 0.7;


    distance +=
        speed * delta;


    /* FAKE INFINITE ROAD */

    if (car.position.z < -300) {

        car.position.z += 600;

    }


    /* CAR ROTATION */

    car.rotation.y +=
        (
            steering * 0.04 -
            car.rotation.y * 0.08
        );


    /* WHEEL ROTATION */

    for (const wheel of wheels) {

        wheel.rotation.x -=
            speed * delta * 1.5;
    }


    /* CAMERA */

    const targetCameraX =
        car.position.x * 0.55;

    camera.position.x +=
        (
            targetCameraX -
            camera.position.x
        ) * 0.08;

    camera.position.y = 4.8;

    camera.position.z =
        car.position.z + 10;


    camera.lookAt(
        car.position.x,
        0.7,
        car.position.z - 12
    );


    /* HUD */

    const displaySpeed =
        Math.round(
            (speed / maxSpeed) * 220
        );

    speedDisplay.textContent =
        displaySpeed;


    /* LAPS */

    if (distance > 700) {

        lap = 2;

        lapDisplay.textContent =
            "2";
    }

}


/* ==========================================
   ANIMATION
========================================== */

function animate(time) {

    requestAnimationFrame(animate);

    const delta =
        Math.min(
            time - lastTime,
            40
        );

    lastTime = time;

    update(delta);

    renderer.render(
        scene,
        camera
    );
}


animate(performance.now());


/* ==========================================
   LOADING
========================================== */

let loadProgress = 0;

const loader =
    document.getElementById("loader");

const progress =
    document.getElementById(
        "loader-progress"
    );

const percent =
    document.getElementById(
        "loader-percent"
    );


const loadTimer =
    setInterval(() => {

        loadProgress +=
            Math.floor(
                Math.random() * 8
            ) + 2;

        if (loadProgress >= 100) {

            loadProgress = 100;

            clearInterval(loadTimer);

            setTimeout(() => {

                loader.classList.add(
                    "hidden"
                );

            }, 400);
        }

        progress.style.width =
            loadProgress + "%";

        percent.textContent =
            loadProgress + "%";

    }, 70);


/* ==========================================
   GAME LOADING TEXT
========================================== */

setTimeout(() => {

    loadingText.style.display =
        "none";

}, 1200);


/* ==========================================
   MOBILE MENU
========================================== */

const menuButton =
    document.getElementById(
        "menu-button"
    );

const mobileMenu =
    document.getElementById(
        "mobile-menu"
    );


menuButton.addEventListener(
    "click",
    () => {

        mobileMenu.classList.toggle(
            "active"
        );
    }
);


mobileMenu
    .querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                mobileMenu.classList.remove(
                    "active"
                );
            }
        );
    });
