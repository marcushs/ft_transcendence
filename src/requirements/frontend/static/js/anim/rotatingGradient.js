import sleep from "../utils/sleep.js";

async function rotatingGradient(elementShouldRotate, color1, color2) {
    const element = document.querySelector(elementShouldRotate);
    let rotateAngle = 90;

    while (true) {
        if (rotateAngle === 360) {
            rotateAngle = 0;
        }
        element.style["background"] = `linear-gradient(${rotateAngle}deg, ${color1}, ${color2})`
        rotateAngle++;
        await sleep(25);
    }
}

export default rotatingGradient;