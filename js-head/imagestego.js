//this code is closely related to that available at https://github.com/fruiz500/passlok-stego

//clean up some junk possibly left by JPG hiding functions
localStorage.removeItem('action');
localStorage.removeItem('container');
localStorage.removeItem('method');
localStorage.removeItem('wikisafe');

// load image for hiding text and open dialog
var importImage = function (e) {
    if (learnMode.checked) {
        var reply = confirm("An image stored in this device will replace the current image. Cancel if this is not what you want.");
        if (!reply) return
    }

    var reader = new FileReader();

    reader.onload = function (event) {
        // set the preview
        previewImg.style.margin = 'auto';
        previewImg.style.display = 'block';
        previewImg.src = event.target.result
    }

    reader.readAsDataURL(e.target.files[0]);
    previewImg.onload = function(){

        updateCapacity();
        openClose('imageScr');
        openClose('shadow');
        imageBox.focus();
        
        // KILL THE LISTENER SO IT DOESN'T FIRE AFTER ENCODING
        previewImg.onload = null; 
    }
};

//show how much text can be hidden in the image
function updateCapacity() {
    var textsize = mainBox.textContent.length;
    var totalPixels = previewImg.naturalWidth * previewImg.naturalHeight;

    // PNG: 3 bits per pixel (LSB in R, G, B channels)
    var pngBytes = Math.floor((totalPixels * 3) / 8);

    // JPEG: 10% of pixels is a safe "improved F5" estimate
    var jpgBytes = Math.floor(totalPixels * 0.1);

    // Subtract overhead for the new EOF marker (48 bits = 6 bytes)
    pngBytes = Math.max(0, pngBytes - 6);
    jpgBytes = Math.max(0, jpgBytes - 6);

    // The legacy UI expects capacity in terms of base64 characters.
    // Every 4 Base64 characters = 3 bytes of binary data:
    var pngChars = Math.floor(pngBytes * (4 / 3));
    var jpgChars = Math.floor(jpgBytes * (4 / 3));

    imageMsg.style.color = '';
    imageMsg.textContent = 'This image can hide ' + pngChars + ' characters as PNG, at least ' + jpgChars + ' as JPG. The main box has ' + textsize + ' characters';
}

async function handleEncodePNG(event){
    if(event) event.preventDefault();
    
    var learnMode = document.getElementById('learnMode');
    var imageMsg = document.getElementById('imageMsg');
    var previewImg = document.getElementById('previewImg');
    var imageBox = document.getElementById('imageBox');

    if(learnMode && learnMode.checked){
        var reply = confirm("The text in the main box will be encoded into this image as a PNG, which can then be copied and sent to others. Cancel if this is not what you want.");
        if(!reply) return;
    }
    
    var payload = getUnifiedPayload();
    if(!payload){
        imageMsg.textContent = 'There is nothing to hide';
        return;
    }

    if(previewImg.src.length < 100){
        imageMsg.textContent = 'Please load an image before clicking this button';
        return;
    }

    imageMsg.style.color = '';
    if (typeof blinkMsg === 'function') blinkMsg(imageMsg);

    var rawPassword = imageBox.value.trim();
    var password = "";

    // Corrected wiseHash usage matching Privacy Bar
    if (rawPassword) {
        var stretched = wiseHash(rawPassword, '', 32);
        password = encodeBase64(stretched); 
    }

    try {
        await window.encodePNG({
            image: previewImg,
            data: payload,
            password: password,
            skipEncrypt: false,
            iterations: 1 
        });
        
        imageMsg.textContent = 'Item hidden in the image. Save it now.';
    } catch (error) {
        imageMsg.textContent = error.message || 'Error encoding image.';
    }
}

async function handleEncodeJPG(event){
    if(event) event.preventDefault();
    
    var learnMode = document.getElementById('learnMode');
    var imageMsg = document.getElementById('imageMsg');
    var previewImg = document.getElementById('previewImg');
    var imageBox = document.getElementById('imageBox');

    if(learnMode && learnMode.checked){
        var reply = confirm("The text in the main box will be encoded into this image as a JPG, which can then be copied and sent to others. Cancel if this is not what you want.");
        if(!reply) return;
    }

    var payload = getUnifiedPayload();
    if(!payload){
        imageMsg.textContent = 'There is nothing to hide';
        return;
    }

    if(previewImg.src.length < 100){
        imageMsg.textContent = 'Please load an image before clicking this button';
        return;
    }

    imageMsg.style.color = '';
    if (typeof blinkMsg === 'function') blinkMsg(imageMsg);

    var rawPassword = imageBox.value.trim();
    var password = "";

    // Corrected wiseHash usage matching Privacy Bar
    if (rawPassword) {
        var stretched = wiseHash(rawPassword, '', 32);
        password = encodeBase64(stretched); 
    }

    try {
        await window.encodeJPG({
            image: previewImg,
            data: payload,
            password: password,
            skipEncrypt: false,
            iterations: 1
        });
        imageMsg.textContent = 'Item hidden in the image. Save it now.';
    } catch (error) {
        imageMsg.textContent = error.message || 'Error encoding JPG.';
    }
}

async function handleDecodeImage(event){
    if(event) event.preventDefault();
    
    var learnMode = document.getElementById('learnMode');
    var imageMsg = document.getElementById('imageMsg');
    var previewImg = document.getElementById('previewImg');
    var imageBox = document.getElementById('imageBox');
    var mainBox = document.getElementById('mainBox');
    var mainMsg = document.getElementById('mainMsg');
    var advancedMode = document.getElementById('advancedMode');

    if(typeof isiOS !== 'undefined' && isiOS){
        imageMsg.textContent = 'On iOS, you can do PNG hide only';
        return;
    }
    if(learnMode && learnMode.checked){
        var reply = confirm("The text hidden in this image, if any, will be extracted and placed in the previous box, replacing its contents. This does not yet work on mobile devices. Cancel if this is not what you want.");
        if(!reply) return;
    }

    imageMsg.style.color = '';
    if (typeof blinkMsg === 'function') blinkMsg(imageMsg);

    var rawPassword = imageBox.value.trim();
    var password = "";

    // Corrected wiseHash usage matching Privacy Bar
    if (rawPassword) {
        var stretched = wiseHash(rawPassword, '', 32);
        password = encodeBase64(stretched); 
    }

    try {
        const result = await window.decodeImage({
            image: previewImg,
            password: password,
            skipEncrypt: false,
            iterations: 1
        });

        let extractedBytes;

        if (result && result.primary) {
            extractedBytes = result.primary;
        } else if (Array.isArray(result) && result[0] instanceof Uint8Array) {
            extractedBytes = result[0];
        } else if (result instanceof Uint8Array) {
            extractedBytes = result;
        }

        if (!extractedBytes || extractedBytes.length === 0) {
            throw new Error('Reveal failed: The payload is undefined or does not match expected extraction.');
        }

        var typeByte = extractedBytes[0];
        var payloadData = extractedBytes.subarray(1);

        if (typeByte === 0) {
            mainBox.innerHTML = decryptSanitizer(LZString.decompressFromUint8Array(payloadData));
            mainMsg.textContent = 'Text extracted from image.';
        } else if (typeByte === 1) {
            var b64 = uint8ArrayToBase64(payloadData);
            mainBox.innerHTML = decryptSanitizer(b64);
            mainMsg.textContent = 'Extraction successful. Use "Decrypt" to read.';
        } else {
            throw new Error("Unknown payload type byte: " + typeByte);
        }

        if (typeof image2main === 'function') image2main();
        imageBox.value = '';
        if (typeof updateButtons === 'function') updateButtons();
        
        if(advancedMode && advancedMode.checked && typeof main2extra === 'function'){
            main2extra();
        }

    } catch (error) {
        imageMsg.textContent = error.message || 'The image does not contain anything, or perhaps the password is wrong';
        imageBox.value = '';
    }
}

function getUnifiedPayload() {
    var mainBox = document.getElementById('mainBox');
    
    var rawContent = mainBox.textContent.trim();
    if (!rawContent) return null;

    // Clean up PassLok/KyberLock specific armoring
    var cleanContent = rawContent;
    if (cleanContent.match('==')) {
        cleanContent = cleanContent.split('==')[1].replace(/[-\s]/g,'').replace(/<(.*?)>/gi,"");
    }

    // 1. Check if it is base64 encrypted data
    var b64Regex = /^[A-Za-z0-9+/]+$/;
    if (cleanContent.length > 50 && b64Regex.test(cleanContent)) {
        try {
            var binaryData = base64ToUint8Array(cleanContent);
            var payload = new Uint8Array(binaryData.length + 1);
            payload[0] = 0x01; // 0x01: Encrypted Base64 Blob
            payload.set(binaryData, 1);
            return payload;
        } catch (e) {
            // Fall back to text mode if decoding fails
        }
    }

    // 2. TEXT MODE: Compress UTF-8 text with LZString
    var compressed = LZString.compressToUint8Array(rawContent);
    var payloadText = new Uint8Array(compressed.length + 1);
    payloadText[0] = 0x00; // 0x00: LZ-Compressed Text Marker
    payloadText.set(compressed, 1);
    
    return payloadText;
}