// states
const DOBOTH   = 0x0001;
const DOLEFT   = 0x0002;
const DORIGHT  = 0x0003;
const DONE	   = 0x0004;

// operations
const UNION    = 0x0005;
const INTER    = 0x0006;
const SUBTR    = 0x0007;

// node types
const NIL      = 0x0008;
const OP       = 0x0009;
const SPHERE   = 0x0010;
const BOX      = 0x0011;
const CYLINDER = 0x0012;


export const complexScene = {
	tree: [
		// OP,INTER,
		// BOX,0, SPHERE,0,

		// OP,UNION,
		// CYLINDER,0, CYLINDER,2

		OP,SUBTR,
		OP,INTER, OP,UNION,
		BOX,0, SPHERE,0, CYLINDER,0, CYLINDER,1
	],
	spheres: [0,0,0,0.6],
	boxes: [0,0,0,0, 0.5,0.5,0.5,0, 0,0,0,0], // origin, size, rotation
	cylinders: [
		0,90,0,0, 90,0,0,0,
	],
};

export const cylBoxScene = {
	tree: [
		OP,UNION,
		BOX,0, CYLINDER,0,
	],
	boxes: [0,0,0,0, 0.5,0.5,0.5,0, 0,0,0,0], // origin, size, rotation
	cylinders: [
		0,90,0,0
	],
};

export const cylSphScene = {
	tree: [
		OP,UNION,
		BOX,0, SPHERE,0,
	],
	spheres: [0,0,0,1],
	cylinders: [
		0,0,0,0
	],
};


//     union
//    /     \
//  cyl0   cyl1
export const unionCylinderScene = {
	tree: [
		OP,UNION,
		CYLINDER,0, CYLINDER,1, // primitives
	],
	cylinders: [
		0,90,0,0, 90,0,0,0
	],
};

//     inter
//    /     \
//  cyl0   cyl1
export const interCylinderScene = {
	tree: [
		OP,INTER,
		CYLINDER,0, CYLINDER,1, // primitives
	],
	cylinders: [
		0,90,0,0, 90,0,0,0
	],
};

//     subtr
//    /     \
//  cyl0   cyl1
export const subtrCylinderScene = {
	tree: [
		OP,SUBTR,
		CYLINDER,0, CYLINDER,1, // primitives
	],
	cylinders: [
		0,90,0,0, 90,0,0,0
	],
};

//     union
//    /     \
//  sph0   sph1
export const unionScene = {
	tree: [
		OP,UNION,
		SPHERE,0, SPHERE,1, // primitives
	],
	spheres: [-0.3,0,0,0.6, 0.3,0,0,0.6],
};

//     union
//    /     \
//  box0   box1
export const unionBoxScene = {
	tree: [
		OP,UNION,
		BOX,0, BOX,3, // primitives
	],
	boxes: [
		-0.25,0,0,0, 0.5,0.5,0.5,0, 45,45,45,0, // origin, size, rotation
		 0.25,0,0,0, 0.6,0.6,0.6,0, 0,0,0,0,
	],
};

//     inter
//    /     \
//  box0   box1
export const interBoxScene = {
	tree: [
		OP,INTER,
		BOX,0, BOX,3, // primitives
	],
	boxes: [
		-0.25,0,0,0, 0.5,0.5,0.5,0, 45,45,45,0, // origin, size, rotation
		 0.25,0,0,0, 0.6,0.6,0.6,0, 0,0,0,0,
	],
};

//     subtr
//    /     \
//  box0   box1
export const subtrBoxScene = {
	tree: [
		OP,SUBTR,
		BOX,0, BOX,3, // primitives
	],
	boxes: [
		-0.25,0,0,0, 0.5,0.5,0.5,0, 45,45,45,0, // origin, size, rotation
		 0.25,0,0,0, 0.6,0.6,0.6,0, 0,0,0,0,
	],
};

//     subtr
//    /     \
//  box0   box1
export const subtrBoxScene2 = {
	tree: [
		OP,SUBTR,
		BOX,0, BOX,3, // primitives
	],
	boxes: [
		 0,0,0,0,    0.5,0.5,0.5,0, 0,0,0,0, // origin, size, rotation
		 0.25,0.25,0,0, 0.5,0.5,0.5,0, 0,60,0,0,
	],
};

//     inter
//    /     \
//  sph0   sph1
export const interScene = {
	tree: [
		OP,INTER,
		SPHERE,0, SPHERE,1, // primitives
	],
	spheres: [-0.3,0,0,0.6, 0.3,0,0,0.6],
};


//     subtr
//    /     \
//  sph0   sph1
export const subtrScene = {
	tree: [
		OP,SUBTR,
		SPHERE,0, SPHERE,1, // primitives
	],
	spheres: [-0.3,0,0,0.6, 0.3,0,0,0.6],
};


//             union
//            /     \
//           /       \
//          /         \
//     union           sph2
//    /     \
//  sph0   sph1
export const unionUnionScene = {
	tree: [
		OP,UNION,
		OP,UNION, SPHERE,2,
		SPHERE,0, SPHERE,1, // primitives
	],
	spheres: [-0.3,0,0,0.6, 0.3,0,0,0.6, 0,-0.5,0,0.6],
};

//             inter
//            /     \
//           /       \
//          /         \
//     inter           sph2
//    /     \
//  sph0   sph1
export const interInterScene = {
	tree: [
		OP,INTER,
		OP,INTER, SPHERE,2,
		SPHERE,0, SPHERE,1, // primitives
	],
	spheres: [-0.3,0,0,0.6, 0.3,0,0,0.6, 0,-0.5,0,0.6],
};

//             union
//            /     \
//           /       \
//          /         \
//     union           union
//    /     \         /     \
//  sph0   sph1     sph2   sph3
export const union3Scene = {
	tree: [
		OP,UNION,
		OP,UNION, OP,UNION,
		SPHERE,0, SPHERE,1, SPHERE,2, SPHERE,3, // primitives
	],
	spheres: [-0.3,0,0,0.6, 0.3,0,0,0.6, 0,-0.3,0,0.6, 0,0.3,0,0.6],
};

//             inter
//            /     \
//           /       \
//          /         \
//     union           union
//    /     \         /     \
//  sph0   sph1     sph2   sph3
export const interUnion2Scene = {
	tree: [
		OP,INTER,
		OP,UNION, OP,UNION,
		SPHERE,0, SPHERE,1, SPHERE,2, SPHERE,3, // primitives
	],
	spheres: [-0.35,0,0,0.7, 0.35,0,0,0.7, 0,-0.35,0,0.7, 0,0.35,0,0.7],
};

//             subtr
//            /     \
//           /       \
//          /         \
//     union           union
//    /     \         /     \
//  sph0   sph1     sph2   sph3
export const subtrUnion2Scene = {
	tree: [
		OP,SUBTR,
		OP,UNION, OP,UNION,
		SPHERE,0, SPHERE,1, SPHERE,2, SPHERE,3, // primitives
	],
	spheres: [-0.3,0,0,0.6, 0.3,0,0,0.6, 0,-0.3,0,0.6, 0,0.3,0,0.6],
};

//             subtr
//            /     \
//           /       \
//          /         \
//     union           union
//    /     \         /     \
//  sph0   sph1     sph2   sph3
// export const subtrUnion2Scene = {
// 	tree: [
// 		OP,SUBTR,
// 		OP,UNION, OP,UNION,
// 		SPHERE,0, SPHERE,1, SPHERE,2, SPHERE,3, // primitives
// 	],
// 	spheres: [-0.5,0,0,1, 0.5,0,0,1, 0,-0.5,0,1, 0,0.5,0,1],
// };