export function convertDateFormat(date) {
	const currentDate = new Date();
	const diffInMs = currentDate - date;

	const diffObj = {
		seconds: Math.floor((diffInMs / 1000) % 60),
		minutes: Math.floor((diffInMs / (1000 * 60)) % 60),
	    hours: Math.floor((diffInMs / (1000 * 60 * 60)) % 24),
	    days: Math.floor((diffInMs / (1000 * 60 * 60 * 24)) % 7)
	}

	if (diffObj.days >= 7)
		return `${date.toLocaleDateString()}`;
	if (diffObj.days >= 1)
		return `${diffObj.days}d`;
	if (diffObj.hours >= 1)
		return `${diffObj.hours}h`;
	if (diffObj.minutes >= 1)
		return `${diffObj.minutes}m`;
	return `${diffObj.seconds}s`;
}