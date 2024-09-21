import '../components/ContactComponent.js'

export function addNewContactToList(contact, is_request) {
    const contactList = document.querySelector('contact-list-result');
    const contactRequestList = document.querySelector('pending-contact-list-result');

    if (contactMenuComponent) {
        const li = document.createElement('li');
        li.innerHTML = `
            <contact-component data-user='${JSON.stringify(contact)}' data-status='contacts'></contact-component>
        `;
        
        if (contact.status === 'online')
            li.classList.add('online-contact-status');
        else if (contact.status === 'offline')
            li.classList.add('offline-contact-status');
        else if (contact.status === 'away')
            li.classList.add('away-contact-status');

        if (is_request)
            contactRequestList.appendChild(li);
        else
            contactList.appendChild(li);
    }
}

export function removeContactFromList(contact) {
    const contactMenuComponent = document.querySelector('contact-menu-component');

    if (contactMenuComponent) {
        const contactElements = contactMenuComponent.contactList.querySelectorAll('contact-component');
        contactElements.forEach(contactElement => {
            if (contactElement.userData.username === contact.username) {
                contactElement.parentElement.remove();
            }
        });
    }
}