import formWave from "../anim/formWave.js";
export default () => {
	const html = `
		<div class="container">
			<h1>Signup Page</h1>
			<form>
				<div class="form-control">
					<input type="text" required>
					<label>Email</label>
				</div>
		
				<div class="form-control">
					<input type="password" required>
					<label>Password</label>
				</div>
		
				<div class="form-control">
					<input type="password" required>
					<label>Confirm password</label>
				</div>
		
				<button class="btn" type="button">Signup</button>
		
			</form>
		</div>
	`;

	setTimeout(() => {
		formWave();
	}, 0);

	return html;
}


