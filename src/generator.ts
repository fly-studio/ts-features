namespace _ {
	/**
	 * 第一个next就可以传递值
	 * let generator = function* (args) {
	 * 	let a = yeild;
	 * }
	 * wrapper(generator)(args)->next('some');
	 * 
	 * @param generatorFunction 
	 */
	export function wrapper(generatorFunction: GeneratorFunction): Function {
		return function (...args) {
			let generatorObject: Generator = generatorFunction(...args);
			generatorObject.next();
			return generatorObject;
		};
	}

	/**
	 * Object 可以被 for of 遍历
	 * let jane = { first: 'Jane', last: 'Doe' };
	 * jane[Symbol.iterator] = objectEntries;
	 * for (let [k, v] of jane) {}
	 */
	export function* objectEntries() {
		let propKeys: string[] = Object.keys(this);
		for (let propKey of propKeys) {
			yield [propKey, this[propKey]];
		}
	}

	/**
	 * 以同步的方式，运行异步的generator 
	 * yield 必须是 Promise 对象
	 * 
	 * @example 同步得到一个ajax的数据 (因为ajax本身就是promise对象)
	 * _.asyncRun(function* (){yield ajax('http://...')}).then(v => alert);
	 * @example 同步得到执行完毕所有promise
	 * _.asyncRun(_.promises([ajax(1), ajax(2), ...])).then(list => list.map( v => alert);
	 * 
	 * @param generator 
	 */
	export function asyncRun(generator: GeneratorFunction) {
		const it: Generator = generator();

		function go(result) {
			if (result.done) return result.value;

			return result.value.then(
				(value: any) => go(it.next(value)),
				(error: any) => go(it.throw(error))
			);
		}

		return go(it.next());
	}
}
