let socket;

let xPos = 0;
let yPos = 0;

let previousX = 0;
let previousY = 0;

const init = () => {
  //THREE JS
  createScene();
  createLights();
  createCircle();
  loop();

  // socket
  socket = io.connect('/');
  socket.on('connect', () => {
    createQRcode(socket.id);
  });
  socket.on('update', data => {
    const explainer = document.querySelector('.explainer')
    if(explainer.style.display != "none"){
      explainer.style.display = "none";
    }

    if(data.x > previousX + 2 || data.x < previousX - 2){
      //Omzetten dan radialen (0-360)
      xPos = (data.x+180)*0.01745329252;
      previousX = data.x;
    }
    if(data.y > previousY + 5 || data.y < previousY - 5){
      //Omzetten dan radialen (0-90)
      yPos = (Math.abs(data.y))*0.06981317008;
      previousY = data.y;
    }
  });
}

const createQRcode = id =>{
  var typeNumber = 6;
  var errorCorrectionLevel = 'L';
  var qr = qrcode(typeNumber, errorCorrectionLevel);

  //LOCAL
  qr.addData(`http://192.168.0.233:8080/controller.html?id=${id}`);

  //ONLINE
  //qr.addData(`https://webgl-experiment.herokuapp.com/controller.html?id=${id}`);

  qr.make();
  document.getElementById('qrcode').innerHTML = qr.createImgTag();
}

const loop = () => {
  renderer.render(scene, camera);
  circle.mesh.rotation.x = xPos;
  circle.mesh.rotation.y = yPos;

  requestAnimationFrame(loop);
}

let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, renderer, container, HEIGHT, WIDTH;
const createScene = () => {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();

	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
  );

	camera.position.set(0, 100, 200);

	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});

	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
}

let hemisphereLight, shadowLight;
const createLights = () => {
	// A hemisphere light is a gradient colored light;
	// the first parameter is the sky color, the second parameter is the ground color,
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

	// A directional light shines from a specific direction.
	// It acts like the sun, that means that all the rays produced are parallel.
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light
	shadowLight.position.set(150, 350, 350);

	// Allow shadow casting
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 100;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better,
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	ambientLight = new THREE.AmbientLight(0xdc8874, .5);

	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);
	scene.add(shadowLight);
	scene.add(ambientLight);
}

let circle;
const createCircle = () => {
	circle = new Circle();
	circle.mesh.position.y = 100;
	scene.add(circle.mesh);
}

class Circle {
	constructor(){
		this.mesh = new THREE.Object3D();

		const geomCircle = new THREE.TorusKnotGeometry( 40, 14, 128, 16 );
		const matCircle = new THREE.MeshPhongMaterial({color: 0xff3838 , emissive: 0x3c0202, specular: 0x665a5a, shininess: 100});
		const circle = new THREE.Mesh(geomCircle, matCircle);
		circle.castShadow = true;
		circle.receiveShadow = true;
		this.mesh.add(circle);
	}
};

init();
