export class ArraySet extends Array {
	constructor() {
		super();

	}

	push(newArr) {
		for (let i = 0; i < this.length; i++) {
			if (this.isSameArrays(this[i], newArr))
				return ;
		}

		super.push(newArr);
	}


	isSameArrays(arr1, arr2) {
		if (arr1.length !== arr2.length) return false;

		for (let i = 0; i < arr1.length; i++)
			if (arr1[i] !== arr2[i]) return false;

		return true;
	}


}