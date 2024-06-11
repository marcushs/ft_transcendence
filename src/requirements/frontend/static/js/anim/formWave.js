const formWave = () => {
	const labels = document.querySelectorAll('.form-control label')
	// const btn = document.querySelector('.btn')
	labels.forEach(label => {
		label.innerHTML = label.innerText 
			.split('')
			.map((letter, idx) => `<span style="transition-delay: ${idx * 50}ms;">${letter}</span>`)
			.join('')
	})
}

export default formWave;

// btn.addEventListener('click', getData)
