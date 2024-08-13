export function createButtonStatusList() {
    const statusList = {
        own_profile: {
            buttons: '',
        },
        pending_sent: {
            buttons: [{
                payload: {status: 'cancel'},
                text: 'cancel request',
                img: '../../../assets/cancel_icon.png',
                alt: 'cancel_friend_logo',
                class: 'cancel-friend-button',
            }]
        },
        pending_received: {
            buttons: [{
                payload: {status: 'accept'},
                text: 'accept invitation',
                img: '../../../assets/accept_icon.png',
                alt: 'accept_friend_logo',
                class: 'accept-friend-button',
            },
            {
                payload: {status: 'decline'},
                text: 'decline invitation',
                img: '../../../assets/cancel_icon.png',
                alt: 'decline_friend_logo',
                class: 'decline-friend-button',
            }]
        },
        mutual_friend: {
            buttons: [{ 
                payload: {status: 'remove'},
                text: 'remove contact',
                img: '../../../assets/cancel_icon.png',
                alt: 'remove_friend_logo',
                class: 'remove-friend-button',
            }]
        },
        not_friend: {
            buttons: [{
                payload: {status: 'add'},
                text: 'add contact',
                img: '../../../assets/add_friend.png',
                alt: 'add_friend_logo',
                class: 'add-friend-button',
            }]
        },
    }
    return statusList;
}