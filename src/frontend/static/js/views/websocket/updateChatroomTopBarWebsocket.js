import '../../components/ContactComponent.js'
import { sendRequest } from '../../utils/sendRequest.js';
import getProfileImage from '../../utils/getProfileImage.js';

export async function UpdateChatroomTopBarWebsocket(contactJSON, change_info, old_value) {
    const chatroomTopBar = document.querySelector('chatroom-top-bar');
    const contact = JSON.parse(contactJSON)
    console.log('change_info: ', change_info);
    
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
                console.log(`old_status = ${old_value}`);
                console.log(`new_status = ${contact.status}`);
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
                statusText.innerText = `${contact.status}`;
            }
        }
    }
}
