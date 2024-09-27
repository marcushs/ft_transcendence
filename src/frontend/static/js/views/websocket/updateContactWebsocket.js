import '../../components/ContactComponent.js'
import { sendRequest } from '../../utils/sendRequest.js';
import getProfileImage from '../../utils/getProfileImage.js';

export function UpdateContactInList(contactJSON, change_info, old_value) {
    const contactList = document.querySelectorAll('contact-component');
    const contact = JSON.parse(contactJSON)
    console.log('-------> CONTACT: ', contact);
    console.log('change_info: ', change_info);
    
    
    if (contactList) {
        
        contactList.forEach(async contactElement => {
            // console.log('contactElement: ', contactElement);
            // console.log(contactElement.querySelector('.contact-status'));
            const contactUsername = contactElement.querySelector('.contact-username')
            if (change_info === 'username') {
                if (contactUsername.textContent === old_value)
                    contactUsername.textContent = contact.username;
            } else if (change_info === 'picture') {
                if (contactUsername.textContent === contact.username) {
                    const contactPictureUrl = await getProfileImage(contact);
                    contactElement.querySelector('.contact-picture').src = contactPictureUrl;
                }
            } else {
                const li = contactElement.closest('li');
                console.log('new status: ', contact.status);
                console.log('old status: ', contactElement.querySelector('.contact-status').textContent);
                
                if (contactUsername.textContent === contact.username) {
                    const statusCircle = contactElement.querySelector('.status-circle');
                    contactElement.querySelector('.contact-status').textContent = contact.status;
                    if (old_value === 'online') {
                        statusCircle.classList.remove('online-status-circle');
                        li.classList.remove('online-contact-status')
                    }
                    else if (old_value === 'away') {
                        statusCircle.classList.remove('away-status-circle');
                        li.classList.remove('away-contact-status')
                    }
                    else {
                        statusCircle.classList.remove('offline-status-circle');
                        li.classList.remove('offline-contact-status')
                    }
                    if (contact.status === 'online') {
                        statusCircle.classList.add('online-status-circle');
                        li.classList.add('online-contact-status');
                    }
                    else if (contact.status === 'away') {
                        statusCircle.classList.add('away-status-circle');
                        li.classList.add('away-contact-status');
                    }
                    else {
                        statusCircle.classList.add('offline-status-circle');
                        li.classList.add('offline-contact-status');
                    }
                }
                console.log('DEBUG: STATUS UPDATED');
            }
        })
    }
}

export async function addNewContactToList(contact, requestType, is_sender) {
    const url = `http://localhost:8000/user/get_user/?q=${contact}`
    try {
        const data = await sendRequest('GET', url, null);
        const user = data.message;
        console.log('bouh');
        

        if (requestType === 'new contact request') {
            manageUpdateOfContactRequestList(user, is_sender);
        } else
            manageUpdateOfContactList(user);
    } catch (error) {
        console.log('Error: ', error);
        return null;
    }
}

function manageUpdateOfContactRequestList(user, is_sender) {
    const contactRequestList = document.querySelector('.pending-contact-list-result');
    const pendingSummary = document.querySelector('.pending-contact-summary');
    const liElements = contactRequestList.querySelectorAll('li');
    let status;

    if (is_sender)
        status = 'sent_requests'
    else
        status = 'received_requests'
    const li = createLiForComponent(user, status)
    if (liElements.length === 0) {
        contactRequestList.innerHTML = '';
        contactRequestList.classList.remove('no-contacts');
    }
    contactRequestList.appendChild(li);
    pendingSummary.innerHTML = `Contacts Requests - ${liElements.length + 1}`;
}

function manageUpdateOfContactList(user) {
    const contactList = document.querySelector('.contact-list-result');
    let status;

    status = 'contact'
    const li = createLiForComponent(user, status)
    const liElements = contactList.querySelectorAll('li');
    if (liElements.length === 0) {
        contactList.innerHTML = '';
        contactList.classList.remove('no-contacts');
    }
    contactList.appendChild(li);
    
    removeContactFromList(user.username, 'deleted contact request');
}

function createLiForComponent(user, status) {
    const li = document.createElement('li');

    li.innerHTML = `
        <contact-component data-user='${JSON.stringify(user)}' data-status='${status}'></contact-component>
    `; 
    if (user.status === 'online')
        li.classList.add('online-contact-status');
    else if (user.status === 'offline')
        li.classList.add('offline-contact-status');
    else if (user.status === 'away')
        li.classList.add('away-contact-status');
    return li;
}

export function removeContactFromList(user, requestType) {
    let listToSearch;
    
    if (requestType === 'deleted contact request') {
        listToSearch = document.querySelectorAll('.pending-contact-list-result li contact-component');
    } else {
        listToSearch = document.querySelectorAll('.contact-list-result li contact-component');
    }
    listToSearch.forEach(contact => {
        if (contact.userData.username === user) {
            contact.closest('li').remove();
        }
    });
    
    if (requestType === 'deleted contact request') {
        const pendingSummary = document.querySelector('.pending-contact-summary');
        const pendingContactList = document.querySelector('.pending-contact-list-result');
        const requestDisplayedCount = document.querySelectorAll('.pending-contact-list-result li').length;
        
        if (requestDisplayedCount === 0) {
            pendingSummary.innerHTML = `<p>Contacts Requests</p>`;
            pendingContactList.innerHTML = 'No contacts request...';
            pendingContactList.classList.add('no-contacts');
        } else {
            pendingSummary.innerHTML = `<p>Contacts Requests - ${requestDisplayedCount}</p>`;
        }
    } else {
        const contactsList = document.querySelector('.contact-list-result')
        const contactsDisplayedCount = document.querySelectorAll('.contact-list-result li').length;

        if (contactsDisplayedCount === 0) {
            contactsList.innerHTML = 'No contacts...';
            contactsList.classList.add('no-contacts');
        }
    }
}