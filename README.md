# WebGL SHCRT (Single Hit CSG Raytracing)

This is a WebGL2 implementation of the iterative algoritm presented in the article Spatially Efficient Tree Layout for GPU Ray-tracing of Constructive Solid Geometry Scenes by Denis Bogolepov, Danila Ulyanov, and Vadim Turlapov.

## How to run it?
The easiest way if you have **Python 3.x** installed is to use its built in web server.
```
python -m http.server 5000
````
The open your web browser of choice and enter
```
localhost:5000
```
into the URL bar.

## How to change the scene?
A couple of predefined scenes are provides in the file `scenes.js`. Each scene comes with a visualization of the CSG tree used to construct it. To change the rendered scene with another one, change the variable (named after a scene) on the line that contains the below code (located in the file `index.js`).
```js
const scene = union3Scene; // change this variable
```