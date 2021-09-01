export async function shareDesktop(displayMediaConfig) {
    let stream = null;
    try {
        stream = await navigator.mediaDevices.getDisplayMedia(displayMediaConfig);
    } catch (error) {
        console.error(`getDisplayMedia Error: ${error}`);
    }
    return stream;
}

export async function videoCall(userMediaConfig) {
    let stream = null;
    try {
        stream = await navigator.mediaDevices.getUserMedia(userMediaConfig);
    } catch (error) {
        console.error(`getUserMedia Error: ${error}`);
    }
    return stream;
}