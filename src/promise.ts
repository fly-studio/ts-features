/**
 * 可以异步使用的Promise
 * 
 */
class DeferredPromise {
	private _promise: Promise<any>;
	public resolve: (value?: any) => void;
	public reject: (reason?: any) => void;
	public then: any;
	public catch: any;
	constructor() {
		this._promise = new Promise<any>((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
			// assign the resolve and reject functions to `this`
			// making them usable on the class instance
			this.resolve = resolve;
			this.reject = reject;
		});
		// bind `then` and `catch` to implement the same interface as Promise
		this.then = this._promise.then.bind(this._promise);
		this.catch = this._promise.catch.bind(this._promise);
		this[Symbol.toStringTag] = 'Promise';
	}

	public promise(): Promise<any> {
		return this._promise;
	}
}

interface Promise<T> {
	done(onFulfilled: (value?: any) => any, onRejected: (reason?: any) => any): void;
	finally(callback: Function): Promise<T>;
}

Promise.prototype.done = function (onFulfilled: (value?: any) => void, onRejected: (reason?: any) => void) {
	this.then(onFulfilled, onRejected)
		.catch(function (reason) {
			// 抛出一个全局错误
			setTimeout(() => { throw reason; }, 0);
		});
};

Promise.prototype.finally = function (callback: Function) {
	let P = this.constructor;
	return this.then(
		value => P.resolve(callback()).then(() => value),
		reason => P.resolve(callback()).then(() => { throw reason; })
	);
};

/**
 * 
 * @param promiseList 
 */
function* promises(promiseList: Promise<any>[]) {
	let results = [];
	try {
		for (let p of promiseList)
 			results.push(yield p instanceof Promise);
	} catch (e) {
 		return false; //failure
	}
	return results; //success
}
/**
 * 有callback的函数，用此函数封装
 * 
 * @example
 * function c(args, callback) {callback(...)};
 * thunkify(c)(args)(callback);
 * @param fn 
 */
function thunkify(fn: Function) :Function {
	return function () {
		var args = new Array(arguments.length);
		var ctx = this;

		for (var i = 0; i < args.length; ++i) {
			args[i] = arguments[i];
		}

		return function (done) {
			var called;

			args.push(function () {
				if (called) return;
				called = true;
				done.apply(null, arguments);
			});

			try {
				fn.apply(ctx, args);
			} catch (err) {
				done(err);
			}
		}
	}
}