import '../../components/ContactComponent.js'
import getProfileImage from '../../utils/getProfileImage.js';
import {getString} from "../../utils/languageManagement.js";

export async function UpdateChatroomTopBarWebsocket(contactJSON, change_info, old_value) {
    const chatroomTopBar = document.querySelector('chatroom-top-bar');
    const contact = JSON.parse(contactJSON)
    
    if (chatroomTopBar) {
        const targetUsername = chatroomTopBar.querySelector('.chatroom-top-bar-username')
        if (change_info === 'username') {
            if (targetUsername.textContent === old_value) {
                targetUsername.textContent = contact.username;
            }
        } else if (change_info === 'picture') {
            if (targetUsername.textContent === contact.username) {
                const chatroomProfilePicture = chatroomTopBar.querySelector('.chatroom-profile-picture');
                const newProfilePictureUrl = await getProfileImage(contact);
                
                chatroomProfilePicture.style.background = `no-repeat center/100% url('${newProfilePictureUrl}')`;
            }
        } else {
            if (targetUsername.textContent === contact.username) {
                const statusCircle = chatroomTopBar.querySelector('.chat-status-circle');
                const statusText = chatroomTopBar.querySelector('.chat-contact-name-status p:nth-child(2)')
                if (old_value === 'online') {
                    statusCircle.classList.remove('online');
                    statusText.classList.remove('online');
                }
                else if (old_value === 'away') {
                    statusCircle.classList.remove('away');
                    statusText.classList.remove('away');
                }
                else {
                    statusCircle.classList.remove('offline');
                    statusText.classList.remove('offline');
                }
                statusCircle.classList.add(`${contact.status}`);
                statusText.classList.add(`${contact.status}`);
                statusText.innerText = getString(`contactComponent/${contact.status}Status`);
            }
        }
    }
}
