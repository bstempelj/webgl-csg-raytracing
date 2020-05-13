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

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');

const program = createProgram(gl, vShader, fShader);
const screenAttr = gl.getAttribLocation(program, 'a_screen');
const resUniform = gl.getUniformLocation(program, 'u_res');
const spheresUniform = gl.getUniformLocation(program, 'u_spheres');
const screenBuffer = createBuffer(gl,
	new Float32Array([-1,-1, -1,1, 1,-1, 1,1]));

const spheres = createTexture(gl, [0,1,0,1]);

setViewport(gl, gl.canvas.clientWidth, gl.canvas.clientHeight);
bindAttribute(gl, screenBuffer, screenAttr, 2);
gl.useProgram(program);
gl.uniform1i(spheresUniform, 0);
gl.uniform2f(resUniform, gl.canvas.width, gl.canvas.height);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);