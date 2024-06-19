export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export async function generateCsrfToken() {
    if (!getCookie('csrftoken')) {
        try {
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Needed for send cookie
            };
            const res = await fetch(`http://localhost:8000/account/csrf/`, config);
            if (res.status == 403)
                throw new Error('Access Denied')
            const data = await res.json();
            if (!res.ok) {
                throw new Error(`${res.status} - ${data.error}`);
            }   
            alert(data.message)
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}