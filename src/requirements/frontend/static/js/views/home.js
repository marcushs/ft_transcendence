import "../components/NavBar.js"
import typeAndReplaceWords from "../anim/typeAndReplaceWords.js";

export default () => {
	const homePage = `
	    <nav-bar></nav-bar>
	`;

	setTimeout(() =>{
		typeAndReplaceWords();
	}, 0);

	return homePage;
}
