export default () => /*html*/`
    <div class="container">
        <h1>Index</h1>
    </div>
`;

export async function HomeInit() {
    if (location.pathname === '/') {
        try {
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Needed for send cookie
            };
            const res = await fetch(`http://localhost:8000/account/`, config);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(`${res.status} - ${data.error}`);
            }
            console.log('message: ', data.message)
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}
