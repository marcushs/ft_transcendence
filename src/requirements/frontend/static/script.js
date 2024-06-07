const labels = document.querySelectorAll('.form-control label')
const btn = document.querySelector('.btn')

labels.forEach(label => {
    label.innerHTML = label.innerText 
        .split('')
        .map((letter, idx) => `<span style="transition-delay: ${idx * 50}ms;">${letter}</span>`)
        .join('')
})

btn.addEventListener('click', getData)

async function getData() {
    // try {
    //     const res = await fetch('http://localhost:8000/account/login');
    //     const data = await res.json();
    //     console.log(data);
    // } catch (error) {
    //     console.error('Network error:', error);
    //     // Handle the error, such as displaying an error message to the user
    // }
    const config = {
        headers: {
            'Accept': 'application/json'
        }
    }

    const res = await fetch('https://icanhazdadjoke.com/', config)

    const data = await res.json()

    console.log(data.joke)
}
