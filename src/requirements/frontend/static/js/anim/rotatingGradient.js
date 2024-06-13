async function rotatingGradient(elementShouldRotate) {
    const element = document.querySelector(elementShouldRotate);
    const before = window.getComputedStyle(element, ':before');
    let rotateAngle = 90;

    while (true) {
        if (rotateAngle === 360) {
            rotateAngle = 0;
        }
        element.style["background"] = `linear-gradient(${rotateAngle}deg, #FF16C6, #00D0FF)`
        rotateAngle++;
        await sleep(25);
    }
}

function sleep(sleepDuration) {
    return new Promise(resolve => setTimeout(resolve, sleepDuration));
}

export default rotatingGradient;