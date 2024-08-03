export function createButtonStatusList() {
    const statusList = {
        own_profile: {
            class: 'hide-button',
            buttons: '',
        },
        pending_sent: {
            class: 'pending-sent-button',
            buttons: [
                { payload: {status: 'cancel'}, text: 'Cancel', imgLink: '' }
            ]
        },
        pending_received: {
            class: 'pending-received-button',
            buttons: [
                { payload: {status: 'accept'}, text: 'Accept', imgLink: '' },
                { payload: {status: 'decline'}, text: 'Decline', imgLink: '' },
            ]
        },
        mutual_friend: {
            class: 'remove-friend-button',
            buttons: [
                { payload: {status: 'remove'}, text: 'Remove', imgLink: '' }
            ]
        },
        not_friend: {
            class: 'add-friend-button',
            buttons: [
            { payload: {status: 'add'}, text: 'Add', imgLink: '' }
            ]
        },
    }
    return statusList;
}