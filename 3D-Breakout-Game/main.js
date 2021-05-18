/*!
 * main.js 
 *
 * Dependices:
 * Should Includes dat.gui.min.js & OrbitControl.js & jquery.js & three.js
 *
 * Author: 
 * Kin - Qingwen Zhang (qzhangcb@connect.ust.hk) write all this file for first version 
 * [All game things, control panel, flame explosion effect, skysphere]
 * [modified: reflection, refraction (fix problems) ]
 * 
 * Junming (jeremy.junming.chen@connect.ust.hk) added some new rendering features
 * [reflection, refraction]
 * [modified: skybox (set new one), control panel, ball & bricks' position]
 * 
 * Date: 2020-11-26
 * 
 * Reference:
 * [1] https://threejs.org/ Three.js libaray -> Use it to render scene
 * [2] https://www.youtube.com/watch?v=FyZ4_T0GZ1U 2D Breakout Game Using JavaScript and HTML [beginners] -> Use for game logical
 * [3] https://github.com/fncombo -> Look for the 3D texture & partical effect & game map
 * [4] https://en.wikipedia.org/wiki/Breakout_(video_game) -> Background of breakout
 * [5] https://github.com/squarefeet/ShaderParticleEngine -> Shader Particle Engine explode effect with three.js
 * [6] https://threejs.org/examples/webgl_materials_cubemap_dynamic.html -> reflection effect reference
 * 
 * TODO:
 * [1] CSS the website need some interface to give information about the game(life win lose?)
 * [2] speed up the rendering
 * 
 */
console.log("3D breakout game - Computer Graphic Project")
/* Game Things -------- Brick & Paddle & Ball ---------------- Game Things START*/
// GAME VARIABLES AND CONSTANTS
let size = 15.17; //just fit for this map this size cannot be changed!
const PADDLE_WIDTH = 80;
const PADDLE_MARGIN_BOTTOM = 5;
const BALL_SPEED = 6;
const PADDLE_SPPED = 5;
const PADDLE_HEIGHT = BALL_SPEED + 0.01; //PADDLE_HEIGHT must larger than BALL_SPEED otherwise it will have bug
const BALL_RADIUS = size / 2;
const BOARD_WIDTH = 500;
const BOARD_HEIGHT = 500;
const thin = 3; //the board's thickness
let paddle_mesh, ball_mesh;
let brick = {
  row: 20,
  columns: Math.ceil(500 / size),
  map_mesh: []
}

let bricks = [];

const paddle = {
  x: BOARD_WIDTH / 2,
  y: PADDLE_HEIGHT / 2,
  z: PADDLE_HEIGHT,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dx: 5
}

const ball = {
  x: BOARD_WIDTH / 2,
  y: paddle.height + size / 2,
  z: thin + size / 2,
  radius: BALL_RADIUS,
  speed: BALL_SPEED,
  dx: BALL_SPEED * (Math.random() * 2 - 1),
  dy: BALL_SPEED
}

let activeBlocks = 0;
let brick_texture = [];
let board, fence = [];
let normalGeometry, specialGeometry, geometry, material;

/* Game Things -------- Brick & Paddle & Ball ---------------- Game Things END*/


/* Game Things --------  Light & Key ---------------- Game Things START*/
let LIFE = 3; // PLAYER HAS 3 LIVES
let GSTART = 0;
/* KeyBoard & GUI*/
let leftArrow, rightArrow, pauseKey, spaceKey = false;
/* Game Things -------- Light & Key ---------------- Game Things END*/


let params = {
  
  Third_Perspective: true,
  First_Perspective: false,
  spotlight: 0.8,
  balllight: 1,
  balllight_distance: 250,

  Perspective: 'Third Perspective',//'Third_Perspective','First_Perspective'
  RenderEffect: 'Texture', // 'Texture', 'Reflection', 'Refraction'
}
/* Render Things -------- Scene & Camera & Control(for test) ---------------- Render Things START*/
let TEST_FLAG = 0; //If you want to see other helper in the scene and control camera set it to true
let lightHelper;
let stats;
//scene
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.shadowMap.enabled = renderer.shadowMapSoft = true; // Enable shadows and make them smoother

// renderer.sortObjects = false; // Improves performance
// renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth - 20, window.innerHeight - 20);
// renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild( renderer.domElement );
//camera
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.x = BOARD_WIDTH / 2;
camera.position.y = 500;
camera.position.z = -250;
let spotlight;


renderer.render(scene, camera);
/* Render Things -------- Scene & Camera & Control(for test) ---------------- Render Things END*/



if (TEST_FLAG) {
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', renderScene);
  var axes = new THREE.AxesHelper(500);
  scene.add(axes);
  console.log("Kin message: You open the TEST, the mouse will control the camera")
}
let TEMP_F = false;
let group,fireball,flash;
let temp=1,ex_temp=1;
let begin_ex;

let cubeCamera1,cubeRenderTarget1,cubeCamera2,cubeRenderTarget2;
let ball_material;
let count=0;
let ttflag=0;

let clock = new THREE.Clock();
let delta = 0;
// 30 fps
let interval = 1 / 60;
function renderScene() {
  requestAnimationFrame(renderScene);

  delta += clock.getDelta();

  if (delta  > interval) {
      // The draw or time dependent code are here
      stats.begin();
      if (TEST_FLAG) lightHelper.update();
      loop_render();
      movePaddle();
      if (!pauseKey) {
        if (GSTART || TEMP_F) 
        {
          moveBall();
          GSTART = 0;
          TEMP_F = true;
        } 
        else 
          BallwithPaddle();
      }
      ballPaddleCollision();
      ballWallCollision();
      ballBrickCollision();
      
      renderer.render(scene, camera); //set all game things' scene
      stats.end();
      delta = delta % interval;
  }
  
  
}

init();

function background() {
  console.log("scene position")
  console.log(scene.position)
  // scene.position.set(250,0,250)
  console.log(scene.position)
  geometry = new THREE.CubeGeometry(BOARD_WIDTH, thin, BOARD_HEIGHT);
  material = new THREE.MeshPhongMaterial();
  board = new THREE.Mesh(geometry, material);
  let textures = [];
  textures = new THREE.TextureLoader().load('img/board.bmp');
  textures.wrapS = textures.wrapT = THREE.RepeatWrapping; // Make the board texture repeat
  textures.repeat.set(10, 10); // Scale the board texture
  board.material.map = textures;
  board = new THREE.Mesh(geometry, material);
  board.castShadow = false;
  board.receiveShadow = true; // It can receive shadows
  scene.add(board);
  board.position.set(BOARD_WIDTH / 2, thin/2 , BOARD_WIDTH / 2);

    // Load the background texture
  // var texture = new THREE.TextureLoader().load('img/sky.bmp');
  // var backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 0), new THREE.MeshBasicMaterial({
  //   map: texture
  // }));
  // backgroundMesh.material.depthTest = false;
  // backgroundMesh.material.depthWrite = false;
  // backgroundScene.add(backgroundMesh);
  // const textureLoader = new THREE.TextureLoader();
  // textureLoader.load( 'img/2294472375_24a3b8ef46_o.jpg', function ( texture ) {
  //   texture.encoding = THREE.sRGBEncoding;
  //   texture.mapping = THREE.EquirectangularReflectionMapping;
  //   scene.background = texture;
  // } );

  scene.background = new THREE.CubeTextureLoader()
  .setPath('img/Bridge2/')
  .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
  const textureCube = new THREE.CubeTextureLoader()
  .setPath('img/Bridge2/')
  .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
  textureCube.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background.encoding = THREE.sRGBEncoding;
  // scene.background = new THREE.CubeTextureLoader().setPath('img/').load(['sky.bmp']);
  // const textureCube = new THREE.CubeTextureLoader().setPath('img/').load(['sky.bmp']);
  // textureCube.mapping = THREE.CubeRefractionMapping;

  /* ------------------------------------ Particles Effect initial --------------------------------------- START */
  geometry = new THREE.Geometry();
  material = new THREE.PointsMaterial({
    size: 6, // Scale of the particles
    blending: THREE.AdditiveBlending, // Black becomes transparent
    transparent: true,
    map: new THREE.TextureLoader().load('img/particle.bmp')
  });
  // Create individual particles and push them into the geometry, 3 times, for each of the sides (left, top, right)
  let x, z, y, vector;
  for (let n = 0; n < 3; n += 1) { // Number of sides
    for (let i = 0; i < 100; i += 1) { // Number of particles in current side
      switch (n) {
        case 0: // Left
          x = 0;
          z = THREE.Math.randInt(0, BOARD_WIDTH);
          break;
        case 1: // Top
          x = BOARD_WIDTH;
          z = THREE.Math.randInt(0, BOARD_WIDTH);
          break;
        case 2: // Right
          x = THREE.Math.randInt(0, BOARD_WIDTH);
          z = BOARD_WIDTH;
          break;
      }
      y = THREE.Math.randInt(0, 20);
      vector = new THREE.Vector3(x, y, z); // Position vector
      geometry.vertices.push(vector);
    }
  }
  fence = new THREE.Points(geometry, material); // Create the particles system
  scene.add(fence);
  /* ------------------------------------ Particles Effect initial --------------------------------------- END*/
}

function light() {
  //Lights
  [-200, 200].forEach(function (distance) {
    let light;
    light = new THREE.DirectionalLight(0xffffff, 0.05);
    light.position.set(distance, 200, 500);
    scene.add(light);
  });
  spotlight = new THREE.SpotLight(0xffffff);
  spotlight.intensity = params.spotlight;
  spotlight.shadow.camera.near = 0.01;
  spotlight.position.set(0, BOARD_WIDTH / 2, -250);
  spotlight.distance = 2000;
  spotlight.castShadow = true;
  const targetObject = new THREE.Object3D();
  scene.add(targetObject);
  targetObject.position.set(BOARD_WIDTH / 2, 0, BOARD_WIDTH / 2);
  spotlight.target = targetObject;
  spotlight.shadow.mapSize.height = spotlight.shadow.mapSize.height = 2048; // Larger shadow map improves shadow quality
  scene.add(spotlight);
  spotlight.position.x = 0;
  if (TEST_FLAG) {
    lightHelper = new THREE.SpotLightHelper(spotlight);
    scene.add(lightHelper);
  }
  scene.add(new THREE.AmbientLight(0xffffff, 0.05));
}

function brick_map() {
  normalGeometry = new THREE.CubeGeometry(size, size * 0.5, size),
    specialGeometry = new THREE.SphereGeometry(size / 2, size, size);
  for (let i = 0; i < 4; i++) brick_texture[i] = new THREE.TextureLoader().load('img/brick' + i + '.PNG');
  let map = 
  '                                 ' + 
  '                                 ' + 
  ' 0000000000000000000000000000000 ' + 
  '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' + 
  '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' + 
  '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' + 
  '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' + 
  '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' + 
  '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' + 
  ' 0000000000000000000000000000000 ' + 
  '                                 ' + 
  ' 2                             2 ' + 
  ' 22                           22 ' + 
  ' 2 2       1    1    1       2 2 ' + 
  ' 2  2     111  111  111     2  2 ' + 
  ' 2   2     1    1    1     2   2 ' + 
  ' 2    2                   2    2 ' + 
  ' 2     2                 2     2 ' + 
  '000000000000000000000000000000000' + 
  '000000000000000000000000000000000'
  let b = 1; // Start with index 1
  // Rows
  for (let n = brick.row; n > 0; n -= 1) {
    bricks[n] = [];
    // Columns
    for (let i = brick.columns; i > 0; i -= 1) {
      let character = map.charAt(b - 1); // Account for 0-based indexing
      // If the block is supposed to be placed from the level map
      if (character !== ' ') {
        let special = Math.random() < 0.05; // 5% chance of it being a special block
        const material = new THREE.MeshStandardMaterial({
          map: brick_texture[character]
        });
        brick.map_mesh[b] = new THREE.Mesh(special ? specialGeometry : normalGeometry, material);
        brick.map_mesh[b].castShadow = true; // Can cast and recieve shadows

        brick.map_mesh[b].position.set((i * size) + (size / 2) - 15, special ? (thin + size / 2) : (thin + size / 4), (n * size) + (size / 2) + BOARD_HEIGHT / 3); // Junming
        bricks[n][i] = {
          x: (i * size) + (size / 2) - 15,
          y: (n * size) + (size / 2) + BOARD_HEIGHT / 3,
          status: true,
          b_value: b
        }
        brick.map_mesh[b].blockNum = b; // Extra identifier so we know which block to remove when the ball hits it
        brick.map_mesh[b].blockSpecial = special; // Extra identifier to detect special blocks
        scene.add(brick.map_mesh[b]);
        brick.map_mesh[b].receiveShadow = false; //default
        activeBlocks += 1; // Increment the number of blocks on the board
      }
      b += 1; // Increment block unique number
    }
  }
  /* ---------------------- THIS PART IS ABOUT paddle -------------------- */
  let geometry = new THREE.BoxGeometry(paddle.width, size, paddle.height);
  let paddle_texture = new THREE.TextureLoader().load('img/paddle.bmp');
  let material = new THREE.MeshPhongMaterial({
    map: paddle_texture
  });
  paddle_mesh = new THREE.Mesh(geometry, material);
  paddle_mesh.position.set(paddle.x, paddle.z, paddle.y);
  scene.add(paddle_mesh);

  /* ---------------------- THIS PART IS ABOUT Ball -------------------- */
  cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget( 256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    // minFilter: THREE.LinearMipmapLinearFilter,
    // encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
  } );

  cubeCamera1 = new THREE.CubeCamera( 1, 1000, cubeRenderTarget1 );

  cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget( 256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    // minFilter: THREE.LinearMipmapLinearFilter,
    // encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
  } );

  cubeCamera2 = new THREE.CubeCamera( 1, 1000, cubeRenderTarget2 );

  geometry = new THREE.IcosahedronBufferGeometry( size/2, 8 );
  // geometry = new THREE.SphereBufferGeometry(size / 2, 32, 16);
  if (params.RenderEffect == 'Texture') {
    let ball_texture = new THREE.TextureLoader().load('img/ball.bmp');
    ball_material = new THREE.MeshBasicMaterial({
      map: ball_texture
    });
  }
  if (params.RenderEffect == 'Reflection') {
    ball_material = new THREE.MeshBasicMaterial({
      envMap: cubeRenderTarget1.texture,
      combine: THREE.MultiplyOperation,
      reflectivity: 1
    });
  }
  if (params.RenderEffect == 'Refraction') {
    ball_material = new THREE.MeshBasicMaterial( { 
      color: 0xffffff,
      envMap: cubeRenderTarget2.texture,
      refractionRatio: 0.5 } );
    ball_material.envMap.mapping = THREE.CubeRefractionMapping;
  }


  ball_mesh = new THREE.PointLight(0xffffffff, params.balllight, params.balllight_distance);
  ball_mesh.add(new THREE.Mesh(geometry, ball_material));
  ball_mesh.add(cubeCamera1);
  ball_mesh.add(cubeCamera2);
  ball_mesh.position.set(ball.x, ball.z, ball.y);
  ball_mesh.castShadow = true; // default false
  scene.add(ball_mesh);

}

function loop_render() {
  fence.geometry.verticesNeedUpdate = true; // Forces the update of geometry
  fence.geometry.vertices.forEach(function (vertex) {
    vertex.y = vertex.y > 20 ? 0 : vertex.y + 0.2; // Move each particle up a bit. If it's too far up, reset position.
  });
  params.First_Perspective = (!params.Third_Perspective);
  spotlight.intensity = params.spotlight;
  ball_mesh.intensity = ball_mesh.lightMapIntensity = params.balllight;
  ball_mesh.distance = params.balllight_distance;

  if (!TEST_FLAG) 
  {
    if (params.Third_Perspective) {
      camera.position.set(BOARD_WIDTH / 2, 400, -250);
      camera.lookAt(255, 0, 255);
    } else {
      camera.position.set(paddle.x, paddle.z + thin, paddle.y + size / 2);
      camera.lookAt(paddle.x, 0, 255);
    }
  }
  else
  {
    camera.lookAt(255, 0, 255);
  }
  if (spaceKey) GSTART = 1;
  
  if (params.RenderEffect == 'Reflection') {
    ball_mesh.visible = false;
    if ( count % 2 === 0 ) 
    {
      cubeCamera1.update( renderer, scene );
      cubeCamera1.rotation.z=0;
      cubeCamera2.rotation.x=0;
    } 
    else {
      cubeCamera2.update( renderer, scene );
      cubeCamera2.rotation.z=0;
      cubeCamera2.rotation.x=0;
    }
    ball_mesh.visible = true;
    count++;
  }
  else if (params.RenderEffect == 'Refraction') {
    ball_mesh.visible = false;
    cubeCamera2.update( renderer, scene );
    // ball_material.envMap = cubeRenderTarget2.texture;
    if(params.First_Perspective)
    {
      cubeCamera2.rotation.z=3.14;
      cubeCamera2.rotation.x=0;
    }
    else{
      cubeCamera2.rotation.z=3.14;
      cubeCamera2.rotation.x=3.14;
    }
    ball_mesh.visible = true;
  }
  // changePerspective();
}

/* ------------------------------------------------ Game Move Function START ------------------------------------ */
function movePaddle() {
  if (leftArrow && paddle.x + paddle.width / 2 < BOARD_WIDTH) {
    paddle.x += paddle.dx;
  } else if (rightArrow && paddle.x - paddle.width / 2 > 0) {
    paddle.x -= paddle.dx;
  }
  paddle_mesh.position.set(paddle.x, paddle.z, paddle.y);
  ball_mesh.position.set(ball.x, ball.z, ball.y);
  spotlight.position.x = paddle.x * 1;
  
}
// MOVE THE BALL
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}
// BALL AND WALL COLLISION DETECTION
function ballWallCollision() {
  if (ball.x + ball.radius > BOARD_WIDTH || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
    // WALL_HIT.play();
  }
  if (ball.y + ball.radius > BOARD_WIDTH) {
    ball.dy = -ball.dy;
    // WALL_HIT.play();
  }
  if (ball.y - ball.radius < 0) {
    LIFE--; // LOSE LIFE
    console.log(LIFE)
    resetBall();
  }
}

function resetBall() {
  ball.x = BOARD_WIDTH / 2;
  ball.y = paddle.height + size / 2;
  ball.dx = BALL_SPEED * (Math.random() * 2 - 1);
  ball.dy = BALL_SPEED;
  paddle.x = BOARD_WIDTH / 2;
  paddle.y = PADDLE_HEIGHT / 2;
  paddle.dx = 5;
  TEMP_F = false;
}

function BallwithPaddle() {
  ball.x = paddle.x;
  ball.y = paddle.height + size / 2;
}

function ballBrickCollision() {
  for (let r = brick.row; r > 0; r -= 1) {
    for (let c = brick.columns; c > 0; c -= 1) {
      let b = bricks[r][c];
      // if the brick isn't broken
      if (b != null) {
        if (b.status) {

          if (ball.x + ball.radius > b.x - size / 2 && ball.x - ball.radius < b.x + size / 2 && ball.y + ball.radius > b.y + size / 2 && ball.y - ball.radius < b.y + size / 2) {

            ball.dy = -ball.dy;
            b.status = false; // the brick is broken

            group.mesh.position.set(brick.map_mesh[b.b_value].position.x,brick.map_mesh[b.b_value].position.y,brick.map_mesh[b.b_value].position.z);
            // console.log(group.mesh.position)
            scene.remove(brick.map_mesh[b.b_value]);
            ex_temp = 1;
            begin_ex=1;
            // group.tick(0.05);
            
            break;
          }
        }
      }
    }
  }

  if(begin_ex==1)
  {
    if(ex_temp%1000 == 25)
    {group.dispose();scene.remove(group.mesh);begin_ex=0;explode_effect();}
    else
    {scene.add(group.mesh);group.tick( 0.07 );
      // console.log("in");
    ex_temp=ex_temp+1;}
  }

}
// BALL AND PADDLE COLLISION
function ballPaddleCollision() {
  if (ball.x < paddle.x + paddle.width / 2 && ball.x > paddle.x - paddle.width / 2 && ball.y - ball.radius < paddle.height && ball.y - ball.radius > 0) {
    // CHECK WHERE THE BALL HIT THE PADDLE
    let collidePoint = ball.x - paddle.x;
    // NORMALIZE THE VALUES
    collidePoint = collidePoint / (paddle.width / 2);
    // CALCULATE THE ANGLE OF THE BALL
    let angle = collidePoint * Math.PI / 3;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = ball.speed * Math.cos(angle);
  }
}
/* ------------------------------------------------ Game Move Function START ------------------------------------ */
/* ----------------------------- CONTROL ------------------------------------  */
// CONTROL THE PADDLE
document.addEventListener("keydown", function(event) {
  if (event.keyCode == 37) {
    leftArrow = true;
  } else if (event.keyCode == 39) {
    rightArrow = true;
  } else if (event.keyCode == 19) {
    pauseKey = !pauseKey;
  } else if (event.keyCode == 32) {
    spaceKey = true;
  }
});
document.addEventListener("keyup", function(event) {
  if (event.keyCode == 37) {
    leftArrow = false;
  } else if (event.keyCode == 39) {
    rightArrow = false;
  } else if (event.keyCode == 32) {
    spaceKey = false;
  }
});

function init() {
  const container = document.createElement( 'div' );
	document.body.appendChild( container );
  stats = new Stats();
  container.appendChild( stats.dom );
  // camera.lookAt(255, 50, 255);
  console.log("In")
  background();
  brick_map(); //brick_map:include brick 
  
  light(); //spotlight animatie light
  
  addGUI();
  explode_effect();
  console.log("init")
  explode_effect();
  
  scene.add(group.mesh);
  renderScene(); //main_loop
}

function addGUI() {
  var gui = new dat.GUI({
    width: 400
  });
  var animationOptions = gui.addFolder('Light Source');
  animationOptions.add(params, 'spotlight', 0, 2, 0.05).name("SpotLight Intensity").listen();
  animationOptions.add(params, 'balllight', 0, 2, 0.05).name("Balllight Intensity").listen();
  animationOptions.add(params, 'balllight_distance', 100, 500, 10).name("Balllight distance").listen();
  // animationOptions.add(options.animation, 'halfRange', 1000, 7000, 1).name("Bubble Spreading Range").listen();
  animationOptions.open();

  // var shaderOptions = gui.addFolder("Perspective");
  // shaderOptions.add(params, 'Third_Perspective').name("Third Perspective").listen();
  // shaderOptions.add(params, 'First_Perspective').name("First Perspective").listen();
  // shaderOptions.open();

  const perspective = ['Third Perspective','First Perspective'];
  var POptions = gui.addFolder('Perspective Choice');
  const PCtrl = POptions.add(params,'Perspective').options(perspective);
  PCtrl.onChange(function () {
    changePerspective(params.Perspective);
  });
  POptions.open();

  // Junming
  const renderEffects = ['Texture', 'Reflection', 'Refraction'];
  const effectsFolder = gui.addFolder('Rendering Effects on Ball');
  const clipCtrl = effectsFolder.add(params, 'RenderEffect').options(renderEffects);
  clipCtrl.onChange(function () {
    changeBall(params.RenderEffect);
  });
  effectsFolder.open();
}


function explode_effect()
{
  group = new SPE.Group( {
    texture: {
      value: new THREE.TextureLoader().load( './img/sprite-explosion2.png' ),
      frames: new THREE.Vector2( 5, 5 ),
      loop : 1
    },
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    scale: 600
  } );

  fireball = new SPE.Emitter( {
    particleCount: 20,
    type: SPE.distributions.SPHERE,
    position: {
      radius: 1
    },
    maxAge: { value: 2 },
    // duration: 1,
    activeMultiplier: 20,
    velocity: {
      value: new THREE.Vector3( 10*temp )
    },
    size: { value: [20, 100] },
    color: {
      value: [
        new THREE.Color( 0.5, 0.1, 0.05 ),
        new THREE.Color( 0.2, 0.2, 0.2 )
      ]
    },
    opacity: { value: [0.5, 0.35, 0.1, 0] }
  });
  flash = new SPE.Emitter( {
    particleCount: 50,
    position: { spread: new THREE.Vector3( 5, 5, 5 ) },
    velocity: {
      spread: new THREE.Vector3( 30*temp ),
      distribution: SPE.distributions.SPHERE
    },
    size: { value: [2, 20, 20, 20] },
    maxAge: { value: 2 },
    activeMultiplier: 2000,
    opacity: { value: [0.5, 0.25, 0, 0] }
  } );
  group.addEmitter( fireball ).addEmitter( flash );
}


function ball_update() {
  // ball_material.map = null; 
  // ball_material.needsUpdate = true;

  // ball_mesh.remove(ball_mesh.children[0]);
  scene.remove(ball_mesh);
  ball_mesh=null;
  cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget( 256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    // minFilter: THREE.LinearMipmapLinearFilter,
    // encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
  } );

  cubeCamera1 = new THREE.CubeCamera( 1, 1000, cubeRenderTarget1 );

  cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget( 256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    // minFilter: THREE.LinearMipmapLinearFilter,
    // encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
  } );

  cubeCamera2 = new THREE.CubeCamera( 1, 1000, cubeRenderTarget2 );

  geometry = new THREE.IcosahedronBufferGeometry( size/2, 8 );
  // geometry = new THREE.SphereBufferGeometry(size / 2, 32, 16);
  if (params.RenderEffect == 'Texture') {
    let ball_texture = new THREE.TextureLoader().load('img/ball.bmp');
    ball_material = new THREE.MeshBasicMaterial({
      map: ball_texture
    });
  }
  if (params.RenderEffect == 'Reflection') {
    ball_material = new THREE.MeshBasicMaterial({
      envMap: cubeRenderTarget1.texture,
      combine: THREE.MultiplyOperation,
      reflectivity: 1
    });
  }
  if (params.RenderEffect == 'Refraction') {
    ball_material = new THREE.MeshBasicMaterial( { 
      color: 0xffffff,
      envMap: cubeRenderTarget2.texture,
      refractionRatio: 0.5 } );
    ball_material.envMap.mapping = THREE.CubeRefractionMapping;
  }


  ball_mesh = new THREE.PointLight(0xffffffff, params.balllight, params.balllight_distance);
  ball_mesh.add(new THREE.Mesh(geometry, ball_material));
  ball_mesh.add(cubeCamera1);
  ball_mesh.add(cubeCamera2);
  ball_mesh.position.set(ball.x, ball.z, ball.y);
  ball_mesh.castShadow = true; // default false
  scene.add(ball_mesh);
}

function changeBall(name) {
  if ( name == 'Texture' ) {
    // console.log(ball_material.envMap, ball_material.reflectivity, ball_material.refractionRatio);
    renderScene(); //main_loop
    ball_update();
    // console.log("In");
  }

  if (name == 'Reflection') {
    renderScene(); //main_loop
    ball_update();
  }

  if (name == 'Refraction') {
    renderScene(); //main_loop
    ball_update();
  }

}

function changePerspective(name)
{
  if ( name == 'Third Perspective' ) {
    params.Third_Perspective = true;
    params.First_Perspective = false;
  }

  if (name == 'First Perspective') {
    params.Third_Perspective = false;
    params.First_Perspective = true;
  }
}