import * as THREE from "three";


/* =========================================================
   PIXEL RUSH — PIXEL RACER
   Open-world driving prototype
========================================================= */


/* ================= DOM ================= */

const canvas = document.getElementById("game-canvas");

const loader = document.getElementById("loader");
const loaderProgress = document.getElementById("loader-progress");

const startScreen = document.getElementById("start-screen");
const settingsPanel = document.getElementById("settings-panel");
const pauseScreen = document.getElementById("pause-screen");

const playButton = document.getElementById("play-button");
const settingsButton = document.getElementById("settings-button");
const closeSettings = document.getElementById("close-settings");

const pauseButton = document.getElementById("pause-button");
const resumeButton = document.getElementById("resume-button");
const restartButton = document.getElementById("restart-button");

const speedDisplay = document.getElementById("speed");
const compassDisplay = document.getElementById("compass");

const touchToggle = document.getElementById("touch-toggle");
const trafficToggle = document.getElementById("traffic-toggle");

const hud = document.getElementById("hud");
const touchControls = document.getElementById("touch-controls");


/* ================= STATE ================= */

let gameStarted = false;
let gamePaused = false;

let trafficEnabled = true;
let touchEnabled = false;


/* ================= THREE ================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87a9c4);

scene.fog = new THREE.Fog(
    0x87a9c4,
    100,
    850
);


const camera = new THREE.PerspectiveCamera(
    65,
    1,
    0.1,
    2000
);

camera.position.set(
    0,
    7,
    13
);


const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


/* ================= LIGHTING ================= */

const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0x35553a,
    1.8
);

scene.add(ambientLight);


const sun = new THREE.DirectionalLight(
    0xffffff,
    2.4
);

sun.position.set(
    100,
    150,
    80
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -200;
sun.shadow.camera.right = 200;
sun.shadow.camera.top = 200;
sun.shadow.camera.bottom = -200;

scene.add(sun);


/* =========================================================
   WORLD
========================================================= */

const world = new THREE.Group();

scene.add(world);


/* ================= GROUND ================= */

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3e7145,
    roughness: 1
});

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2200, 2200),
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

world.add(ground);


/* ================= ROAD MATERIAL ================= */

const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x292c30,
    roughness: 0.95
});


/* ================= ROADS ================= */

const roadGroup = new THREE.Group();

world.add(roadGroup);


function createRoad(x, z, width, length, rotation = 0) {

    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(width, length),
        roadMaterial
    );

    road.rotation.x = -Math.PI / 2;
    road.rotation.z = rotation;

    road.position.set(x, 0.025, z);

    road.receiveShadow = true;

    roadGroup.add(road);


    /* lane markings */

    const markingMaterial = new THREE.MeshBasicMaterial({
        color: 0xe4e4c8
    });

    const lineSpacing = 16;

    for (
        let i = -length / 2 + 10;
        i < length / 2;
        i += lineSpacing
    ) {

        const line = new THREE.Mesh(
            new THREE.PlaneGeometry(0.25, 6),
            markingMaterial
        );

        line.rotation.x = -Math.PI / 2;

        line.position.set(
            x,
            0.04,
            z + i
        );

        line.rotation.z = rotation;

        roadGroup.add(line);
    }


    /* road edges */

    const edgeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

    for (const offset of [-width / 2 + 0.4, width / 2 - 0.4]) {

        const edge = new THREE.Mesh(
            new THREE.PlaneGeometry(0.18, length),
            edgeMaterial
        );

        edge.rotation.x = -Math.PI / 2;

        edge.position.set(
            x + offset,
            0.045,
            z
        );

        edge.rotation.z = rotation;

        roadGroup.add(edge);
    }
}


/* Main city streets */

createRoad(0, 0, 18, 900);
createRoad(140, 0, 18, 900);
createRoad(-140, 0, 18, 900);

createRoad(0, 0, 18, 900, Math.PI / 2);
createRoad(0, 140, 18, 900, Math.PI / 2);
createRoad(0, -140, 18, 900, Math.PI / 2);


/* ================= BUILDINGS ================= */

const buildingMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x242832 }),
    new THREE.MeshStandardMaterial({ color: 0x383b45 }),
    new THREE.MeshStandardMaterial({ color: 0x444957 }),
    new THREE.MeshStandardMaterial({ color: 0x303b42 }),
    new THREE.MeshStandardMaterial({ color: 0x4c3f4d })
];


function createBuilding(x, z, width, depth, height) {

    const material =
        buildingMaterials[
            Math.floor(Math.random() * buildingMaterials.length)
        ];

    const building = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            height,
            depth
        ),
        material
    );

    building.position.set(
        x,
        height / 2,
        z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    world.add(building);


    /* rooftop */

    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(
            width * 0.88,
            0.5,
            depth * 0.88
        ),
        new THREE.MeshStandardMaterial({
            color: 0x15171c
        })
    );

    roof.position.set(
        x,
        height + 0.25,
        z
    );

    roof.castShadow = true;

    world.add(roof);
}


/* City blocks */

for (let x = -400; x <= 400; x += 70) {

    for (let z = -400; z <= 400; z += 70) {

        /* Leave roads clear */

        const nearVerticalRoad =
            Math.abs(x) < 20 ||
            Math.abs(x - 140) < 20 ||
            Math.abs(x + 140) < 20;

        const nearHorizontalRoad =
            Math.abs(z) < 20 ||
            Math.abs(z - 140) < 20 ||
            Math.abs(z + 140) < 20;

        if (nearVerticalRoad || nearHorizontalRoad) {
            continue;
        }

        const offsetX =
            x + (Math.random() - 0.5) * 35;

        const offsetZ =
            z + (Math.random() - 0.5) * 35;

        const width =
            22 + Math.random() * 20;

        const depth =
            22 + Math.random() * 20;

        const height =
            12 + Math.random() * 60;

        createBuilding(
            offsetX,
            offsetZ,
            width,
            depth,
            height
        );
    }
}


/* ================= TREES ================= */

function createTree(x, z) {

    const tree = new THREE.Group();


    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.6,
            0.8,
            5,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x60432e
        })
    );

    trunk.position.y = 2.5;

    tree.add(trunk);


    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(
            3.8,
            9,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x1c713d
        })
    );

    leaves.position.y = 8;

    tree.add(leaves);


    tree.position.set(x, 0, z);

    trunk.castShadow = true;
    leaves.castShadow = true;

    world.add(tree);
}


for (let i = 0; i < 150; i++) {

    const x =
        (Math.random() - 0.5) * 850;

    const z =
        (Math.random() - 0.5) * 850;

    const nearRoad =
        Math.abs(x % 140) < 16 ||
        Math.abs(z % 140) < 16;

    if (!nearRoad) {
        createTree(x, z);
    }
}


/* =========================================================
   PLAYER CAR
========================================================= */

const car = new THREE.Group();

car.position.set(
    0,
    0.7,
    70
);

world.add(car);


/* ================= CAR BODY ================= */

const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xc51f35,
    metalness: 0.65,
    roughness: 0.28
});


const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x111318,
    metalness: 0.5,
    roughness: 0.25
});


const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x172d3c,
    metalness: 0.4,
    roughness: 0.12,
    transparent: true,
    opacity: 0.78
});


/* Main lower body */

const lowerBody = new THREE.Mesh(
    new THREE.BoxGeometry(
        3.5,
        0.75,
        7.2
    ),
    bodyMaterial
);

lowerBody.position.y = 0.75;

lowerBody.castShadow = true;

car.add(lowerBody);


/* Hood */

const hood = new THREE.Mesh(
    new THREE.BoxGeometry(
        3.25,
        0.35,
        2.2
    ),
    bodyMaterial
);

hood.position.set(
    0,
    1.15,
    -2.25
);

hood.castShadow = true;

car.add(hood);


/* Cabin */

const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.85,
        1.05,
        3
    ),
    darkMaterial
);

cabin.position.set(
    0,
    1.65,
    0.25
);

cabin.castShadow = true;

car.add(cabin);


/* Windshield */

const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.7,
        0.7,
        0.1
    ),
    glassMaterial
);

windshield.position.set(
    0,
    1.72,
    -1.28
);

windshield.rotation.x = -0.28;

car.add(windshield);


/* Rear glass */

const rearGlass = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.7,
        0.7,
        0.1
    ),
    glassMaterial
);

rearGlass.position.set(
    0,
    1.72,
    1.75
);

rearGlass.rotation.x = 0.28;

car.add(rearGlass);


/* Roof */

const roof = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.75,
        0.18,
        2.7
    ),
    bodyMaterial
);

roof.position.set(
    0,
    2.18,
    0.25
);

car.add(roof);


/* Pop-up headlight styling */

function createHeadlight(x) {

    const headlight = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.75,
            0.12,
            0.35
        ),
        new THREE.MeshStandardMaterial({
            color: 0xffffdd,
            emissive: 0xffffaa,
            emissiveIntensity: 2
        })
    );

    headlight.position.set(
        x,
        1.22,
        -3.42
    );

    car.add(headlight);
}

createHeadlight(-1.05);
createHeadlight(1.05);


/* Tail lights */

function createTailLight(x) {

    const light = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.15,
            0.15,
            0.12
        ),
        new THREE.MeshStandardMaterial({
            color: 0xff1111,
            emissive: 0xff0000,
            emissiveIntensity: 1.7
        })
    );

    light.position.set(
        x,
        1.15,
        3.62
    );

    car.add(light);
}

createTailLight(-1);
createTailLight(1);


/* Spoiler */

const spoilerBar = new THREE.Mesh(
    new THREE.BoxGeometry(
        3.3,
        0.16,
        0.25
    ),
    darkMaterial
);

spoilerBar.position.set(
    0,
    2.0,
    3.55
);

car.add(spoilerBar);


for (const x of [-1.15, 1.15]) {

    const support = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.13,
            0.7,
            0.13
        ),
        darkMaterial
    );

    support.position.set(
        x,
        1.7,
        3.35
    );

    car.add(support);
}


/* ================= WHEELS ================= */

const wheels = [];

function createWheel(x, z) {

    const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.68,
            0.68,
            0.42,
            20
        ),
        new THREE.MeshStandardMaterial({
            color: 0x080808,
            roughness: 0.8
        })
    );

    wheel.rotation.z = Math.PI / 2;

    wheel.position.set(
        x,
        0.55,
        z
    );

    wheel.castShadow = true;

    car.add(wheel);

    wheels.push(wheel);
}

createWheel(-1.85, -2.25);
createWheel(1.85, -2.25);
createWheel(-1.85, 2.25);
createWheel(1.85, 2.25);


/* ================= PLAYER PHYSICS ================= */

let velocity = 0;

let steering = 0;

const maxSpeed = 1.65;
const reverseSpeed = -0.65;

const acceleration = 0.025;
const braking = 0.075;

const naturalDrag = 0.008;

const steeringStrength = 0.035;


/* ================= INPUT ================= */

const keys = {};

window.addEventListener("keydown", event => {

    keys[event.key.toLowerCase()] = true;

    if (event.code === "Space") {
        keys.space = true;
        event.preventDefault();
    }

    if (event.key.toLowerCase() === "r") {
        resetCar();
    }

    if (event.key === "Escape" && gameStarted) {
        togglePause();
    }
});


window.addEventListener("keyup", event => {

    keys[event.key.toLowerCase()] = false;

    if (event.code === "Space") {
        keys.space = false;
    }
});


/* ================= TOUCH INPUT ================= */

document.querySelectorAll(
    "[data-control]"
).forEach(button => {

    const control = button.dataset.control;

    const start = event => {

        event.preventDefault();

        keys[control] = true;
    };

    const end = event => {

        event.preventDefault();

        keys[control] = false;
    };

    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", end);
    button.addEventListener("pointercancel", end);
    button.addEventListener("pointerleave", end);
});


/* ================= TRAFFIC ================= */

const trafficCars = [];

const trafficColors = [
    0x2563eb,
    0xf5f5f5,
    0xf59e0b,
    0x22c55e,
    0x9333ea,
    0xef4444,
    0x111111
];


function createTrafficCar(x, z, direction = 1) {

    const traffic = new THREE.Group();

    traffic.position.set(
        x,
        0.65,
        z
    );

    traffic.userData.direction = direction;

    const color =
        trafficColors[
            Math.floor(
                Math.random() * trafficColors.length
            )
        ];


    const material =
        new THREE.MeshStandardMaterial({
            color,
            metalness: 0.5,
            roughness: 0.3
        });


    const body = new THREE.Mesh(
        new THREE.BoxGeometry(
            2.8,
            0.7,
            5.2
        ),
        material
    );

    body.position.y = 0.7;

    body.castShadow = true;

    traffic.add(body);


    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(
            2.25,
            0.9,
            2.2
        ),
        darkMaterial
    );

    cabin.position.set(
        0,
        1.35,
        0.1
    );

    cabin.castShadow = true;

    traffic.add(cabin);


    const wheelsLocal = [];

    for (const wheelX of [-1.5, 1.5]) {

        for (const wheelZ of [-1.5, 1.5]) {

            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.5,
                    0.5,
                    0.3,
                    12
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x050505
                })
            );

            wheel.rotation.z =
                Math.PI / 2;

            wheel.position.set(
                wheelX,
                0.5,
                wheelZ
            );

            traffic.add(wheel);

            wheelsLocal.push(wheel);
        }
    }


    world.add(traffic);

    trafficCars.push(traffic);
}


/* Traffic on the major streets */

for (let i = 0; i < 18; i++) {

    const roadIndex =
        Math.floor(Math.random() * 3);

    const roadX =
        [-140, 0, 140][roadIndex];

    const z =
        (Math.random() - 0.5) * 700;

    createTrafficCar(
        roadX + (Math.random() > 0.5 ? 4 : -4),
        z,
        Math.random() > 0.5 ? 1 : -1
    );
}


/* ================= COLLISION ================= */

function checkTrafficCollision() {

    for (const traffic of trafficCars) {

        const dx =
            car.position.x -
            traffic.position.x;

        const dz =
            car.position.z -
            traffic.position.z;

        const distance =
            Math.sqrt(dx * dx + dz * dz);

        if (distance < 4.1) {

            velocity *= -0.25;

            car.position.x +=
                dx * 0.15;

            car.position.z +=
                dz * 0.15;
        }
    }
}


/* ================= RESET ================= */

function resetCar() {

    car.position.set(
        0,
        0.7,
        70
    );

    car.rotation.y = 0;

    velocity = 0;

    steering = 0;
}


/* ================= DRIVING ================= */

function updateCar() {

    if (!gameStarted || gamePaused) {
        return;
    }


    const accelerate =
        keys.w ||
        keys.arrowup ||
        keys.accelerate;

    const reverse =
        keys.s ||
        keys.arrowdown;

    const brake =
        keys.space ||
        keys.brake;


    /* Acceleration */

    if (accelerate) {

        velocity += acceleration;

        if (velocity > maxSpeed) {
            velocity = maxSpeed;
        }
    }


    /* Reverse */

    if (reverse) {

        velocity -= acceleration * 0.75;

        if (velocity < reverseSpeed) {
            velocity = reverseSpeed;
        }
    }


    /* Brake */

    if (brake) {

        if (velocity > 0) {
            velocity -= braking;
        }

        if (velocity < 0) {
            velocity += braking;
        }

        if (Math.abs(velocity) < 0.03) {
            velocity = 0;
        }
    }


    /* Natural drag */

    if (
        !accelerate &&
        !reverse &&
        !brake
    ) {

        if (velocity > 0) {
            velocity -= naturalDrag;
        }

        if (velocity < 0) {
            velocity += naturalDrag;
        }

        if (Math.abs(velocity) < 0.01) {
            velocity = 0;
        }
    }


    /* Steering */

    let steeringInput = 0;

    if (
        keys.a ||
        keys.arrowleft ||
        keys.left
    ) {
        steeringInput -= 1;
    }

    if (
        keys.d ||
        keys.arrowright ||
        keys.right
    ) {
        steeringInput += 1;
    }


    steering = THREE.MathUtils.lerp(
        steering,
        steeringInput,
        0.15
    );


    /* Cars steer more effectively while moving */

    const speedFactor =
        Math.min(Math.abs(velocity) / maxSpeed, 1);


    car.rotation.y -=
        steering *
        steeringStrength *
        speedFactor *
        (velocity >= 0 ? 1 : -1);


    /* Move */

    const forward = new THREE.Vector3(
        0,
        0,
        -1
    );

    forward.applyQuaternion(
        car.quaternion
    );

    car.position.addScaledVector(
        forward,
        velocity
    );


    /* Wheel animation */

    for (const wheel of wheels) {
        wheel.rotation.x += velocity * 0.9;
    }


    checkTrafficCollision();

    updateCamera();

    updateHUD();
}


/* ================= TRAFFIC UPDATE ================= */

function updateTraffic() {

    if (!trafficEnabled) {
        return;
    }

    for (const traffic of trafficCars) {

        traffic.position.z +=
            traffic.userData.direction * 0.42;

        if (traffic.position.z > 500) {
            traffic.position.z = -500;
        }

        if (traffic.position.z < -500) {
            traffic.position.z = 500;
        }
    }
}


/* ================= CAMERA ================= */

const cameraTarget = new THREE.Vector3();


function updateCamera() {

    const backward = new THREE.Vector3(
        0,
        0,
        1
    );

    backward.applyQuaternion(
        car.quaternion
    );


    const desiredPosition =
        car.position.clone()
        .add(
            backward.multiplyScalar(11)
        );

    desiredPosition.y += 6;


    camera.position.lerp(
        desiredPosition,
        0.075
    );


    cameraTarget.copy(
        car.position
    );

    cameraTarget.y += 1.2;


    camera.lookAt(
        cameraTarget
    );
}


/* ================= COMPASS ================= */

function updateHUD() {

    const kmh =
        Math.round(
            Math.abs(velocity) * 75
        );

    speedDisplay.textContent =
        kmh;


    let angle =
        car.rotation.y;

    angle =
        ((angle % (Math.PI * 2))
        + Math.PI * 2)
        % (Math.PI * 2);


    const degrees =
        angle * 180 / Math.PI;


    let direction;

    if (
        degrees >= 315 ||
        degrees < 45
    ) {
        direction = "N";
    } else if (
        degrees < 135
    ) {
        direction = "W";
    } else if (
        degrees < 225
    ) {
        direction = "S";
    } else {
        direction = "E";
    }


    compassDisplay.textContent =
        direction;
}


/* ================= START GAME ================= */

function startGame() {

    gameStarted = true;
    gamePaused = false;

    startScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");

    hud.classList.remove("hidden");

    if (touchEnabled) {
        touchControls.classList.remove("hidden");
    }

    resetCar();
}


/* ================= PAUSE ================= */

function togglePause() {

    if (!gameStarted) {
        return;
    }

    gamePaused = !gamePaused;

    if (gamePaused) {

        pauseScreen.classList.remove("hidden");

    } else {

        pauseScreen.classList.add("hidden");
    }
}


playButton.addEventListener(
    "click",
    startGame
);


pauseButton.addEventListener(
    "click",
    togglePause
);


resumeButton.addEventListener(
    "click",
    togglePause
);


restartButton.addEventListener(
    "click",
    () => {

        resetCar();

        gamePaused = false;

        pauseScreen.classList.add(
            "hidden"
        );
    }
);


/* ================= SETTINGS ================= */

settingsButton.addEventListener(
    "click",
    () => {
        settingsPanel.classList.remove(
            "hidden"
        );
    }
);


closeSettings.addEventListener(
    "click",
    () => {

        settingsPanel.classList.add(
            "hidden"
        );
    }
);


touchToggle.addEventListener(
    "change",
    event => {

        touchEnabled =
            event.target.checked;

        if (
            touchEnabled &&
            gameStarted
        ) {
            touchControls.classList.remove(
                "hidden"
            );
        } else {
            touchControls.classList.add(
                "hidden"
            );
        }
    }
);


trafficToggle.addEventListener(
    "change",
    event => {

        trafficEnabled =
            event.target.checked;

        for (const traffic of trafficCars) {

            traffic.visible =
                trafficEnabled;
        }
    }
);


/* ================= MOBILE MENU ================= */

const mobileMenuButton =
    document.getElementById(
        "mobile-menu-button"
    );

mobileMenuButton.addEventListener(
    "click",
    () => {

        const nav =
            document.querySelector(
                ".navbar nav"
            );

        if (
            getComputedStyle(nav).display
            === "none"
        ) {

            nav.style.display =
                "flex";

            nav.style.position =
                "absolute";

            nav.style.top =
                "65px";

            nav.style.left =
                "0";

            nav.style.right =
                "0";

            nav.style.padding =
                "25px";

            nav.style.background =
                "#080808";

            nav.style.flexDirection =
                "column";

        } else {

            nav.style.display =
                "none";
        }
    }
);


/* ================= RESIZE ================= */

function resize() {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    if (
        width === 0 ||
        height === 0
    ) {
        return;
    }


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


/* ================= LOADING ================= */

let loadProgress = 0;

const loadingInterval =
    setInterval(
        () => {

            loadProgress +=
                Math.random() * 12;

            if (
                loadProgress >= 100
            ) {

                loadProgress = 100;

                clearInterval(
                    loadingInterval
                );

                setTimeout(
                    () => {

                        loader.classList.add(
                            "loaded"
                        );

                    },
                    400
                );
            }


            loaderProgress.style.width =
                `${loadProgress}%`;

        },
        80
    );


/* ================= RENDER LOOP ================= */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    clock.getDelta();


    updateCar();

    updateTraffic();


    renderer.render(
        scene,
        camera
    );
}


animate();
