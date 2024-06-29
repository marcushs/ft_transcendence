import '../components/AuthenticationLoginComponent.js'
import '../components/AuthenticationRegisterComponent.js'

export default () => {
	const authentication = `
		<section class="authentication-page">		
			<div class="authentication-container">
				<div class="authentication-content">
<!--					<div class="authentication-infos">-->
<!--						<authentication-login-component></authentication-login-component>-->
						<authentication-register-component></authentication-register-component>
<!--					</div>-->
					<div class="authentication-slider">
						<div class="authentication-slider-content">
							<button-component label="Register" class="generic-btn-pink"></button-component>
						</div>
					</div>
				</div>
			</div>
		</section>
	`;

	setTimeout(() => {
		document.querySelector('.authentication-slider-content > h1').addEventListener('click', () => {
			document.querySelector('.authentication-slider-content').style.animation = 'authentication-content-slide 0.6s ease-in-out forwards';
			document.querySelector('.authentication-slider').style.animation = 'authentication-slide 0.6s ease-in-out forwards, test 0.6s ease-in-out forwards';
		});
	}, 0);

	return authentication;
}