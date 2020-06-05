import * as m4 from './math/m4.js';
import * as m3 from './math/m3.js';

import {
	createShader,
	createProgram,
	createBuffer,
	createTexture,
	bindAttribute,
	setViewport,
} from './glutils.js'
import vShader from './shaders/raytracer.vert.js';
import fShader from './shaders/raytracer.frag.js';

import * as scenes from './scenes.js';

function rad(deg) { return deg * Math.PI / 180; }

function initRotationSliders(ui) {
	for (let slider in ui) {
		ui[slider].min = 0.0;
		ui[slider].max = 360.0;
		ui[slider].step = 1.0;
		ui[slider].value = 0.0;
	}
}

function initSceneSwitcher(ui) {
	for (let scene in scenes) {
		let opt = document.createElement('option');
		opt.value = scene;
		opt.innerHTML = scene;
		ui.sceneSwitcher.appendChild(opt);		
	}
	ui.sceneSwitcher.selectedIndex = 0;
}

function getSelectedScene(ui) {
	const dd = ui.sceneSwitcher;
	const scene = dd.options[dd.selectedIndex].value;
	return scenes[scene];
}

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');

const ui = {
	xRotation: document.getElementById('xRotation'),
	yRotation: document.getElementById('yRotation'),
	zRotation: document.getElementById('zRotation'),
	sceneSwitcher: document.getElementById('sceneSwitcher'),
};
initRotationSliders(ui);
initSceneSwitcher(ui);

const program = createProgram(gl, vShader, fShader);
const screenAttr = gl.getAttribLocation(program, 'a_screen');
const screenBuffer = createBuffer(gl,
	new Float32Array([-1,-1, -1,1, 1,-1, 1,1]));

const uniforms = {
	res:     gl.getUniformLocation(program, 'u_res'),
	csgtree: gl.getUniformLocation(program, 'u_csgtree'),
	spheres: gl.getUniformLocation(program, 'u_spheres'),
	cameraToWorld: gl.getUniformLocation(program, 'u_cameraToWorld'),
};

function drawScene() {
	const scene   = getSelectedScene(ui);
	const csgtree = createTexture(gl, 0, new Uint8Array(scene.tree));
	const spheres = createTexture(gl, 1, new Float32Array(scene.spheres));

	setViewport(gl, gl.canvas.clientWidth, gl.canvas.clientHeight);
	bindAttribute(gl, screenBuffer, screenAttr, 2);
	gl.useProgram(program);
	gl.uniform1i(uniforms.csgtree, 0);
	gl.uniform1i(uniforms.spheres, 1);
	gl.uniform2f(uniforms.res, gl.canvas.width, gl.canvas.height);

	// set up cameraToWorld
	let cameraToWorld = m4.xRotation(rad(ui.xRotation.value));
	cameraToWorld = m4.multiply(cameraToWorld, m4.yRotation(rad(ui.yRotation.value)));
	cameraToWorld = m4.multiply(cameraToWorld, m4.zRotation(rad(ui.zRotation.value)));
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
