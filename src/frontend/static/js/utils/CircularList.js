class Node {
	constructor(value) {
		this.value = value;
		this.next = null;
	}
}

export default class CircularList {
	constructor(initArray) {
		this.head = null;
		this.init(initArray);
	}

	init(initArray) {
		const firstNode = new Node(initArray[0]);

		this.head = firstNode;

		for (let i = 1; i < initArray.length; i++) {
			const nextNode = new Node(initArray[i]);

			this.head.next = nextNode;
			this.head = nextNode;
		}

		this.head.next = firstNode;
	}

	get() {
		const ret = this.head;

		this.head = ret.next;
		return ret.value;
	}
}