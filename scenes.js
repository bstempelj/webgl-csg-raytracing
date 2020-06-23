// node types
const NIL    = 0x0001;
const OP     = 0x0002;
const LF     = 0x0003;

// operations
const UNION  = 0x0004;
const INTER  = 0x0005;
const SUBTR  = 0x0006;

// states
const DOBOTH = 0x0007;
const DOLEFT = 0x0008;
const DORIGHT = 0x0009;
const DONE	 = 0x0010;


//     union
//    /     \
//  sph0   sph1
export const unionScene = {
	tree: [
		OP,UNION,
		LF,0, LF,1, // primitives
	],
	spheres: [-0.5,0,0,1, 0.5,0,0,1],
};


//     inter
//    /     \
//  sph0   sph1
export const interScene = {
	tree: [
		OP,INTER,
		LF,0, LF,1, // primitives
	],
	spheres: [-0.5,0,0,1, 0.5,0,0,1],
};


//     subtr
//    /     \
//  sph0   sph1
export const subtrScene = {
	tree: [
		OP,SUBTR,
		LF,0, LF,1, // primitives
	],
	spheres: [-0.5,0,0,1, 0.5,0,0,1],
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
		OP,UNION, LF,2,
		LF,0, LF,1, // primitives
	],
	spheres: [-0.5,0,0,1, 0.5,0,0,1, 0,-0.5,0,1],
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
		OP,INTER, LF,2,
		LF,0, LF,1, // primitives
	],
	spheres: [-0.5,0,0,1, 0.5,0,0,1, 0,-0.5,0,1],
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
		LF,0, LF,1, LF,2, LF,3, // primitives
	],
	spheres: [-0.5,0,0,1, 0.5,0,0,1, 0,-0.5,0,1, 0,0.5,0,1],
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
		LF,0, LF,1, LF,2, LF,3, // primitives
	],
	spheres: [-0.5,0,0,1, 0.5,0,0,1, 0,-0.5,0,1, 0,0.5,0,1],
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
		LF,0, LF,1, LF,2, LF,3, // primitives
	],
	spheres: [-0.5,0,0,1, 0.5,0,0,1, 0,-0.5,0,1, 0,0.5,0,1],
};