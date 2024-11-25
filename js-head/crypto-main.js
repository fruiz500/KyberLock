//function that starts it all when the Decrypt button is pushed
function lock(lockBoxHTML,plainText){
    blinkMsg(mainMsg);
    setTimeout(function(){																			//the rest after a 10 ms delay
        Encrypt_Single(lockBoxHTML,plainText);
        updateButtons()
    },10);
}

//function that starts it all when the Decrypt button is pushed
function unlock(type,cipherText,lockBoxHTML){
    blinkMsg(mainMsg);
    setTimeout(function(){																			//the rest after a 10 ms delay
        Decrypt_Single(type,cipherText,lockBoxHTML);
        updateButtons()
    },10);
}

//Encryption process: determines the kind of encryption by looking at the radio buttons and check boxes under the main box and the length of the presumed Lock
//This function handles short mode encryption only (no List). Otherwise, Encrypt_List() is called
function Encrypt_Single(lockBoxItem,text){
    callKey = 'encrypt';
    if(lockBoxItem == ""){
        mainMsg.textContent = 'You must select a stored Lock or shared Key, or click Edit and enter one.';
        return
    }

    if(lockBoxItem.length > 500 && !isBase64(lockBoxItem)){		//special mode for long keys
        padEncrypt(text);
        return
    }

    var listArray = lockBoxItem.replace(/<div>/g,'<br>').replace(/<\/div>/g,'').split('<br>');		//see if this is actually several Locks rather than one

    var lockBoxNoVideo = listArray[0].trim(),					//strip video URL, if any
        LockStr = replaceByItem(lockBoxNoVideo);				//if it's the name of a stored item, use the decrypted item instead, if not and it isn't a Lock, there will be a warning. This function removes tags and non-base64 chars from true Locks only
        name = lockBoxNoVideo;

    if(LockStr.split('~').length == 4 || LockStr.split('~').length == 5){				//key is four strings separated by tildes, plus maybe a number: human-computable encryption
        lockBox.textContent = LockStr;
        humanEncrypt(text,true);
        return
    }

    //if none of the special cases, continue in Encrypt_List function
    Encrypt_List(listArray,text);
    return
}

//to concatenate a few Uint8Arrays fed as an array
function concatUi8(arrays) {
	var totalLength = 0;
	for(var i = 0; i < arrays.length; i++) totalLength += arrays[i].length;
	
	var result = new Uint8Array(totalLength);
  
	var length = 0;
	for(var i = 0; i < arrays.length; i++) {
	  result.set(arrays[i], length);
	  length += arrays[i].length;
	}
	return result
}

//just to shuffle the array containing the recipients' Locks so no one can tell the order
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a
}

//encrypts for a list of recipients. First makes a 256-bit message key, then gets the Lock or shared Key for each recipient and encrypts the message key with it
function Encrypt_List(listArray,text){
    var lengthLimit = 71000;
    if(mainBox.textContent.length > lengthLimit){
        var agree = confirm("This item is too long to be transmited in an email body and may be clipped by the server, rendering it undecryptable. We suggest to cancel and encrypt to file instead, then attach the file to your email");
        if(!agree) return
    }
    var warningList = "";
    for (var index = 0; index < listArray.length; index++){		//scan lines and pop a warning if some are not names on DB or aren't Locks
        var name = listArray[index].trim();
        if (name.slice(0,4) == 'http') {
            listArray[index] = '';
            name = ''
        }
        if (name != ''){
            var index2 = searchStringInArrayDB(name,lockNames);
            if(index2 < 0){				//not on database; see if it's a Lock, and if not add to warning list
                var namestr = stripTags(name);
                if(namestr.length != 4182){
                    if (warningList == ""){warningList = name} else {warningList += '\n' + name}
                }
            }
        }
    }
    listArray = listArray.filter(Boolean);												//remove empty elements
    listArray = shuffle(listArray);														//shuffle recipients for extra precaution
    var recipients = listArray.length;

    if ((warningList != '') && (recipients > 1)){
        var agree = confirm('The names on the list below were not found in your local directory. If you click OK, they will be used as shared Keys for encrypting and decrypting the message. This could be a serious security hazard:\n\n' + warningList);
        if (!agree) return
    }

    if(recipients == 0){
        mainMsg.textContent = 'No valid recipients for this mode';
        return
    }else if(recipients > 255){
        mainMsg.textContent = 'Maximum number of recipients is 255';
        return
    }

    var	msgKey = crypto.getRandomValues(new Uint8Array(32)),
        nonce = crypto.getRandomValues(new Uint8Array(24)),
        isChatInvite = text.slice(-44,-43) == '?' && !text.slice(43).match(/[^A-Za-z0-9+\/?]/);			//detect chat invitation, for final display
    if (anonMode.checked) {
        if(learnMode.checked){
            var reply = confirm("The contents of the main box will be anonymously encrypted with the Locks of the recipients listed, so that all of them can read it with their respective Keys, and the result will replace the main box. You will not be able to decrypt it unless you also select 'myself' on the list. Cancel if this is not what you want.");
            if(!reply) return
        }
        var outArray = new Uint8Array(2);
        outArray[0] = 0;												//will become "A" in base64
        outArray[1] = recipients

    } else if(onceMode.checked){
        if(learnMode.checked){
            var reply = confirm("The contents of the main box will be encrypted in Read-once mode with the Locks of the recipients listed, so that all of them can read it with their respective Keys, and the result will replace the main box. It will not encrypt for yourself. Cancel if this is not what you want.");
            if(!reply) return
        }
        var outArray = new Uint8Array(2);
        outArray[0] = 56;												//will become "O" in base64
        outArray[1] = recipients
    } else {                            //Signed mode
        if(learnMode.checked){
            var reply = confirm("The contents of the main box will be encrypted with the Locks of the recipients listed and signed with your Key, so that all of them can read it by supplying your Lock, and the result will replace the main box. You will not be able to decrypt it unless you also select 'myself' on the list. Cancel if this is not what you want.");
            if(!reply) return
        }
        var outArray = new Uint8Array(2);
        outArray[0] = 72;												//will become "S" in base64
        outArray[1] = recipients
    }

//make padding for all modes
    var padding = decoyEncrypt(160);				                //results in 200 bytes
    if(!padding) return;

    var cipher = KLencrypt(text,nonce,msgKey,true);				//main encryption event including compression, but don't add the result yet

    if(signedMode.checked || onceMode.checked){                 //make signature of the ciphertext, length 3309 bytes, to be added later
        if(!refreshKey()) return;
        var signature = noblePostQuantum.ml_dsa65.sign(myDsaKeys.secretKey, cipher);
    }

    outArray = concatUi8([outArray,nonce,padding]);

    //for each item on the List (unless empty), generate a shared secret and use it to encrypt the message key and add that, prefaced by the first 256 bits of the ciphertext obtained when the item is encrypted with the message nonce and the shared key
    for(var index = 0; index < recipients; index++){
        var name = listArray[index].trim();
        if(name != ''){
            var LockStr = replaceByItem(name);							//returns item if the name is on directory. Locks are stripped

    //if it's a Lock, do anonymous, Read-once or signed encryption, and add the result to the output. Same if, not being a Lock, Read-Once mode is selected. Shared Key case at the end of all this

            if(LockStr.length == 4182){                         //Lock is 3136 bytes, containing KEM public key + DSA public key
                var Lock = decodeBase64(LockStr);
                if(!Lock) return false
            }else{                                          //if it's a shared key, make the Lock deriving from it right now
                var Lock = noblePostQuantum.ml_kem768.keygen(wiseHash(LockStr,encodeBase64(nonce),64)).publicKey
            }

            if(anonMode.checked || signedMode.checked){
                var pubKey = Lock.slice(0,1184);                //1184 bytes for ML-KEM768 public key
                var secret = noblePostQuantum.ml_kem768.encapsulate(pubKey);    //object with sharedSecret and its cipherText, the sharedSecret is 32 bytes, cipherText is 1088 bytes
                var nonce2 = crypto.getRandomValues(new Uint8Array(24));        //new nonce for encrypting the message key, per recipient, 24 bytes
                var cipher2 = nobleCiphers.xchacha20poly1305(secret.sharedSecret, nonce2).encrypt(msgKey);   //48 bytes

            }else{         //Read-once mode
                if(locDir[name] == null){
                    if(locDir[lockMsg.textContent] != null && listArray.length == 1){
                        name = lockMsg.textContent
                    } else {
                        mainMsg.textContent = "In Read-once mode, recipients' Locks must be stored";
                        return
                    }
                }

                if(name != 'myself'){								//can't do Read-once to myself
                    var lastSeedCipher = locDir[name][1],
                    lastLockCipher = locDir[name][2],				//retrieve dummy KEM Lock from storage, [0] is the permanent Lock by that name
                    turnstring = locDir[name][3],
                    nonce2 = crypto.getRandomValues(new Uint8Array(24)),
                    nonce3 = crypto.getRandomValues(new Uint8Array(24))		//different nonces for each symmetric encryption

                if(turnstring == 'reset' || !turnstring){       //so that an initial message is seen the same as a reset mesage
                    var typeByte = [172],								//becomes 'r' in base64, reset message
                        resetMessage = true
                }else if(turnstring == 'unlock'){
                    var typeByte = [164]								//becomes 'p' in base64, out of order message
                }else{
                    var typeByte = [160]								//becomes 'o' in base64, regular message
                }

                if(lastSeedCipher && turnstring == 'unlock'){           //decrypt previous seed for out of order encryption
                    var newSeed = keyDecrypt(lastSeedCipher,true)		//actually, previous seed. keep as a byte array
                }else{
                    var newSeed = crypto.getRandomValues(new Uint8Array(64))       //to be stored so both keys can be re-generated
                }													
                
                var newPair = noblePostQuantum.ml_kem768.keygen(newSeed);

                if(lastLockCipher){										//if stored public Key exists, decrypt it first
                    var lastLock = keyDecrypt(lastLockCipher,true);
                    if(!lastLock) return
                }else{													//use permanent Lock if previous doesn't exist
                    var lastLock = Lock.slice(0,1184)               //may be made from a shared Key
                }

                var secret = noblePostQuantum.ml_kem768.encapsulate(lastLock);      //object containing KEM secret and its cipher

                var cipher2 = nobleCiphers.xchacha20poly1305(secret.sharedSecret,nonce2).encrypt(msgKey);       //encrypt message key with KEM secret

                var newLockCipher = nobleCiphers.xchacha20poly1305(secret.sharedSecret,nonce3).encrypt(newPair.publicKey)

                if(turnstring != 'unlock' || !lastSeedCipher){    //for normal and reset scenarios, new seed replaces old    
                    locDir[name][1] = keyEncrypt(newSeed)						//new Seed in base64 is stored in the permanent database, unless repeat or empty
                }

                locDir[name][3] = 'unlock'                  //set to decrypt next

                }else{
                    if(listArray.length < 2){
                        mainMsg.textContent = 'In Read-once mode, you must select recipients other than yourself.';
                        return
                    }
                }
            }

            //now add the per-recipient arrays to the output array, and go to the next recipient
            if(onceMode.checked){				//these include encrypted ephemeral Locks, not the other types
                if(name != 'myself') outArray = concatUi8([outArray,secret.cipherText,nonce3,newLockCipher,nonce2,cipher2,typeByte])  //add 1088 bytes of KEM-encrypted shared secret, plus 24 bytes of nonce, plus 2312 bytes of sym-encrypted ephemeral public key, plus anpther 24 of nonce, plus 48 of encrypted message key, plus one of Type, for a total of 2385 bytes, for each recipient
            }else{
                outArray = concatUi8([outArray,secret.cipherText,nonce2,cipher2]) //add 1088 bytes of KEM-encrypted shared secret, plus 24 bytes of nonce, plus 48 bytes encrypted message key, for each recipient, no idTags
            }
        }
    }
    //all recipients done at this point

    //finish off by adding the encrypted message and tags and encoding to base64
    if(anonMode.checked){
        var outString = encodeBase64(concatUi8([outArray,cipher])).replace(/=+$/,'');
    }else{                  //signed and read-once modes include a signature of the main ciphertext
        var outString = encodeBase64(concatUi8([outArray,signature,cipher])).replace(/=+$/,'');
    }
    
    if(includeMode.checked) outString = myLockStr + '//////' + outString;

    mainBox.textContent = '';
    if(anonMode.checked){
        if(fileMode.checked){
            var fileLink = document.createElement('a');
            fileLink.download = "LK10msa.kyb";
            fileLink.href = "data:binary/octet-stream;base64," + outString;
            fileLink.textContent = "KyberLock 1.0 Anonymous message (binary file)"
        }else{
            var fileLink = document.createElement('pre');
            fileLink.textContent = "----------begin Anonymous message encrypted with KyberLock--------==\r\n\r\n" + outString.match(/.{1,80}/g).join("\r\n") + "\r\n\r\n==---------end Anonymous message encrypted with KyberLock-----------"  
        }
    }else if(onceMode.checked){
        if(fileMode.checked){
            var fileLink = document.createElement('a');
            fileLink.download = "KL10mso.kyb";
            fileLink.href = "data:binary/octet-stream;base64," + outString;
            fileLink.textContent = "KyberLock 1.0 Read-once message (binary file)"
        }else{
            var fileLink = document.createElement('pre');
            fileLink.textContent = "----------begin Read-once message encrypted with KyberLock--------==\r\n\r\n" + outString.match(/.{1,80}/g).join("\r\n") + "\r\n\r\n==---------end Read-once message encrypted with KyberLock-----------"
        }
    }else{                      //signed mode
        if(fileMode.checked){
            var fileLink = document.createElement('a');
            fileLink.download = "KL10mss.kyb";
            fileLink.href = "data:binary/octet-stream;base64," + outString;
            fileLink.textContent = "KyberLock 1.0 Signed message (binary file)"
        }else{
            var fileLink = document.createElement('pre');
            fileLink.textContent = "----------begin Signed message encrypted with KyberLock--------==\r\n\r\n" + outString.match(/.{1,80}/g).join("\r\n") + "\r\n\r\n==---------end Signed message encrypted with KyberLock-----------"
        }
    }
    if(isChatInvite){
        if(fileMode.checked){
            var fileLink = document.createElement('a');
            fileLink.download = "KL10chat.kyb";
            fileLink.href = "data:binary/octet-stream;base64," + outString;
            fileLink.textContent = "KyberLock 1.0 Chat invitation (binary file)"
        }else{
            var fileLink = document.createElement('pre');
            fileLink.textContent = "----------begin Chat invitation encrypted with KyberLock--------==\r\n\r\n" + outString.match(/.{1,80}/g).join("\r\n") + "\r\n\r\n==---------end Chat invitation encrypted with KyberLock-----------"
        }
    }
    mainBox.appendChild(fileLink);

    if(fullAccess) localStorage[filePrefix + userName] = JSON.stringify(locDir);

    if(ChromeSyncOn && chromeSyncMode.checked){						//if Chrome sync is available, change in sync storage
        syncChromeLock(name,JSON.stringify(locDir[name]))
    }

    mainMsg.textContent = 'Encryption successful. Copy it now.'
    if (resetMessage) mainMsg.textContent = "No forward secrecy for at least one recipient, who will be warned";
    callKey = '';
}

//decryption process: determines which kind of encryption by looking at first character after the initial tag. Calls Encrypt_Single as appropriate
function Decrypt_Single(type,cipherStr,lockBoxHTML){
    callKey = 'decrypt';
    pwdMsg.textContent = "";
    mainMsg.textContent = "";

    if(cipherStr == ""){
            mainMsg.textContent = 'Nothing to encrypt or decrypt';
            return
    }

    var isCompressed = false;
    if(cipherStr.slice(4182,4188).match('//////')){	//if it has a prepended Lock
        cipherStr = extractLock(cipherStr);																		//get or enter sender
        lockBoxHTML = lockBox.innerHTML.replace(/\n/g,'<br>').trim();
        if(!cipherStr.charAt(0).match(/[gdhASO]/)){														//check for allowed types after prepended Lock and separator
            mainMsg.textContent = 'Unrecognized message format';
            return
        }
        isCompressed = true													//will be used to get the right encoding
    }

    if(lockBoxHTML.slice(0,1) == 'k') decryptItem();			//if Lock or shared Key is encrypted, decrypt it
    var name = lockMsg.textContent,
        lockBoxLines = lockBoxHTML.replace(/<div>/g,"<br>").replace(/<\/div>/g,"").split('<br>'),
        lockBoxItem = lockBoxLines[0];

    if(type == 'd' && lockBoxHTML.length > 43){padDecrypt(cipherStr);openChat();return}		//special encrypting mode for long keys

    if(type == 'h')	{															//special human encrypted mode
        lockBox.textContent = replaceByItem(lockBoxItem);
        if(lockBox.textContent.split('~').length != 4 && lockBox.textContent.split('~').length != 5){
            mainMsg.textContent = 'Please supply a Key like this: four strings plus optional integer, separated by tildes';
            return
        }
        humanEncrypt(cipherStr,false);													//when set to false the process decrypts
        return
    }

    //here detect if the message is for multiple recipients, and if so call the appropriate function
    if(type.match(/[ASO]/)){
        if(learnMode.checked){
            if(type == 'A'){
                var reply = confirm("The Anonymous message in the main box will now be decrypted. It could have been encrypted by anyone, and decrypting it won't confirm who did it.  Cancel if this is not what you want.")
            }else if(type == 'S'){
                var reply = confirm("The Signed message in the main box will now be decrypted. You will need to select the sender in the directory.  Cancel if this is not what you want.")
            }else{
                var reply = confirm("The Read-once message in the main box will now be decrypted. You will need to select the sender in the directory, and you will be asked whether you want to make the message un-decryptable immediately after successful decryption, or after replying to it.  Cancel if this is not what you want.")
            }
            if(!reply) return
        }
        Decrypt_List(type,cipherStr);
        openChat();
        return
    }

    if(type.match(/[g]/)){															//only one sender allowed in some modes
        if(lockBoxLines.length > 1){
            if(lockBoxLines[1].slice(0,4) != 'http'){
                mainMsg.textContent = "Please select a single sender";
                return
            }
        }
    }

    if(type == "k"){																//secret Key-encrypted item, such as a complete locDir database
        if(learnMode.checked){
            var reply = confirm("The message in the main box was encrypted with your secret Key, and will now be decrypted if your secret Key has been entered. If it is a database it will be placed in the Locks screen so you can merge it into the stored database. If it contains settings, they will replace your current setings, including the email/token.  Cancel if this is not what you want.");
            if(!reply) return
        }
        if(!refreshKey()) return;
        lockBox.innerHTML = decryptSanitizer(keyDecrypt(cipherStr));			//decryption step
        if(!lockBox.innerHTML) return;

        if(lockBox.textContent.trim().slice(0,6) == 'myself'){		//string contains settings; add them after confirmation
            var reply = confirm("If you click OK, the settings from the backup will replace the current settings, possibly including a random token. This cannot be undone.");
            if(!reply) return

            mergeLockDB();
            mainMsg.textContent = 'The settings have been replaced with those in this backup';
            lockBox.textContent = ''
        }else{																		//stored local directory; display so it can be edited
            setTimeout(function(){lockMsg.textContent = 'Extracted items. Click Merge to add them to the local directory.'},10);
            if(!advancedMode.checked) mode2adv();
            main2lock()
        }

    }else if(type == "g"){							//symmetric decryption
        if(learnMode.checked){
            var reply2 = confirm("The message in the main box was encrypted with a shared Key, and will now be decrypted if the same Key is present in the Locks box. The result will replace the encrypted message. Cancel if this is not what you want.");
            if(!reply2) return
        }
        var fullArray = decodeBase64(cipherStr);
        if(!fullArray) return false;
        var	nonce = fullArray.slice(1,25),								//24 bytes
            nonceStr = encodeBase64(nonce),
            cipher = fullArray.slice(25);
        if(lockBoxItem == ''){
            mainMsg.textContent = 'Enter shared Key or select the sender';
            return
        }
        lockBoxItem = replaceByItem(lockBoxItem);						//if it's a name in the box, get the real item
        var	keyStr = lockBoxItem;
        if(keyStr.length == 4182){
            var sharedKey = decodeBase64(keyStr).slice(0,32);			//sender's Lock, likely from an invitation email. use first 32 bytes
            if(!sharedKey) return false
        }else{
            var sharedKey = wiseHash(keyStr,nonceStr,32)					//real shared Key
        }

        var plain = KLdecrypt(cipher,nonce,sharedKey,isCompressed,'symmetric');			//main decryption instruction

        if(isCompressed){
            mainBox.innerHTML = decryptSanitizer(plain.trim())					//make sure non-allowed tags and attributes are disabled
        }else{
            mainBox.innerHTML = decryptSanitizer(decodeURI(plain).trim())
        }
        mainMsg.textContent = 'Decryption successful';

        if(keyStr.length == 4182){                 //additional text to accompany an invitation
            var prefaceMsg = document.createElement('div'),
                epilogueMsg = document.createElement('div');
            prefaceMsg.innerHTML = "<p>This is my message to you:</p><p>----------</p><br>";
            epilogueMsg.innerHTML = "<br><p>----------</p><p>KyberLock is now ready to encrypt your reply so that only I can decrypt it.</p><p>To do this, click <b>Clear</b>, type your message, select my name in the directory, and then click <b>Encrypt</b>. Optionally, you can select a different encryption mode at the bottom of the screen before you click the button. Then you can copy and paste it into your favorite communications program or click <b>Email</b> to send it with your default email.</p><p>If this is a computer, you can use rich formatting if you click the <b>Rich</b> button.</p>";
            mainBox.insertBefore(prefaceMsg,mainBox.firstChild);
            mainBox.appendChild(epilogueMsg)
        }

    }else{
        Encrypt_Single(lockBoxHTML,cipherStr)					//none of the known encrypted types, therefore encrypt rather than decrypt
    }
    openChat();
    callKey = ''
}

//decrypts a message encrypted for multiple recipients. Encryption can be Signed, Anonymous, or Read-once. It is possible that a shared Key has been used rather than a public Key.
function Decrypt_List(type,cipherStr){
    pwdMsg.textContent = "";
    var name = lockMsg.innerHTML,											//keep the formatting if there are several lines
        cipherInput = decodeBase64(cipherStr);
    if(!cipherInput) return false;

    if(!refreshKey()) return;                                               //make sure the keys are loaded

    var	recipients = cipherInput[1],										//number of recipients. '0' reserved for special cases
        nonce = cipherInput.slice(2,26),									//24 bytes
        padding = cipherInput.slice(26, 226);						    	//200 bytes

    cipherInput = cipherInput.slice(226);

    //now cut the rest of the input into pieces. First the individual encrypted keys etc., then the ciphertext
    var cipherArray = new Array(recipients);
    if(type != 'O'){													//shorter pieces in Anonymous and Signed modes
        for(var i = 0; i < recipients; i++){
            cipherArray[i] = cipherInput.slice(1160*i,1160*(i+1))		//1088 bytes for encripted KEM key, 24 for nonce, 48 for encrypted message key
        }
        var cipher = cipherInput.slice(1160*recipients)                 //optional signature + encrypted message
    }else{																//longer pieces in Read-once mode
        for(var i = 0; i < recipients; i++){
            cipherArray[i] = cipherInput.slice(2385*i,2385*(i+1))		//1088 for encrypted KEM key, 24 for nonce, 1200 for encrypted ephemeral public key, 24 for nonce, 48 for encrypted message key, 1 for type byte
        }
        var cipher = cipherInput.slice(2385*recipients)
    }

    var lockBoxItem = lockBox.innerHTML.replace(/\n/g,'<br>').replace(/<br>$/,"").trim().replace(/<div>/g,'<br>').replace(/<\/div>/g,'').split('<br>')[0],
        LockStr = replaceByItem(lockBoxItem);					//if it's a name, replace it with the decrypted item. Locks are stripped of their tags in any case.

    if(!locDir[name] && locDir[lockBoxItem]) name = lockBoxItem;	//name placed in the box

    if(LockStr.length == 4182){                     //turn sender's public Key to array. Lock is null if not a valid Lock
        var Lock = decodeBase64(LockStr); if(!Lock) return false
    }else if(LockStr != ''){                                          //if a shared Key, make keys derived from it
        var sharedKemKeys = noblePostQuantum.ml_kem768.keygen(wiseHash(LockStr,encodeBase64(nonce),64))
    }

    if(locDir['myself'] == null && fullAccess) key2any();							//make this entry if it has been deleted

    if(decoyMode.checked){													//decoy decryption of the padding
        var answer = decoyDecrypt(padding);
        if(!answer) return
    }

    if(!type.match(/[SAO]/)){                    //no known type, so encrypt rather than decrypt
        Encrypt_List(lockBox.innerHTML.replace(/\n/g,'<br>').replace(/<br>$/,"").trim().replace(/<div>/g,'<br>').replace(/<\/div>/g,'').split('<br>'),cipherStr);
        return
    }

    //got the encrypted message key so now decrypt it, and finally the main message. The process for Read-once modes is more involved.

//for Signed and Read-once modes, verify the signature before anything else
    if(type.match(/[SO]/)){
        var signature = cipher.slice(0, 3309);
        if(LockStr.length == 4182){   
            var pubDsa = Lock.slice(1184);              //second part of the sender's Lock
            var isValid = noblePostQuantum.ml_dsa65.verify(pubDsa, cipher.slice(3309), signature)
        }else if(LockStr == ''){    //no selected sender, so try all until one works
            var isValid = false;
            for(var name in locDir){
                if(name == 'myself'){
                    isValid = noblePostQuantum.ml_dsa65.verify(myDsaKeys.publicKey, cipher.slice(3309), signature);
                }else{
                    var thisLockStr = locDir[name][0];
                    if(thisLockStr.length == 4182){
                        var pubDsa = decodeBase64(thisLockStr).slice(1184);              //second part of the sender's Lock
                        isValid = noblePostQuantum.ml_dsa65.verify(pubDsa, cipher.slice(3309), signature)
                    }
                }
                if(isValid){LockStr = thisLockStr; break}
            }
            if(!isValid) name = 'anyone in your directory';
        }
        if(!isValid){
            mainMsg.textContent = 'This message was not encrypted by ' + name;
            return false
        }
    }

//Now we try decrypting each recipient until one works. Extracting the KEM shared secret will succeed in many cases, but a wrong result will fail when decrypting the encrypted message key. Put a try-catch around that instruction
    var success = false;
    for(var i = 0; i < recipients; i++){

        if(type == 'A' || type == 'S'){					//anonymous and signed modes

            var cipherKEMkey = cipherArray[i].slice(0,1088),
                nonce2 = cipherArray[i].slice(1088,1112),
                cipherMsgKey = cipherArray[i].slice(1112);

            try{                //this will throw an error if the key is wrong   
                if(LockStr.length == 4182 || LockStr == ''){
                    var KEMkey = noblePostQuantum.ml_kem768.decapsulate(cipherKEMkey,myKemKeys.secretKey)
                }else{
                    var KEMkey = noblePostQuantum.ml_kem768.decapsulate(cipherKEMkey,sharedKemKeys.secretKey)
                }
                var msgKey = nobleCiphers.xchacha20poly1305(KEMkey,nonce2).decrypt(cipherMsgKey);
                success = true;
                break                           //done, so stop looking
            }catch{
                continue                        //go to the next value of i if it did not work
            }

    //for Read-once mode, first we separate the different parts: KEM-enciphered key (1088 bytes), nonce for public key (24), symmetric-encrypted public key (1200), nonce for messsage key (24), symmetric-encrypted message key (48), type indicator (1)
    
        }else{                  //Read-once mode

            var cipherKEMkey = cipherArray[i].slice(0,1088),
                nonce3 = cipherArray[i].slice(1088,1112),           //for encrypted KEM public key
                cipherPub = cipherArray[i].slice(1112,2312),
                nonce2 = cipherArray[i].slice(2312,2336),           //for encrypted message key
                cipherMsgKey = cipherArray[i].slice(2336,2384),
                typeByte = cipherArray[i].slice(2384);              //array with single byte

            if(typeByte[0] == 172){													//reset directed by the message itself
                var agree = confirm('If you click OK, the current Read-once conversation with the sender will be reset. This may be OK if this is a new message, but if it is an old one the conversation will go out of sync');
                if(!agree) return;

                locDir[name][1] = locDir[name][2] = null							//if reset type, delete ephemeral data first
            }

            var seedCipher = locDir[name][1];                   //this will be null after reset and when starting

            try{
                if(seedCipher != null){                             //there is a stored seed, from previously sent message
                    var lastSeed = keyDecrypt(seedCipher,true);
                    var lastPair = noblePostQuantum.ml_kem768.keygen(lastSeed);
                    var KEMkey = noblePostQuantum.ml_kem768.decapsulate(cipherKEMkey,lastPair.secretKey)    //32 bytes

                }else{                                              //no stored seed: use permanent keys or that made from shared Key
                    if(LockStr.length == 4182){
                        var KEMkey = noblePostQuantum.ml_kem768.decapsulate(cipherKEMkey,myKemKeys.secretKey)
                    }else{
                        var KEMkey = noblePostQuantum.ml_kem768.decapsulate(cipherKEMkey,sharedKemKeys.secretKey)
                    }
                }
                var msgKey = nobleCiphers.xchacha20poly1305(KEMkey,nonce2).decrypt(cipherMsgKey);   //will fail if wrong KEM key
                var newLock = nobleCiphers.xchacha20poly1305(KEMkey,nonce3).decrypt(cipherPub);  //public key included in message
                success = true;
                locDir[name][2] = keyEncrypt(newLock);						//store the new public Key as base64 (final storage at end)
                locDir[name][3] = 'lock';                       //ready to respond
                break
            }catch{
                continue
            }
        }
    }
    //after all this, hopefully the message key has been decrypted

    //mop-up and messages
       
    if(success){
         //final decryption for the main message, plus decompression; remove signature in Signed and Read-once modes
        var plainstr = KLdecrypt((type == 'A') ? cipher : cipher.slice(3309),nonce,msgKey,true);    //ignore signature
        mainBox.innerHTML = decryptSanitizer(plainstr);										//non-whitelisted tags and attributes disabled

        if (!decoyMode.checked){
            if(typeByte){
                if(typeByte[0] == 172){
                    mainMsg.textContent = 'You have just decrypted the first message or one that resets a Read-once conversation. This message can be decrypted again, but doing so after more messages are exchanged will cause the conversation to go out of sync. It is best to delete it to prevent this possibility'
                }else{
                    setTimeout(function(){          //put on parallel branch so plaintext displays before confirm
                        //offer to delete local copy of seed to prevent further decryption
                        var agree = confirm('Decryption successful. If you click OK, this and all Read-once messages received from this sender since your last reply will become un-decryptable.\nIf you click Cancel, they will remain decryptable until you send a new Read-once message to this sender');
                        if(agree){
                            locDir[name][1] = null;
                            mainMsg.textContent = 'This message cannot be decrypted again'
                        }else{
                            mainMsg.textContent = 'This message can be decrypted until you reply to the sender in Read-once mode'
                        }
                    },0) 
                }
            }else{
                if(type == 'A'){
                    mainMsg.textContent = 'Anonymous decryption successful'
                }else if(type == 'S'){
                    if(LockStr.length == 4182 || name == 'myself'){
                        mainMsg.textContent = 'Successful decryption of message encrypted by ' + name
                    }else{
                        mainMsg.textContent = 'Successful decryption of message encrypted with shared Key'
                    }
                }
            }
        }
        if(fullAccess) localStorage[filePrefix + userName] = JSON.stringify(locDir);	//everything OK, so store
        if(ChromeSyncOn && chromeSyncMode.checked){									    //change in sync storage
            syncChromeLock(name,JSON.stringify(locDir[name]))
        }

    }else{
        if(!decoyMode.checked) mainMsg.textContent = 'Decryption has failed'
    }
    
    callKey = ''
}

//encrypts a hidden message into the padding included with list encryption, or makes a random padding also encrypted so it's indistinguishable
function decoyEncrypt(length){
    if (decoyMode.checked){
        if(learnMode.checked){
            var reply = confirm("You are adding a hidden message. Cancel if this is not what you want, then uncheck Hidden message in Options.");
            if(!reply) return false
        }
        if((decoyInBox.value.trim() == "")||(decoyText.value.trim() == "")){ 		//stop to display the decoy entry form if there is no hidden message or key
            decoyIn.style.display = "block";											//display decoy form, and back shadow
            shadow.style.display = "block";
            if(!isMobile) decoyText.focus();
            return false
        }
        var decoyKeyStr = decoyInBox.value,
            text = encodeURI(decoyText.value.replace(/%20/g,' ')),
            nonce = crypto.getRandomValues(new Uint8Array(24));

            var sharedKey = wiseHash(decoyKeyStr,encodeBase64(nonce),32);					//symmetric encryption for true shared key

        while(text.length < length) text = text + ' ';											//add spaces to make the number of characters required
        if(text.length > length) text = text.slice(0,length);									//truncate if needed
        var cipher = concatUi8([nonce,KLencrypt(text,nonce,sharedKey,false)])

    }else{
        var cipher = crypto.getRandomValues(new Uint8Array(length + 40))        //no decoy mode so padding is random; 
    }

    decoyInBox.value = "";
    decoyText.value = "";
    return cipher;
}

//decrypt the message hidden in the padding, for decoy mode
function decoyDecrypt(cipher){
    if(learnMode.checked){
        var reply = confirm("Hidden message mode is selected. If you go ahead, a dialog will ask you for the special Key or Lock for this. Cancel if this is not what you want.");
        if(!reply) return false
    }
    if (decoyOutBox.value.trim() == ""){					//stop to display the decoy key entry form if there is no key entered
        decoyOut.style.display = "block";
        shadow.style.display = "block";
        if(!isMobile) decoyOutBox.focus();
        return false
    }
    var decoyKeyStr = decoyOutBox.value;
    decoyOutBox.value = "";

    var nonce = cipher.slice(0,24),
        cipherMsg = cipher.slice(24);

    var sharedKey = wiseHash(decoyKeyStr,encodeBase64(nonce),32);

    var plain = KLdecrypt(cipherMsg,nonce,sharedKey,false,'decoy');     //it has its own error catching

    if(plain == false) plain = 'none';

    mainMsg.textContent = 'Hidden message: ' + decodeURI(plain);
    return true
}
