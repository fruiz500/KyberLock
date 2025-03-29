//functions for Drop mode, from GroupEncrypt

const headTag = [81,81,81,81,81,81,81];
const folderImg = "data:image/png;base64,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";

const keyImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAflBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////vroaSAAAAKXRSTlMAqvlwDQgFF8Ba5FKy8pWeYvVANukT1SmC7d6mucYey4h3JI5J2dAvfccPwqsAAAp5SURBVHja7MGBAAAAAICg/akXqQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYPbudE1VGAYDcFo2UUAUcRl3x+OY+7/B8+Os+jAqyJKW772GUpo0aQAAAAAAAAAAAH7zT9PQOYyjweXHcDWZMOvJajacb6N1ck3PXwGBrXZnZzwY8hPxXi3TL4/AJqfwsFlxCXqujlOsAhv42TFacSV6+znKCQy2cKKY36L3y6lPYCB/+jnnWkxU6BIYxT+PZ1wjvUmxBsyRJTOunY5GOBWaIDjOuSGrZEEg21RpbtI+xDYgl5fOuXGzJbKFMgXLFbdCj/EnkGeXTLg90ReBJLtEc7uijECKINHcPnUikMBdxtwJneA4KEA45M7EVwSFHcu23KmPM0F3gjF3LsJRoDPhigWYHHFf3InThoXYIyvQAWfCYuglNoGW7QYsyh7Z4VaFMQszcQja4q5ZoAgFpC3JPlikIa4HWpFqFkrjN9A8T0Du53trpIYbttuzaJcdQYOmInJ/OAh0JRT7+/9HhwQNObIRjgRN8EUf//6XENTPE3P385zC1UDtXGHJ/8c2CAdrlgsP/+4N0Etaq+DChtliBdQo+MHGwQqoTz5nA+EvUJfcuP3/lwFOgrVwt2yoCNFgDTyj4r9bY4K3RWywA8GbEjYaSkTe5LDZ9IjgDSMD7n8fi9E08oZMUPNHVR/oIa8sGLIFBggGK/INDgD/90lQySdbAkVilYzYFjEaBytYiGv/q26OW4HSfENvgFAliANAEeSDSpqyXWbIBpSSW5EB+N+GoC9XgMVSgh5GgP+s8BN4WT5jC0UELzKmBwwJwb8QATw3RJnwSzyhTwDhVqgl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";

fileImg.src = folderImg;

var folderKey;
var locks = [], users = [];						//locks contains public keys for all users in uint8 format, users contains the matching names
var locksSelected = [],							//only for selected users; excludes legacy users
	usersSelected = [];


//loads multiple files and processes them for encryption or decryption; adapted from https://ourcodeworld.com/articles/read/1438/how-to-read-multiple-files-at-once-using-the-filereader-class-in-javascript
function loadFiles(){
	if(learnMode.checked){
		var reply = confirm("The files you just dropped will be encrypted or decripted, and the result sent to the Downloads folder. Cancel if this is not what you want");
		if(!reply) return
	}

	let files = fileIn.files;
    let readers = [];
	let fileNames = [];

	// Abort if there were no files selected
	if(!files.length) return;
	
	//store names
	for(var i = 0; i < files.length; i++){
		fileNames.push(files[i].name)
	}

    // Store promises in array
    for(let i = 0;i < files.length;i++){
        readers.push(readFileAsArrayBuffer(files[i]));
    }
                
    // Trigger Promises
    Promise.all(readers).then((values) => {
                    // Values will be an array that contains an item
                    // with the data of every selected file
                    // ["File1 Content", "File2 Content" ... "FileN Content"]

		for(var i = 0; i < values.length; i++){

			var fileInBin = new Uint8Array(values[i]),
				fileOutName = fileNames[i];
			var isEncrypted = true;													//check that the file begins with the encrypt marker
			for(var j = 0; j < headTag.length; j++){
				if(fileInBin[j] != headTag[j]){
					isEncrypted = false;
					break
				}
			}

			if(isEncrypted){													//call encryption or decryption depending on how the file starts
				fileOutName = fileOutName.slice(0,-6);
				dropDecrypt(fileInBin,fileOutName)									//mode determined within decrypt function
			}else{
				if(locksSelected.length == 0 && !folderMode.checked){			//abort if nobody is selected and is not Folder mode
					mainMsg.style.color = 'red';
					mainMsg.textContent = 'Please select recipients before loading files to be encrypted';
					return
				}
				fileOutName = fileOutName + '.krypt';
				dropEncrypt(fileInBin,fileOutName)									//mode determined within encrypt function
			}
		}
    })
}

//makes a promise to read the binary data of a file
function readFileAsArrayBuffer(file){
	return new Promise(function(resolve,reject){
		let fr = new FileReader();

		fr.onload = function(){
			resolve(fr.result);
		};

		fr.onerror = function(){
			reject(fr);
		};

		fr.readAsArrayBuffer(file);
	});
}

//makes a key file, by encrypting an empty array in Signed mode
function makeKeyFile(){
	if(learnMode.checked){
		var reply = confirm("A new Folder Key file will be created for the currently selected users, or if one is loaded it will be updated for these users without affecting the other files. Cancel if this is not what you want");
		if(!reply) return
	}
	if(locksSelected.length == 0){
		mainMsg.textContent = 'Please select some users, and click the button again.';
		return
	}

	dropEncrypt([],'_FolderKey.krypt')		//empty input for a folder key
}

//crypto functions; similar to Signed mode in KyberLock, except that 8 bytes of sender's public key are added in order to identify this user
function dropEncrypt(fileInBin, fileOutName){
	if(!refreshKey()) return;			//check that the Key is active and stop if not

	var padding = decoyEncrypt(160);				                //results in 200 bytes
	if(!padding) return;

	startBlink(true);

	setTimeout(function(){										//delay to allow blinker to start

		var isKeyFile = (fileInBin.length == 0);				//folder key file if input is empty

		if(folderMode.checked && !isKeyFile){						//folder mode: symmetric encryption using folderKey as key
			
			if(!folderKey){
				if(!decoyMode.checked){
					mainMsg.style.color = 'red';
					mainMsg.textContent = 'To encrypt files in Folder mode, you must load an encrypted Folder Key first'
				}
				return
			}

			var	msgKey = crypto.getRandomValues(new Uint8Array(32)),					//message key for symmetric encryption
				nonce = crypto.getRandomValues(new Uint8Array(24));						//nonce so each encryption is unique; 24 bytes
			
			var msgKeyCipher = nobleCiphers.xchacha20poly1305(folderKey,nonce).encrypt(msgKey),	//message key encrypted with folder key
				cipher = nobleCiphers.xchacha20poly1305(msgKey,nonce).encrypt(fileInBin);

			var fileOutBin = concatUi8([headTag,[0],nonce,padding,msgKeyCipher,cipher]);		//start with header, a zero byte, and the nonce, next is msgKey encrypted with the folder Key, and the encrypted file data

		}else{														//single file mode: asymmetric encryption

			var recipients = new Uint8Array([locksSelected.length]),		//byte after header will be the number of recipients; array of length 1
				locksShuffle = locksSelected.slice();					//clone selected Locks array
			
			shuffle(locksShuffle);									//so encrypted keys are not always in the same order

			var	msgKey = crypto.getRandomValues(new Uint8Array(32)),					//message key for symmetric encryption
				nonce = crypto.getRandomValues(new Uint8Array(24));						//nonce so each encryption is unique; 24 bytes

			fileOutBin = concatUi8([headTag,recipients,nonce,padding]);	//global output starts with header v1, No. of recipients, 24-byte nonce, first 200 bytes of padding, which may contain a secret		
			
			if(isKeyFile){
				var cipher = new Uint8Array(0);										//empty payload for a Folder Key file
				if(folderKey) msgKey = folderKey									//if folder key is in memory, reuse it as message key
			}else{
				var cipher = nobleCiphers.xchacha20poly1305(msgKey,nonce).encrypt(fileInBin)					//main encryption event, but don't add the result yet
			}

			//now make signature of the ciphertext, to be prepended to the ciphertext. Length 3309 bytes
			var signature = noblePostQuantum.ml_dsa65.sign(myDsaKeys.secretKey, cipher);

			//for each recipient, extract the public key, make a KEM secret and extra nonce, and encrypt the message key with those encrypt the message key and add it. Notice: same nonce, but different key for each item (unless someone planted two recipients who have the same key, but then the encrypted result will also be identical).
			for (i = 0; i < locksShuffle.length; i++){
				var pubKey = locksShuffle[i].slice(0,1184);                		//1184 bytes for ML-KEM768 public key
				var secret = noblePostQuantum.ml_kem768.encapsulate(pubKey);    //object with sharedSecret and its cipherText, the sharedSecret is 32 bytes, cipherText is 1088 bytes
				var nonce2 = crypto.getRandomValues(new Uint8Array(24));        //new nonce for encrypting the message key, per recipient, 24 bytes
				var cipher2 = nobleCiphers.xchacha20poly1305(secret.sharedSecret, nonce2).encrypt(msgKey);   //48 bytes

				fileOutBin = concatUi8([fileOutBin,secret.cipherText,nonce2,cipher2]);
			}
			//all recipients done at this point; finish off by adding the signature and the encrypted file

			fileOutBin = concatUi8([fileOutBin,signature,cipher]);
		}

		//finish with messages and saving encrypted file
		mainMsg.style.color = 'green';		
		if(isKeyFile){
			folderMode.checked = true;
			folderKey = msgKey;
			makeKeyBtn.textContent = 'Update Folder Key';
			mainMsg.textContent = 'Folder Key file created; You can now encrypt files under this key';
			saveFileOut(fileOutBin,'_FolderKey.krypt')	
		}else{		
			mainMsg.textContent = 'Encryption successful. File saved to Downloads';
			saveFileOut(fileOutBin,fileOutName)
		}
	},20)
}

function dropDecrypt(fileInBin, fileOutName){
	if(!fileInBin) return;
	if(!refreshKey()) return;			//check that the Key is active and stop if not

	startBlink(false);
	
	setTimeout(function(){

		var isFolderMode = (fileInBin[headTag.length] == 0);			//zero recipients: folder mode, otherwise file by file mode

		if(isFolderMode){																//symmetric mode decryption
			if(!folderKey){
				mainMsg.style.color = 'red';
				mainMsg.textContent = 'To decrypt files encrypted in Folder mode, you must load an encrypted Folder Key first'
				return
			}

			var nonce = fileInBin.slice(headTag.length+1,headTag.length+25),			//24 bytes; there is a 0 byte right before it
				padding = fileInBin.slice(headTag.length+25,headTag.length+225),
				msgKeyCipher = fileInBin.slice(headTag.length+225,headTag.length+273),	//encrypted key, 48 bytes
				cipher = fileInBin.slice(headTag.length+273);							//rest of it; encrypted file

			if(decoyMode.checked){											//decoy decryption of the padding
				var answer = decoyDecrypt(padding);
				if(!answer) return
			}

			try{
				var msgKey = nobleCiphers.xchacha20poly1305(folderKey,nonce).decrypt(msgKeyCipher)			//decrypt the message key
			}catch{
				if(!decoyMode.checked){
					mainMsg.style.color = 'red';
					mainMsg.textContent = 'Decryption has failed'
				}
				return
			}
			
			try{
				var fileOutBin = nobleCiphers.xchacha20poly1305(msgKey,nonce).decrypt(cipher);			//main file decryption
				if(!decoyMode.checked){
					mainMsg.style.color = 'green';								//success!
					mainMsg.textContent = 'Decryption successful. File saved to Downloads'
				}
				saveFileOut(fileOutBin,fileOutName)							//download automatically
			}catch{
				if(!decoyMode.checked){
					mainMsg.style.color = 'red';
					mainMsg.textContent = 'Decryption has failed'
				}
				return
			}

		}else{																		//asymmetric mode decryption
			var	recipients = fileInBin[headTag.length],								//number of recipients. '0' reserved for folder mode
				cipherArray = new Array(recipients);

			var nonce = fileInBin.slice(headTag.length+1,headTag.length+25),		//24 bytes
				padding = fileInBin.slice(headTag.length+25,headTag.length+225),	//200 bytes
				cipherInput = fileInBin.slice(headTag.length+225);					//rest of it; contains encrypted message keys, signature, and encrypted file

			if(decoyMode.checked){												//decoy decryption of the padding
				var answer = decoyDecrypt(padding);
				if(!answer) return
			}

			//cut the rest into pieces; first the encrypted keys, then the signature and encrypted file	
			for(var i = 0; i < recipients; i++){
				cipherArray[i] = cipherInput.slice(1160*i,1160*(i+1))					//1088 bytes for encrypted KEM secret, 24 for nonce, 48 for encrypted key
			}
			var cipher = cipherInput.slice(1160*recipients);							//file after symmetric encryption; key yet to be extracted; contains signature and encrypted file

			//verify the signature of the ciphertext
			var signature = cipher.slice(0, 3309);
			cipher = cipher.slice(3309);

			var isValid = false;
			if(locksSelected.length != 0){						//senders selected in directory, try those first
				for(var i = 0; i < locksSelected.length; i++){
					var pubDsa = locksSelected[i].slice(1184);              //second part of the sender's Lock
					var isValid = noblePostQuantum.ml_dsa65.verify(pubDsa, cipher, signature);
					if(isValid){var name  = usersSelected[i]; break}
				}
			}else{												//search whole directory if no selection
				for(var name in locDir){						//include also legacy users
					if(name == 'myself'){
						isValid = noblePostQuantum.ml_dsa65.verify(myDsaKeys.publicKey, cipher, signature);
					}else{
						var thisLockStr = locDir[name][0];
						if(thisLockStr.length == 4182){
							var pubDsa = decodeBase64(thisLockStr).slice(1184);              //second part of the sender's Lock
							isValid = noblePostQuantum.ml_dsa65.verify(pubDsa, cipher, signature)
						}
					}
					if(isValid) break
				}
			}
			if(!isValid){
				if(!decoyMode.checked){
					mainMsg.textContent = 'This message was not encrypted by anyone in your directory'
				}
				return false
			}

			//Now we try decrypting each recipient until one works. Extracting the KEM shared secret will succeed in many cases, but a wrong result will fail when decrypting the encrypted message key. Put a try-catch around that instruction
			var success = false;
			for(var i = 0; i < recipients; i++){
				var cipherKEMkey = cipherArray[i].slice(0,1088),
					nonce2 = cipherArray[i].slice(1088,1112),
					cipherMsgKey = cipherArray[i].slice(1112);
	
				try{                //this will throw an error if the key is wrong   
					var KEMkey = noblePostQuantum.ml_kem768.decapsulate(cipherKEMkey,myKemKeys.secretKey);
					var msgKey = nobleCiphers.xchacha20poly1305(KEMkey,nonce2).decrypt(cipherMsgKey);
					success = true;
					break                           //done, so stop looking
				}catch{
					continue                        //go to the next value of i if it did not work
				}
			}

			if(!success && !decoyMode.checked){						//display error and bail out
				mainMsg.style.color = 'red';
				mainMsg.textContent = 'Decryption has failed';
				return
			}

			var sender = name.replace(/\$/,'former user ');				//for display

			if(cipher.length == 0){												//encrypted folder Key
				folderKey = msgKey;
				folderMode.checked = true;
				makeKeyBtn.textContent = 'Update Folder Key';
				fileImg.src = folderImg;
				fileLbl.title = "drop files to be encrypted of decrypted";
				if(!decoyMode.checked){
					mainMsg.style.color = 'green';
					mainMsg.textContent = 'Folder Key loaded. You are now set to encrypt and decrypt files from this folder. Last updated by ' + sender
				}

			}else{																//asymmetric-encrypted file
				try{
					var fileOutBin = nobleCiphers.xchacha20poly1305(msgKey,nonce).decrypt(cipher);		//file decryption
					if(!decoyMode.checked){
						mainMsg.style.color = 'green';								//success!
						mainMsg.textContent = 'Decryption successful. File saved to Downloads. Last updated by ' + sender
					}
					saveFileOut(fileOutBin,fileOutName)							//download automatically
				}catch{
					if(!decoyMode.checked){
						mainMsg.style.color = 'red';
						mainMsg.textContent = 'Decryption has failed'
					}
				}
			}
		}

	},20)						//delay to allow blinker to start
}

//to start the blinker during encryption or decryption
function startBlink(isEncrypt){
	mainMsg.style.color = '';
	mainMsg.textContent = '';
    var blinker = document.createElement('span');
    blinker.className = "blink";
    if(isEncrypt){blinker.textContent = "ENCRYPTING..."}else{blinker.textContent = "DECRYPTING..."};
    mainMsg.appendChild(blinker)
}

//to save the output file to Downloads
function saveFileOut(fileBin,name){
	if(fileBin) downloadBlob(fileBin, name, 'application/octet-stream')
}

//from StackOverflow, to download Uint8Array data as file. Usage: downloadBlob(myBinaryBlob, 'some-file.bin', 'application/octet-stream');
var downloadBlob, downloadURL;

downloadBlob = function(data, fileInName, mimeType) {
  var blob, url;
  blob = new Blob([data], {
    type: mimeType
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileInName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

downloadURL = function(data, fileInName) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileInName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
}

//updates recipient lists from entries selected in the selection element
function updateUsers(){
	var list = [];				//reset selected users and locks lists
	usersSelected = [];
	locksSelected = [];

	//make first list of selected names, some of which may be lists
	for(var i = 1; i < lockList.options.length; i++){		//skip header entry
		if(lockList.options[i].selected){
			list.push(lockList.options[i].value)
		}
	}

	//convert the entries that are themselves lists into individual names, searched recursively to allow for lists of lists
	for(var i = 0; i < list.length; i++){		
		tempNames = [];									//reset temporary list
		findAllNames(list[i]);
		usersSelected = usersSelected.concat(tempNames);		//add names within lists, recursively
	}
	usersSelected = usersSelected.filter(onlyUnique);			//remove duplicates

	for(var i = 0; i < usersSelected.length; i++){			//remove names that are not in database or are not Locks; length will change
		if(!locDir[usersSelected[i]]) usersSelected.splice(i,1);
		if(locDir[usersSelected[i]][0].length != 4182) usersSelected.splice(i,1)
	}
	
	usersSelected = usersSelected.sort();									//alphabetize

	for(var i = 0; i < usersSelected.length; i++){							//fill encrypt array
		locksSelected.push(decodeBase64(locDir[usersSelected[i]][0]))
	}
	if(myLock) locksSelected.push(myLock);										//add active user to encrypt array
	usersSelected.push('myself');
	mainMsg.style.color = '';
	mainMsg.textContent = 'Encrypting for: ' + usersSelected.join(', ')
}

//recursive search to allow lists of lists
var tempNames = [];
function findAllNames(name){
	if(locDir[name]) var content = locDir[name][0];
	if(content == null || name.charAt(0) == '$') return;							//stop also for Legacy members
	if(isBase64(content) && content.length == 4182 && content != myLockStr) {		//add single user name, excluding myself
		tempNames.push(name);
        return 
    }
    else {								//recurse lists
		var contentArray = keyDecrypt(content).split('<br>');	//lists are encrypted
		for(var i = 0; i < contentArray.length; i++){
			findAllNames(contentArray[i]);
		}
    }
}

//to remove duplicates in an array
function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

//these require the DOM elements to be defined
document.addEventListener("DOMContentLoaded", () => {
	updateUsers();
	selectFileIcon()

	folderMode.addEventListener('click', function(){
		if(!folderMode.checked){
			fileImg.src = folderImg;
			fileLbl.title = "drop files to be encrypted of decrypted"
		}else{
			selectFileIcon()
		}
	})
	function selectFileIcon(){
		if(folderMode.checked && !folderKey){
			fileImg.src = keyImg;
			fileLbl.title = "drop a Folder Key here"
		}else{
			fileImg.src = folderImg;
			fileLbl.title = "drop files to be encrypted or decrypted"
		}
	}

//add files functionality to the drop area
	fileIn.addEventListener('change',loadFiles);
	fileLbl.addEventListener('mouseover',function(){fileLbl.classList.add('dropHover')});
	fileLbl.addEventListener('mouseout',function(){fileLbl.classList.remove('dropHover')});
	fileLbl.ondragover = function(evt) {
		evt.preventDefault();
		fileLbl.classList.add('dropReady');
		fileLbl.classList.remove('dropHover')
	};
	fileLbl.ondragenter = function(evt) {
		evt.preventDefault();
		fileLbl.classList.add('dropReady');
		fileLbl.classList.remove('dropHover')
	};
	fileLbl.ondragleave = function (evt) {
		evt.preventDefault();
		fileLbl.classList.remove('dropReady');
		fileLbl.classList.remove('dropHover')
	};
	fileLbl.ondrop = function(evt) {
		evt.preventDefault();
		fileLbl.classList.remove('dropReady');
		fileLbl.classList.remove('dropHover');

		fileIn.files = evt.dataTransfer.files;

		loadFiles()
	};
})
