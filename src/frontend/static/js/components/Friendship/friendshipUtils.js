export function createButtonStatusList() {
    const statusList = {
        own_profile: {
            buttons: '',
        },
        pending_sent: {
            buttons: [{
                payload: {status: 'cancel'},
                text: 'cancel',
                img: '../../../assets/cancel_icon.png',
                alt: 'cancel_friend_logo',
                class: 'cancel-friend-button',
            }]
        },
        pending_received: {
            buttons: [{
                payload: {status: 'accept'},
                text: 'accept',
                img: '../../../assets/accept_icon.png',
                alt: 'accept_friend_logo',
                class: 'accept-friend-button',
            },
            {
                payload: {status: 'decline'},
                text: 'decline',
                img: '../../../assets/cancel_icon.png',
                alt: 'decline_friend_logo',
                class: 'decline-friend-button',
            }]
        },
        mutual_friend: {
            buttons: [{ 
                payload: {status: 'remove'},
                text: 'remove',
                img: '../../../assets/cancel_icon.png',
                alt: 'remove_friend_logo',
                class: 'remove-friend-button',
            }]
        },
        not_friend: {
            buttons: [{
                payload: {status: 'add'},
                text: 'add',
                img: '../../../assets/add_friend.png',
                alt: 'add_friend_logo',
                class: 'add-friend-button',
            }]
        },
    }
    return statusList;
}