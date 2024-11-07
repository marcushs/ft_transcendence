import { sendRequest } from "../utils/sendRequest.js"

let pingInstance = null;
export class PingStatus {
    constructor() {
        if (pingInstance)
            return pingInstance;
        this.timeoutDuration = 60000; // 1 minute
        this.isHandlingInactivity = false;

        this.setPingTimeout(); 
        this.attachEventListener();
    }

    async setPingTimeout() {
        if (this.isHandlingInactivity)
            return;
        this.isHandlingInactivity = true;
        await this.sendPingStatus(); 
        setTimeout(() => {
            this.isHandlingInactivity = false;
        }, this.timeoutDuration);
    }

    async sendPingStatus() {
        const url = '/api/user/ping_status/';
        try {
            await sendRequest('POST', url, null);
        } catch (error) {
            console.log(error.message); 
        }
    }

    // async setOfflineStatus() {
    //     const url = '/api/user/set_offline/';
    //     console.log('ping sent to back');
    //     try {
    //         const data = await sendRequest('POST', url, null);
    //         console.log('success put offline');
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    attachEventListener() {
        window.addEventListener('mousemove', this.setPingTimeout.bind(this));
        window.addEventListener('keydown', this.setPingTimeout.bind(this));
        window.addEventListener('scroll', this.setPingTimeout.bind(this));
        window.addEventListener('click', this.setPingTimeout.bind(this));
        // window.addEventListener('beforeunload', this.setOfflineStatus.bind(this));
    }
}
