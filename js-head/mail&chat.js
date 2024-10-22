//formats results depending on tags present and sends to default email
function sendMail() {
    var type = getType(mainBox.innerHTML.trim())[0];
    if(learnMode.checked){
        if(type.match(/[lckgdhASO]/)){
            var reply = confirm("A new tab will open, including the contents of this box in your default email. You still need to supply the recipient's address and a subject line. Only Locks and encrypted or signed items are allowed. Cancel if this is not what you want.")
        }else{
            var reply = confirm("An invitation for others to join KyberLock and containing your Lock will open in your default email. You still need to supply the recipient's address.  Cancel if this is not what you want.")
        }
        if(!reply) return
    }

  if(mainBox.textContent.match("The gibberish below contains a message from me that has been encrypted with KyberLock")){			//invitation message
    var link = "mailto:"+ "?subject=Invitation to KyberLock" + "&body=" + encodeURIComponent(mainBox.textContent.trim()) + "%0D%0A%0D%0AYou can get KyberLock from https://kyberlock.com/app and other sources."
  }else{
    var hashTag = encodeURIComponent(mainBox.textContent.trim().replace(/ /g,'_'));		//item ready for link
    var linkText = "Copy it and paste it into your favorite version of KyberLock:%0D%0A%0D%0A" + hashTag;

    if(type=="A"){
        var link = "mailto:"+ "?subject= " + "&body=Anonymous message encrypted with KyberLock v.1.0 %0D%0A%0D%0ADecrypt with your secret Key.%0D%0A%0D%0A" + linkText

    }else if (type=="g" || type=="d" || type=="h"){
        var link = "mailto:"+ "?subject= " + "&body=Message encrypted with KyberLock v.1.0 %0D%0A%0D%0ADecrypt with shared Key.%0D%0A%0D%0A" + linkText

    }else if (type=="S"){
        var link = "mailto:"+ "?subject= " + "&body=Signed message encrypted with KyberLock v.1.0 %0D%0A%0D%0ADecrypt with your secret Key and my Lock.%0D%0A%0D%0A" + linkText

    }else if (type=="O"){
        var link = "mailto:"+ "?subject= " + "&body=Read-once message encrypted with KyberLock v.1.0 %0D%0A%0D%0ADecrypt with your secret Key.%0D%0A%0D%0A" + linkText

    }else if (type=="k"){
        var link = "mailto:"+ "?subject=My KyberLock database" + "&body=Database encrypted with KyberLock v.1.0 %0D%0A%0D%0ADecrypt with my secret Key.%0D%0A%0D%0A" + linkText

    }else if (type=="l"){
        var link = "mailto:"+ "?subject= " + "&body=Text sealed with KyberLock v.1.0. It is not encrypted. Extract it and verify my authorship using my Lock.%0D%0A%0D%0A" + linkText;

    }else if (type=='c'){
        var link = "mailto:"+ "?subject= My KyberLock Lock" + "&body=This email contains my KyberLock v.1.0 Lock. Use it to encrypt text or files for me to decrypt, or to verify my seal.%0D%0A%0D%0A" + linkText
    }
  }
    if(isMobile){ 	 											//new window for PC, same window for mobile
        if(isChrome && isAndroid){
            mainMsg.textContent = "Android Chrome does not allow communication with the email app"
        }else{
            window.open(link,"_parent")
        }
    }else{
        window.open(link,"_blank")
    }
}

//encrypt main box with myLock in order to make an invitation
function makeInvitation(){
    if(mainBox.textContent.trim() != ''){
        var reply = confirm('Do you want the contents of the main box to be encrypted and added to an invitation email? This will encourage the recipients to try KyberLock, but be aware that the encrypted contents WILL NOT BE SECURE.');
        if (!reply) return;
        var text = mainBox.innerHTML.trim(),
            nonce = crypto.getRandomValues(new Uint8Array(24)),
            cipherStr = myLockStr + '//////' + encodeBase64(concatUi8([[128],nonce,KLencrypt(text,nonce,myLock.slice(0,32),true)])).replace(/=+$/,'');			//this includes compression. Use the first 32 bytes of myLock as sym key
        mainBox.textContent = '';

        var prefaceMsg = document.createElement('div');
        prefaceMsg.innerHTML = "<p>The gibberish below contains a message from me that has been encrypted with KyberLock, a free app that you can get at <a href='https://KyberLock.com/app'>https://KyberLock.com/app</a> .</p><p>To decrypt it, first load the app. You will be asked to supply a secret Key, which will not be stored or sent anywhere. You must remember your secret Key, but you can change it later if you want. Then paste in the block of gibberish below. When asked whether to accept my new Lock, go ahead and give it my name, and click <b>OK</b>. Then click <b>Decrypt</b>.</p>";

        var initialTag = document.createElement('pre'),
            invBody = document.createElement('pre'),
            finalTag = document.createElement('pre');
        initialTag.textContent = "\r\n\r\n----------begin invitation message encrypted with KyberLock--------==\r\n\r\n";
        invBody.textContent = cipherStr.match(/.{1,80}/g).join("\r\n");
        finalTag.textContent = "\r\n\r\n==---------end invitation message encrypted with KyberLock-----------";
        mainBox.appendChild(prefaceMsg);
        mainBox.appendChild(initialTag);
        mainBox.appendChild(invBody);
        mainBox.appendChild(finalTag);

        updateButtons();
        mainMsg.textContent = "Invitation created. Invitations are ";
        var blinker = document.createElement('span');
        blinker.className = "blink";
        blinker.textContent = "NOT SECURELY ENCRYPTED";
        mainMsg.appendChild(blinker)

    }else{
        mainMsg.textContent = "Write something not confidential to add to the invitation, then click Invite again"
    }
}

//calls texting app
function sendSMS(){
    if(learnMode.checked){
        var reply = confirm("The default texting app will now open. You need to have copied your short encrypted message to the clipboard before doing this, if you want to send one. This only works on smartphones. Cancel if this is not what you want.");
        if(!reply) return
    }
    if(sendSMSBtn.textContent == 'Save'){
        saveFiles()
    }else{
        selectMain();
        window.open("SMS:","_parent")
    }
}

//decrypts a chat invite if found, then opens chat screen, otherwise makes one
function Chat(){
    var text = mainBox.innerHTML.trim();

    if(text.match('==') && text.split('==')[0].slice(-4) == 'chat'){		//there is already a chat invitation, so open it
        var msg = text.split('==')[1],
            type = msg.charAt(0);
        unlock(type,msg,lockBox.innerHTML.replace(/\n/g,'<br>').trim());
        return
    }

    var listArray = lockBox.innerHTML.replace(/\n/g,'<br>').trim().split('<br>').filter(Boolean);
    if(learnMode.checked){
        var reply = confirm("A special encrypted item will be made, inviting the selected recipients to a secure chat session. Cancel if this is not what you want.");
        if(!reply) return
    }

    if(listArray.length == 0 || (listArray.length == 1 && listArray[0] == 'myself')){
        mainMsg.textContent = 'Please select those invited to chat';
        return
    }
    listArray = listArray.concat('myself');								//make sure 'myself' is on the list, unless it's not a multi-recipient message
    listArray = listArray.filter(function(elem, pos, self) {return self.indexOf(elem) == pos;});  			//remove duplicates and nulls
    listArray = listArray.filter(function(n){return n});
    lockBox.innerText = listArray.join('\n');
    openClose('shadow');
    openClose('chatDialog');												//stop to get chat type
    chatDate.value = mainBox.textContent.trim().slice(0,43);
}

//continues making a chat invite after the user has chosen the chat type
function makeChat(){
    closeBox();
    if(dataChat.checked){					//A to C for Muaz Khan's WebRTC chat, D for Jitsi
        var type = 'A'
    }else if (audioChat.checked){
        var type = 'B'
    }else if (videoChat.checked){
        var type = 'C'
    }else{
        var type = 'D'
    }
    var date = chatDate.value.slice(0,43);						//can't do encodeURI here because this will be decrypted by decryptList, which doesn't expect it
    if(date.trim() == '') date = 'noDate';
    while(date.length < 43) date += ' ';
    var password = encodeBase64(crypto.getRandomValues(new Uint8Array(32))).replace(/=+$/,''),
        chatRoom = makeChatRoom();
    lock(lockBox.innerHTML.replace(/\n/g,'<br>').replace(/<br>$/,"").trim(),date + type + chatRoom + '?' + password)	//date msg + info to be sent to chat page
}

//makes a mostly anonymous chatRoom name from four words in the wordlist
function makeChatRoom(){
    var wordlist = wordListExp.toString().slice(1,-2).split('|'),
        name = '';
    for(var i = 0; i < 4; i++){
        name += capitalizeFirstLetter(replaceVariants(wordlist[randomIndex()]))
    }
    return name
}

//capitalizes first letter, the better to blend into Jitsi
function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

//returns a random index for wordlist
function randomIndex(){
    return Math.floor(Math.random()*wordLength)
}

//detects if there is a chat link in the main box, and opens the Chat window
function openChat(){
    var typetoken = mainBox.textContent.trim();
    if (typetoken.slice(-44,-43) == '?' && !typetoken.slice(43).match(/[^A-Za-z0-9+\/?]/)){			//chat data detected, so open chat
        mainBox.textContent = '';
        var date = typetoken.slice(0,43).trim(),									//the first 43 characters are for the date and time etc.
            chatToken = decodeURI(typetoken.slice(43));
        if(date != 'noDate'){
            var msgStart = "This chat invitation says:\n\n " + date + " \n\n"
        }else{
            var msgStart = ""
        }
        var reply = confirm(msgStart + "If you go ahead, the chat session will open now.\nWARNING: this involves going online, which might give away your location. If you cancel, a link for the chat will be made.");
        if(!reply){
            var chatLink = document.createElement('a');
            chatLink.href = 'https://passlok.com/chat/chat.html#' + chatToken;
            chatLink.textContent = 'Right-click to open the chat';
            mainBox.textContent = '';
            mainBox.appendChild(chatLink);
            return
        }
        if(isSafari || isIE || isiOS){
            mainMsg.textContent = 'Sorry, but chat is not yet supported by your browser or OS';
            return
        }
        main2chat(chatToken)
    }
}
