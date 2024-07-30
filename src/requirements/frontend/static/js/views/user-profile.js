export default () => {
    const html = `
        <section class="users-profile-page">
            <div class="users-profile-container-background"></div>
            <div class="users-profile-container">
                <div class="user-info user-info-image">
                    <img id="profileImage" src="" alt="">
                </div>
                <div class="user-info">
                    <p id="username">Username</p>
                    <input type="text" name="username" maxlength="12" disabled>
                </div>
            </div>
        </section>
    `;

    return html;
}

        // <section class="profile-page">
        //     <nav-bar-component></nav-bar-component>
        //     <div class="profile-main-section">
        //     </div>
        // </section>