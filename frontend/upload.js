document.addEventListener('DOMContentLoaded', async function() {
    const currentUser = await window.AuthStorage.requireLoginAsync('로그인 후 이용할 수 있습니다.');
    if (!currentUser) {
        return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    || window.WASTE_API_BASE_URL    
    || localStorage.getItem('wasteApiBaseUrl')
    || 'http://127.0.0.1:8000';

    const uploadDropzone = document.getElementById('uploadDropzone');
    const fileInput = document.getElementById('fileInput');
    const mobileCameraInput = document.getElementById('mobileCameraInput');
    const imagePreview = document.getElementById('imagePreview');
    const cameraPanel = document.getElementById('cameraPanel');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraButton = document.getElementById('cameraButton');
    const fileButton = document.getElementById('fileButton');
    const captureButton = document.getElementById('captureButton');
    const closeCameraButton = document.getElementById('closeCameraButton');
    const uploadButton = document.getElementById('uploadButton');
    let selectedFile = null;
    let selectedImageData = '';
    let cameraStream = null;

    const classLabels = {
        cardboard: '종이박스',
        glass: '유리',
        metal: '금속/캔',
        paper: '종이',
        plastic: '플라스틱',
        trash: '일반쓰레기',
        unknown: '확실하지 않음'
    };

    const guideKeys = {
        cardboard: 'Cardboard',
        glass: 'Glass',
        metal: 'Can',
        paper: 'Paper',
        plastic: 'Plastic',
        trash: 'Trash',
        unknown: 'Unknown'
    };

    function closeCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(function(track) {
                track.stop();
            });
            cameraStream = null;
        }

        cameraVideo.srcObject = null;
        cameraPanel.hidden = true;
        imagePreview.hidden = false;
    }

    async function openCamera() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('이 브라우저에서는 실시간 웹캠을 지원하지 않습니다. 모바일 촬영 또는 파일 선택을 이용해주세요.');
                mobileCameraInput.click();
                return;
            }

            closeCamera();

            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: 'environment'
                    }
                },
                audio: false
            });

            cameraVideo.srcObject = cameraStream;
            cameraPanel.hidden = false;
            imagePreview.hidden = true;
        } catch (error) {
            console.error('카메라 실행 실패:', error);
            alert('카메라를 실행할 수 없습니다. 권한을 허용했는지 확인하거나 파일 선택을 이용해주세요.');
        }
    }

    function renderSelectedPreview(imageData, message) {
        imagePreview.innerHTML = `
            <img src="${imageData}" alt="선택한 쓰레기 이미지">
            <strong>${message}</strong>
            <span>업로드 버튼을 눌러 분석을 시작하세요.</span>
        `;
    }

    function previewSelectedImage(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 선택할 수 있습니다.');
            event.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('10MB 이하의 이미지를 선택해주세요.');
            event.target.value = '';
            return;
        }

        closeCamera();
        selectedFile = file;

        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImageData = e.target.result;
            renderSelectedPreview(selectedImageData, '이미지가 선택되었습니다.');
        };
        reader.readAsDataURL(file);
    }

    function capturePhoto() {
        if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {
            alert('카메라 화면이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = cameraVideo.videoWidth;
        canvas.height = cameraVideo.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(function(blob) {
            if (!blob) {
                alert('사진을 캡처하지 못했습니다.');
                return;
            }

            selectedFile = new File([blob], 'camera-photo.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now()
            });
            selectedImageData = canvas.toDataURL('image/jpeg', 0.92);
            renderSelectedPreview(selectedImageData, '사진이 촬영되었습니다.');
            closeCamera();
        }, 'image/jpeg', 0.92);
    }

    function makeAnalysisResult(prediction) {
        const predictedClass = String(prediction.class || 'unknown').toLowerCase();
        const isKnown = predictedClass !== 'unknown';
        const isRecyclable = isKnown && predictedClass !== 'trash';
        const label = prediction.name_ko || classLabels[predictedClass] || predictedClass;

        return {
            wasteType: guideKeys[predictedClass] || 'Unknown',
            className: predictedClass,
            itemName: label,
            category: label,
            recyclable: isRecyclable,
            recyclableText: isKnown ? (isRecyclable ? '재활용 가능' : '재활용 불가') : '확인 필요',
            disposalMethod: prediction.guide || '분리배출 정보를 찾을 수 없습니다.',
            confidence: prediction.confidence,
            rawPrediction: prediction
        };
    }

    async function requestPrediction() {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`AI 서버 응답 오류 (${response.status})`);
        }

        return response.json();
    }

    cameraButton.addEventListener('click', openCamera);
    fileButton.addEventListener('click', function() {
        closeCamera();
        fileInput.click();
    });
    fileInput.addEventListener('change', previewSelectedImage);
    mobileCameraInput.addEventListener('change', previewSelectedImage);
    captureButton.addEventListener('click', capturePhoto);
    closeCameraButton.addEventListener('click', closeCamera);
    uploadDropzone.addEventListener('click', function(event) {
        if (cameraPanel.hidden && imagePreview.contains(event.target)) {
            fileInput.click();
        }
    });
    window.addEventListener('beforeunload', closeCamera);

    uploadButton.addEventListener('click', async function() {
        if (!selectedFile || !selectedImageData) {
            alert('먼저 사진을 촬영하거나 파일을 선택해주세요.');
            return;
        }

        uploadButton.disabled = true;
        uploadButton.textContent = '분석 중...';

        try {
            const prediction = await requestPrediction();
            const analysisResult = makeAnalysisResult(prediction);
           
            localStorage.setItem('wasteType', analysisResult.wasteType);
            localStorage.setItem('className', analysisResult.className);
            localStorage.setItem('uploadedImage', selectedImageData);
            localStorage.setItsem('wasteAnalysisResult', JSON.stringify(analysisResult));
            localStorage.setItem('wasteUploadedImage', selectedImageData);
            window.location.href = 'result.html';
        } catch (error) {
            console.error('업로드 처리 오류:',error);
            alert(`업로드 처리 중 오류가 발생했습니다.\n\n${error.message}`);
        } finally {
            uploadButton.disabled = false;
            uploadButton.textContent = '업로드';
        }
    });
});
