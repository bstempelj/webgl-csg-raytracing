// node types
// node types
const NIL = 0x0019;
const OP  = 0x0020;
const LF  = 0x0021;

// operations
const VIRTL = 0x0022;
const UNION = 0x0023;
const INTER = 0x0024;
const SUBST = 0x0045;

//                     virtl
//                    /     \
//                   /       \
//                  /         \
//             union           nil
//            /     \
//           /       \
//          /         \
//     union           union
//    /     \         /     \
//  sph0   sph1     sph2   sph3
export const unionScene = {
	tree: [
		OP,VIRTL,
		OP,UNION, NIL,NIL,
		OP,UNION, OP,UNION, NIL,NIL, NIL,NIL,
		LF,0, LF,1, LF,2, LF,3, NIL,NIL, NIL,NIL, NIL,NIL, NIL,NIL // primitives
	],
	spheres: [-0.5,1,0,1, 0.5,1,0,1, 0,1.5,0,1, 0,0.5,0,1],
};

//                     virtl
//                    /     \
//                   /       \
//                  /         \
//             inter           nil
//            /     \
//           /       \
//          /         \
//     union           union
//    /     \         /     \
//  sph0   sph1     sph2   sph3
export const interScene = {
	tree: [
		OP,VIRTL,
		OP,INTER, NIL,NIL,
		OP,UNION, OP,UNION, NIL,NIL, NIL,NIL,
		LF,0, LF,1, LF,2, LF,3, NIL,NIL, NIL,NIL, NIL,NIL, NIL,NIL // primitives
	],
	spheres: [-0.5,1,0,1, 0.5,1,0,1, 0,1.5,0,1, 0,0.5,0,1],
};