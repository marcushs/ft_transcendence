import '../../components/ContactComponent.js'
import { sendRequest } from '../../utils/sendRequest.js';
import getProfileImage from '../../utils/getProfileImage.js';

export function UpdateChatContactWebsocket(contactJSON, change_info, old_value) {
    const chatContactsList = document.querySelectorAll('chat-contact-component');
    const contact = JSON.parse(contactJSON)
    
    if (chatContactsList) {
        chatContactsList.forEach(async contactElement => {
            const chatContactUsername = contactElement.querySelector('.chat-contact-username')
            if (change_info === 'username') {
                if (chatContactUsername.textContent === old_value) {
                    chatContactUsername.textContent = contact.username;
                }
            } else if (change_info === 'picture') {
                if (chatContactUsername.textContent === contact.username) {
                    const chatContactProfilePicture = contactElement.querySelector('.chat-contact-profile-picture img');
                    const newContactPictureUrl = await getProfileImage(contact);
                    chatContactProfilePicture.src = `${newContactPictureUrl}`;
                }
            } else {
                if (chatContactUsername.textContent === contact.username) {
                    const statusCircle = contactElement.querySelector('.chat-status-circle');
                    if (old_value === 'online') {
                        statusCircle.classList.remove('online');
                    }
                    else if (old_value === 'away') {
                        statusCircle.classList.remove('away');
                    }
                    else {
                        statusCircle.classList.remove('offline');
                    }
                    statusCircle.classList.add(`${contact.status}`);
                }
            }
        })
    }
}
