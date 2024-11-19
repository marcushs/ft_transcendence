import '../../components/ContactComponent.js'
import { sendRequest } from '../../utils/sendRequest.js';
import getProfileImage from '../../utils/getProfileImage.js';
import { getString } from '../../utils/languageManagement.js';

export function UpdateContactInList(contactJSON, change_info, old_value) {
    const contactList = document.querySelectorAll('contact-component');
    const contact = JSON.parse(contactJSON);
    
    if (contactList) {
        contactList.forEach(async contactElement => {
            const contactUsername = contactElement.querySelector('.contact-username');
            if (change_info === 'username') {
                if (contactUsername.textContent === old_value) {
                    const contactUserData = JSON.stringify({
                        ...JSON.parse(contactElement.getAttribute('data-user')),
                        username: contact.username
                    });
                    contactElement.setAttribute('data-user', contactUserData);
                    contactUsername.textContent = contact.username;
                }
            } else if (change_info === 'picture') {
                if (contactUsername.textContent === contact.username) {
                    const contactUserData = JSON.stringify({
                        ...JSON.parse(contactElement.getAttribute('data-user')),
                        profile_image: contact.profile_image,
                        profile_image_link: contact.profile_image_link
                    });
                    contactElement.setAttribute('data-user', contactUserData);
                    const contactPictureUrl = await getProfileImage(contact);
                    contactElement.querySelector('.contact-picture').src = contactPictureUrl;
                }
            } else {
                const li = contactElement.closest('li');
                const contactUserData = JSON.stringify({
                    ...JSON.parse(contactElement.getAttribute('data-user')),
                    status: contact.status,
                })
                contactElement.setAttribute('data-user', contactUserData);
                
                if (contactUsername.textContent === contact.username) {
                    const statusCircle = contactElement.querySelector('.status-circle');

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
                        contactElement.querySelector('.contact-status').textContent = getString('contactComponent/onlineStatus');
                        statusCircle.classList.add('online-status-circle');
                        li.classList.add('online-contact-status');
                    }
                    else if (contact.status === 'away') {
                        contactElement.querySelector('.contact-status').textContent = getString('contactComponent/awayStatus');
                        statusCircle.classList.add('away-status-circle');
                        li.classList.add('away-contact-status');
                    }
                    else {
                        contactElement.querySelector('.contact-status').textContent = getString('contactComponent/offlineStatus');
                        statusCircle.classList.add('offline-status-circle');
                        li.classList.add('offline-contact-status');
                    }
                }
            }
        })
    }
}

export async function addNewContactToList(contact, requestType, is_sender) {
    const url = `/api/user/get_user/?q=${contact}`
    try {
        const data = await sendRequest('GET', url, null);
        const user = data.message;
        

        if (requestType === 'new contact request') {
            manageUpdateOfContactRequestList(user, is_sender);
        } else
            manageUpdateOfContactList(user);
    } catch (error) {
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
        contactRequestList.appendChild(li);
    }  else {
        let is_inserted = false;
        const newLiUsername = user.username.toLowerCase();
        for (let i = 0; i < liElements.length; i++) {
            const actualLiUsername = liElements[i].querySelector('.contact-username').textContent.toLowerCase()
            if (newLiUsername.localeCompare(actualLiUsername) < 0) {
                contactRequestList.insertBefore(li, liElements[i]);
                is_inserted = true;
                break;
            }
            if (!is_inserted)
                contactRequestList.appendChild(li)
        }
    }
    pendingSummary.innerHTML = getString('contactMenuComponent/pendingContactsTitle') + `- ${liElements.length + 1}`;
}

function manageUpdateOfContactList(user) {
    const contactList = document.querySelector('.contact-list-result');
    let status;

    status = 'contact';
    const li = createLiForComponent(user, status)
    const liElements = contactList.querySelectorAll('li');
    if (liElements.length === 0) {
        contactList.innerHTML = '';
        contactList.classList.remove('no-contacts');
        contactList.appendChild(li);
    } else {
        let is_inserted = false;
        const newLiUsername = user.username.toLowerCase();
        for (let i = 0; i < liElements.length; i++) {
            const actualLiUsername = liElements[i].querySelector('.contact-username').textContent.toLowerCase()
            if (newLiUsername.localeCompare(actualLiUsername) < 0) {
                contactList.insertBefore(li, liElements[i]);
                is_inserted = true;
                break;
            }
            if (!is_inserted)
                contactList.appendChild(li)
        }
    }
    
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
            pendingSummary.innerHTML = `<p>${getString('contactMenuComponent/pendingContactsTitle')}</p>`;
            pendingContactList.innerHTML = getString('contactMenuComponent/noContactsRequest');
            pendingContactList.classList.add('no-contacts');
        } else {
            pendingSummary.innerHTML = `<p>${getString('contactMenuComponent/pendingContactsTitle')} - ${requestDisplayedCount}</p>`;
        }
    } else {
        const contactsList = document.querySelector('.contact-list-result')
        const contactsDisplayedCount = document.querySelectorAll('.contact-list-result li').length;

        if (contactsDisplayedCount === 0) {
            contactsList.innerHTML = getString('contactMenuComponent/noContacts');
            contactsList.classList.add('no-contacts');
        }
    }
}
