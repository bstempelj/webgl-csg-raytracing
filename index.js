import * as dat from './vendor/dat.gui/dat.gui.module.js';
import * as m4 from './math/m4.js';

import {
	createProgram,
	createBuffer,
	createTexture,
	bindAttribute,
	setViewport,
} from './glutils.js'
import vShader from './shaders/raytracer.vert.js';
import fShader from './shaders/raytracer.frag.js';

import * as scenes from './scenes.js';

const DEV = false;

const gui = new dat.GUI();
const params = {
	xRotation: 0,
	yRotation: 0,
	zRotation: 0,
	scene: '',
	resetOrientation: function() {
		params.xRotation = 0;
		params.yRotation = 0;
		params.zRotation = 0;
	}
};

gui.add(params, 'xRotation').min(-180).max(180).step(1).listen();
gui.add(params, 'yRotation').min(-180).max(180).step(1).listen();
gui.add(params, 'zRotation').min(-180).max(180).step(1).listen();
gui.add(params, 'resetOrientation');
gui.add(params, 'scene', Object.keys(scenes)).setValue('boxSphCyl3Scene').onChange(function(newScene) {
	params.scene = newScene;
});

function rad(deg) { return deg * Math.PI / 180; }

function resize() {
  var cssToRealPixels = window.devicePixelRatio || 1;

  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels.
  var displayWidth  = Math.floor(document.body.clientWidth  * cssToRealPixels);
  var displayHeight = Math.floor(document.body.clientHeight * cssToRealPixels);

  // Check if the canvas is not the same size.
  if (canvas.width  !== displayWidth ||
      canvas.height !== displayHeight) {

    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

const canvas  = document.getElementById('glcanvas');
canvas.width  = (DEV) ? 400 : document.body.clientWidth;
canvas.height = (DEV) ? 300 : document.body.clientHeight;
console.log(canvas.width, canvas.height);
const gl = canvas.getContext('webgl2');

if (!DEV) window.addEventListener('resize', resize);

const ui = {
	xRotation: document.getElementById('xRotation'),
	yRotation: document.getElementById('yRotation'),
	zRotation: document.getElementById('zRotation'),
	sceneSwitcher: document.getElementById('sceneSwitcher'),
};
// initRotationSliders(ui);
// initSceneSwitcher(ui);

const program = createProgram(gl, vShader, fShader);
const screenAttr = gl.getAttribLocation(program, 'a_screen');
const screenBuffer = createBuffer(gl,
	new Float32Array([-1,-1, -1,1, 1,-1, 1,1]));

const uniforms = {
	res:     gl.getUniformLocation(program, 'u_res'),
	csgtree: gl.getUniformLocation(program, 'u_csgtree'),
	spheres: gl.getUniformLocation(program, 'u_spheres'),
	boxes:   gl.getUniformLocation(program, 'u_boxes'),
	cylinders: gl.getUniformLocation(program, 'u_cylinders'),
	cameraToWorld: gl.getUniformLocation(program, 'u_cameraToWorld'),
};

function drawScene() {
	const scene     = scenes[params.scene];
	const csgtree   = createTexture(gl, 0, new Uint8Array(scene.tree));
	const spheres   = createTexture(gl, 1, new Float32Array(scene.spheres));
	const boxes     = createTexture(gl, 2, new Float32Array(scene.boxes));
	const cylinders = createTexture(gl, 3, new Float32Array(scene.cylinders));

	setViewport(gl, gl.canvas.clientWidth, gl.canvas.clientHeight);
	bindAttribute(gl, screenBuffer, screenAttr, 2);
	gl.useProgram(program);
	gl.uniform1i(uniforms.csgtree, 0);
	gl.uniform1i(uniforms.spheres, 1);
	gl.uniform1i(uniforms.boxes, 2);
	gl.uniform1i(uniforms.cylinders, 3);
	gl.uniform2f(uniforms.res, gl.canvas.width, gl.canvas.height);

	// set up cameraToWorld
	let cameraToWorld = m4.xRotation(rad(params.xRotation));
	cameraToWorld = m4.multiply(cameraToWorld, m4.yRotation(rad(params.yRotation)));
	cameraToWorld = m4.multiply(cameraToWorld, m4.zRotation(rad(params.zRotation)));
	gl.uniformMatrix4fv(uniforms.cameraToWorld, false, cameraToWorld);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

let then = 0;
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  drawScene(deltaTime);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
