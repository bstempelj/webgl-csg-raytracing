# WebGL SHCRT (Single Hit CSG Raytracing)

This is a WebGL2 implementation of the iterative algorithm presented in the article **Spatially Efficient Tree Layout for GPU Ray-tracing of Constructive Solid Geometry Scenes** by Denis Bogolepov, Danila Ulyanov, and Vadim Turlapov.

*It's still a work in progress and not all operations work equally well.*

## How to run it?
The easiest way if you have **Python 3.x** installed is to use its built-in web server. Run the below command in a terminal or cmd console
```
python -m http.server 5000
````
then open your web browser of choice and enter
```
localhost:5000
```
into the URL bar.

## How to change the scene?
A couple of predefined scenes are provides in the file `scenes.js`. Each scene comes with a visualization of the CSG tree used to construct it. To change the rendered scene with another one, change the variable (named after a scene) on the line that contains the below code (located in the file `index.js`).
```js
const scene = union3Scene; // change this variable
```

A list of available predefined scenes is also visible in the import statement (file `index.js`)
```js
import {
	unionScene,
	interScene,
	subtrScene,
	union3Scene,
	interUnion2Scene,
} from './scenes.js';
```
