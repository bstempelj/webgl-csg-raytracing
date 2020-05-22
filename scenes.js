// node types
const NIL = 0;
const OP  = 1;
const LF  = 2;

// operations
const VIRTL = 0;
const UNION = 1;
const INTER = 2;
const SUBST = 3;

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