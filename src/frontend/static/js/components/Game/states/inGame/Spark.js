export default class Spark {
	constructor(x, y, angle, speed, lifeTime, startTime, radius, color) {
		this.x = x;
		this.y = y;
		this.vx = speed * Math.cos(angle) / 6;
		this.vy = speed * Math.sin(angle) / 6;
		this.lifeTime = lifeTime;
		this.startTime = startTime;
		this.age = 0;
		this.radius = radius;
		this.color = color;
	}


	update(deltaTime) {
		this.x += this.vx;
		this.y += this.vy;
		this.age = deltaTime;
	}


	isAlive() {
		return this.age < this.startTime + this.lifeTime;
	}


	draw(ctx) {
		ctx.save();
		// console.log(this.startTime + this.lifeTime - this.age)
        ctx.globalAlpha = 1 - -1 * (this.startTime + this.lifeTime - this.age); // Diminution progressive de l'opacité
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
	}
}