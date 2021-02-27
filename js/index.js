
var video = null;
var canvas = null;
var photo = null;
var detectorText = null;

var resultArea = null;

var recordStartBtn = null;
var recordStopBtn = null;
var resultSaveBtn = null;
var resultCloseBtn = null;

var isRecording = false;

var resultPNG = null;

function initVideo() {
    navigator.mediaDevices.getUserMedia({video: true})
        .then(function (stream) {
            video.srcObject = stream;
        })
        .catch(function (err) {
            console.log(err);
        });
}

function takePicture() {
    isRecording = false;
    recordStartBtn.style.display = "block";
    recordStopBtn.style.display = "none";

    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    resultPNG = canvas.toDataURL('image/png');
    photo.setAttribute('src', resultPNG);

    resultSaveBtn.href = resultPNG;
    resultSaveBtn.download = "YourPhoto.png";
    resultArea.style.display = "block";
}

function onRecordStartBtn() {
    isRecording = true;
    recordStartBtn.style.display = "none";
    recordStopBtn.style.display = "block";
}

function onStopRecordBtn() {
    isRecording = false;
    recordStartBtn.style.display = "block";
    recordStopBtn.style.display = "none";
    detectorText.innerHTML = "";
}

function onResultCloseBtn() {
    resultArea.style.display = "none";
    detectorText.innerHTML = "";
}

function onResultSaveBtn() {

}

window.onload = function() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    resultArea = document.getElementById('result-area');
    detectorText = document.getElementById('detector-text');

    recordStartBtn = document.getElementById('record-start-btn');
    recordStartBtn.addEventListener('click', function(event) {
        onRecordStartBtn();
    });

    recordStopBtn = document.getElementById('record-stop-btn');
    recordStopBtn.addEventListener('click', function(event) {
        onStopRecordBtn();
    });

    resultCloseBtn = document.getElementById('result-close-btn');
    resultCloseBtn.addEventListener('click', function(event) {
        onResultCloseBtn();
    });

    resultSaveBtn = document.getElementById('result-save-btn');
    resultSaveBtn.addEventListener('click', function(event) {
        onResultSaveBtn();
    });

    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('mobile-computing-cheese/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('mobile-computing-cheese/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('mobile-computing-cheese/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('mobile-computing-cheese/models'),
    ]).then(initVideo);

    video.addEventListener('play', () => {

        canvas.setAttribute('width', video.videoWidth);
        canvas.setAttribute('height', video.videoHeight);

        setInterval(async () => {
            if(!isRecording) {
                return
            }

            const faces = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            /*const drawableFaces = faceapi.resizeResults(faces, {
                width: video.width,
                height: video.height,
            })
            faceapi.draw.drawDetections(canvas, drawableFaces)
            faceapi.draw.drawFaceExpressions(canvas, drawableFaces)*/

            if(faces.length < 1)
                return;

            var everybodySmiling = true;
            var smileCount = 0;

            for(var i = 0; i < faces.length; i++) {
                console.log(faces[i].expressions.happy);
                if(faces[i].expressions.happy < 0.95) {
                    everybodySmiling = false;
                    continue;
                }
                smileCount++;
            }

            detectorText.innerHTML = faces.length.toString() + " Gesichter wurden erkannt <br>"
                + smileCount.toString() + " davon sind am lächeln";


            if(everybodySmiling && isRecording) {
                takePicture();
            }
        })
    });
}
