namespace _ {
	function isSpecificValue(val) : boolean {
		return (
			/* val instanceof Buffer
			|| */ val instanceof Date
			|| val instanceof RegExp
		) ? true : false;
	}

	function cloneSpecificValue(val:any) : any {
		/* if (val instanceof Buffer) {
			let x = new Buffer(val.length);
			val.copy(x);
			return x;
		} else */ if (val instanceof Date) {
			return new Date(val.getTime());
		} else if (val instanceof RegExp) {
			return new RegExp(val);
		} else {
			throw new Error('Unexpected situation');
		}
	}

	/**
	 * Recursive cloning array.
	 */
	function deepCloneArray(arr: Array<any>) : Array<any> {
		let clone : Array<any> = [];
		arr.forEach(function (item, index) {
			if (typeof item === 'object' && item !== null) {
				if (Array.isArray(item)) {
					clone[index] = deepCloneArray(item);
				} else if (isSpecificValue(item)) {
					clone[index] = cloneSpecificValue(item);
				} else {
					clone[index] = deepExtends({}, item);
				}
			} else {
				clone[index] = item;
			}
		});
		return clone;
	}

	/**
	 * Extening object that entered in first argument.
	 *
	 * Returns extended object or false if have no target object or incorrect type.
	 *
	 * If you wish to clone source object (without modify it), just use empty new
	 * object as first argument, like this:
	 *   deepExtends({}, yourObj_1, [yourObj_N]);
	 */
	export function deepExtends(/*obj_1, [obj_2], [obj_N]*/...argv) : boolean | Object {
		if (arguments.length < 1 || typeof arguments[0] !== 'object') {
			return false;
		}

		if (arguments.length < 2) {
			return arguments[0];
		}

		let target:Object = arguments[0];

		// convert arguments to array and cut off target object
		let args:Array<any> = Array.prototype.slice.call(arguments, 1);

		let val: any, src: any, clone: any;

		args.forEach(function (obj) {
			// skip argument if isn't an object, is null, or is an array
			if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
				return;
			}

			Object.keys(obj).forEach(function (key) {
				src = target[key]; // source value
				val = obj[key]; // new value

				// recursion prevention
				if (val === target) {
					return;

					/**
					 * if new value isn't object then just overwrite by new value
					 * instead of extending.
					 */
				} else if (typeof val !== 'object' || val === null) {
					target[key] = val;
					return;

					// just clone arrays (and recursive clone objects inside)
				} else if (Array.isArray(val)) {
					target[key] = deepCloneArray(val);
					return;

					// custom cloning and overwrite for specific objects
				} else if (isSpecificValue(val)) {
					target[key] = cloneSpecificValue(val);
					return;

					// overwrite by new value if source isn't object or array
				} else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
					target[key] = deepExtends({}, val);
					return;

					// source value and new value is objects both, extending...
				} else {
					target[key] = deepExtends(src, val);
					return;
				}
			});
		});

		return target;
	}
}