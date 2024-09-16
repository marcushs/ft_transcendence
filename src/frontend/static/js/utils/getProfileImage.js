export default function getProfileImage(userData) {
	let profileImage;

	if (userData.profile_image)
		profileImage = `/api${userData.profile_image}`;
	else if (userData.profile_image_link)
		profileImage = userData.profile_image_link;
	else
		profileImage = userData.profile_image_anonymous;

	return profileImage;
}
