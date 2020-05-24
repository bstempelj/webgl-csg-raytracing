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

import {
	unionScene,
	interScene,
	subtrScene,
	union3Scene,
	interUnion2Scene,
} from './scenes.js';

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');

const program = createProgram(gl, vShader, fShader);
const screenAttr = gl.getAttribLocation(program, 'a_screen');
const screenBuffer = createBuffer(gl,
	new Float32Array([-1,-1, -1,1, 1,-1, 1,1]));

const uniforms = {
	res:     gl.getUniformLocation(program, 'u_res'),
	csgtree: gl.getUniformLocation(program, 'u_csgtree'),
	spheres: gl.getUniformLocation(program, 'u_spheres'),
};

const scene   = union3Scene;
const csgtree = createTexture(gl, new Uint8Array(scene.tree));
const spheres = createTexture(gl, new Float32Array(scene.spheres));

setViewport(gl, gl.canvas.clientWidth, gl.canvas.clientHeight);
bindAttribute(gl, screenBuffer, screenAttr, 2);
gl.useProgram(program);
gl.uniform1i(uniforms.csgtree, 0);
gl.uniform1i(uniforms.spheres, 1);
gl.uniform2f(uniforms.res, gl.canvas.width, gl.canvas.height);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);