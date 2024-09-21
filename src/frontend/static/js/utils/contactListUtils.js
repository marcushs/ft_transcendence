import '../components/ContactComponent.js'
import { sendRequest } from './sendRequest.js';

export async function addNewContactToList(contact, is_request, is_sender) {
    const contactList = document.querySelector('.contact-list-result');
    const contactRequestList = document.querySelector('.pending-contact-list-result');
    console.log('contact list: ', contactList);
    console.log('contact request list: ', contactRequestList);
    
    
    const url = `http://localhost:8000/user/get_user/?q=${contact}`
    try {
        const data = await sendRequest('GET', url, null);
        const li = document.createElement('li');
        const user = data.message;
        let status;

        if (is_request) {
            console.log('is_sender: ', is_sender);
            if (is_sender)
                status = 'sent_requests'
            else
                status = 'received_requests'
        }
        else
            status = 'contact'
        li.innerHTML = `
        <contact-component data-user='${JSON.stringify(user)}' data-status='${status}'></contact-component>
        `; 
        if (user.status === 'online')
            li.classList.add('online-contact-status');
        else if (user.status === 'offline')
            li.classList.add('offline-contact-status');
        else if (user.status === 'away')
            li.classList.add('away-contact-status');

        if (is_request) {
            const liElements = contactRequestList.querySelectorAll('li');

            if (liElements.length > 0)
                contactRequestList.appendChild(li);
            else {
                contactRequestList.innerHTML = '';
                contactRequestList.classList.remove('no-contacts');
                contactRequestList.appendChild(li);
            }
        }
        else {
            const liElements = contactList.querySelectorAll('li');

            if (liElements.length > 0)
                contactList.appendChild(li);
            else {
                contactList.innerHTML = '';
                contactList.classList.remove('no-contacts');
                contactList.appendChild(li);
            }
        }
    } catch (error) {
        console.log('Error: ', error);
        return null;
    }
}

function manageUpdateOfContactList(is_request, user, li) {

}

export function removeContactFromList(contact) {
    const contactMenu = document.querySelector('.contact-list-menu');
    
    if (contactMenu) {
        const contactElements = document.querySelectorAll('.contact-list-menu li');
        console.log('contactElements: ', contactElements);
        contactElements.forEach(contactElement => {
            if (contactElement.firstElementChild.userData.username === contact) {
                contactElement.remove();
            }
        });
    }
}