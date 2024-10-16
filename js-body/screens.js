﻿//start blinking message, for Msg elements
function blinkMsg(element){
    element.textContent = '';
    var blinker = document.createElement('span');
    blinker.className = "blink";
    blinker.textContent = 'PROCESSING';
    element.appendChild(blinker)
}

//displays how many characters are left, in Short mode and Decoy In box
function charsLeft(){
    //for decoy message box
    if(decoyIn.style.display == 'block'){
        var chars = encodeURI(decoyText.value).replace(/%20/g,' ').length,
            limit = 160;
        if(chars <= limit){
            decoyInMsg.textContent = chars + " characters out of " + limit + " used"
        }else{
            decoyInMsg.textContent = 'Maximum length exceeded. The message will be truncated'
        }
        return
    }

    //this one is for the text in the chat making dialog
    else if(chatDialog.style.display == 'block'){
        var chars = chatDate.value.length;
        var limit = 43;
        if(chars <= limit){
            chatmsg.textContent = chars + " characters out of " + limit + " used"
        }else{
            chatmsg.textContent = 'Maximum length exceeded. The message will be truncated'
        }
        return
    }else{
        mainMsg.textContent = '';					//to clear previous errors while typing
        updateButtons()							//display button labels according to item nature
    }
}

//changes button labels according to context
function updateButtons(){
    var string = mainBox.innerHTML.trim(),
        type = getType(string)[0],
        isRecipient = !!lockBox.textContent.trim();

    if(type && type.match(/[hkdgASO]/)){
        decryptBtn.textContent = 'Decrypt';
        decryptBtnBasic.textContent = 'Decrypt';
        decryptBtnEmail.textContent = 'Decrypt';
        showLockBtn.textContent = 'Email';
        showLockBtnBasic.textContent = 'Email'
    }else if(type && type.match(/[lc]/) && isRecipient){
        decryptBtn.textContent = 'Encrypt';
        decryptBtnBasic.textContent = 'Encrypt';
        decryptBtnEmail.textContent = 'Encrypt';
        showLockBtn.textContent = 'Email';
        showLockBtnBasic.textContent = 'Email';
    }else if(isRecipient){
        decryptBtn.textContent = 'Encrypt';
        decryptBtnBasic.textContent = 'Encrypt';
        decryptBtnEmail.textContent = 'Encrypt';
        showLockBtn.textContent = 'myLock';
        showLockBtnBasic.textContent = 'myLock'
    }else{
        decryptBtn.textContent = 'Invite';
        decryptBtnBasic.textContent = 'Invite';
        decryptBtnEmail.textContent = 'Invite';
        showLockBtn.textContent = 'myLock';
        showLockBtnBasic.textContent = 'myLock'
    }
    if(type && type == 'l'){verifyBtn.textContent = 'Unseal'}else{verifyBtn.textContent = 'Seal'};

    if(string.match(/KL\d{2}p\d{3}/) || string.match(/part out of \d{3} split with KyberLock/)){			//box contains parts
        secretShareBtn.textContent = 'Join'
    }else{
        secretShareBtn.textContent = 'Split'
    }
    if(string.includes('href="data:')){sendSMSBtn.textContent = "Save"}else{sendSMSBtn.textContent = "SMS"}
}

//gets recognized type of string, if any, otherwise returns false. Also returns cleaned-up string
function getType(stringIn){
    var string = stringIn.replace(/&[^;]+;/g,'').replace(/<a(.*?).kyb" href="data:(.*?),/,'').replace(/"(.*?)\/a>/,''); 	//remove special chars, files and images
    if(string.match('==')) string = string.split('==')[1];									//remove KyberLock tags
    string = string.replace(/<(.*?)>/g,'').replace(/-/g,'').replace(/\r?\n|\r/g,'').trim();		//remove HTML tags and dashes, plus carriage returns

    var	type = string.charAt(0),
        hasLock = (string.slice(4182,4188) == '//////'),
        typeGC = string.charAt(4188),								//in case it has prepended Lock
        isBase64 = !string.match(/[^a-zA-Z0-9\+\/]/),
        isBase26 = !string.match(/[^A-Z ]/),						//spaces allowed, as in 5-letter codegroups
        isNoLock = string.length != 4182;

    if(!hasLock && type.match(/[lkgdasoprASO]/) && isBase64 && !isBase26 && isNoLock && string.length > 40){				//encrypted or signed, no Lock prepended
        return [type, string]
    }else if(hasLock && typeGC.match(/[gasoprASO]/) && isBase64 && !isBase26 && isNoLock && string.length > 40){				//encrypted, Lock prepended
        return [typeGC, string]
    }else if(!hasLock && !isNoLock && isBase64 && !isBase26 && string.length > 40){											//special type for a Lock
        return ['c'	, string]
    }else if(!hasLock && string && isBase26){																					//human-computable encrypted
        return ['h', string]
    }else{
        return [false, stringIn]																									//unrecognized type
    }
}

//start decrypt or verify if the item pasted in is recognized
function pasteMain() {
    setTimeout(function(){
        var string = mainBox.innerHTML.trim()
        if((string.replace(/<(.*?)>/g,'').slice(0,13).match(/p\d{3}/) && string.replace(/<(.*?)>/g,'').slice(0,7).match('PL')) || (string.match(/PL\d{2}p\d{3}/) && string.match('.txt'))){																//parts to be joined detected
            secretshare();
            return
        }
        var array = getType(string.replace(/<(.*?)>/g,'')),
            type = array[0],
            lockBoxHTML = lockBox.innerHTML.replace(/\n/g,'<br>').replace(/\r/g,'').replace(/<br>$/,"").trim();
        if(type && type.match(/[hkdgASO]/)){							//known encrypted type: decrypt
            unlock(type,array[1],lockBoxHTML);
            return
        }else if(type && type == 'l'){										//unseal
            verifySignature(array[1],lockBoxHTML);
            return
        }else if(type && type == 'c'){										//store new Lock
            extractLock(string)
        }
    }, 0)
}

//for showing.hiding password fields
var eyeImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAASFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACrhKybAAAAF3RSTlMA5Qyz9kEFh3rd1sjDoGsfHRKwQIp+Qzv02bEAAACJSURBVCjPvVBJEoQgDMwCAfeFmfH/P51KkFKL0qN9SXdDVngRy8joHPK4XGyJbtvhohz+3G0ndHPxp0b1mojSqqyZsk+tqphFVN6S8cH+g3wQgwCrGtT3VjhB0BB26QGgN0aAGhDIZP/wUHLrUrk5g4RT83rcbxn3WJA90Y/zgs8nqY94d/b38AeFUhCT+3yIqgAAAABJRU5ErkJggg==",
    hideImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAb1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABt6r1GAAAAJHRSTlMAFNTiDPTNBvnaulFBAe/osrGBZCXSwIdnLhzIqKd7XFRLSjAYduwyAAAAuklEQVQoz62QRxbDIAwFhWkhwb07PeH+Z4wQPMjCS89KegP6AjiWSbF9oVzBQNyNlKZZ/s+wwpvLyXlkp7P5umiIcYDIwB0ZLWzrTb3GSQYbMsjDl3wj0fj6TDmpK7F60nnLeDCW2h6rgioBVZgmwlwUJoo6bkC7KRQ9iQ/MzuWtXyjKKcTpmVc8mht4Nu5NV+Y/UAKItaY7byHsOeSkp48uQSahO+kiISfD+ha/nbcLwxwFuzB1hUP5AR4JF1hy2DV7AAAAAElFTkSuQmCC";

//this is for showing and hiding text in password input boxes
function showPwd(name){
    var pwdIn = document.getElementById(name + 'Box'),
        icon = document.getElementById(name + 'Icon');
    if(pwdIn.type=="password"){
        pwdIn.type="text";
        icon.src = hideImg
    }else{
        pwdIn.type="password";
        icon.src = eyeImg
    }
    keyStrength(pwdIn.value.trim(),name)
}

//for clearing different boxes
function clearMain(){
    mainBox.textContent = '';
    mainMsg.textContent = '';
    charsLeft()
}
function clearLocks(){
    lockBox.textContent='';
    lockMsg.textContent='';
    addLockBtn.textContent = "Rand.";
    suspendFindLock = false
}
function clearIntro(){
    pwdIntroBox.value = '';
    pwdIntroMsg.textContent = '';
    KeyStr = '';
    pwdMsg.textContent = ''
}
function clearIntroEmail(){
    emailIntro.value = ''
}

//encrypts, decrypts, or sends invite depending on main box content
function lockBtnAction(){
    var text = mainBox.innerHTML.trim();
    var array = getType(text),
        type = array[0],
        lockBoxHTML = lockBox.innerHTML.replace(/\n/g,'<br>').replace(/\r/g,'').replace(/<br>$/,"").trim();
    if(type && type.match(/[hkdgASO]/)){								//known encrypted type: decrypt
        unlock(type,array[1],lockBoxHTML)
    }else if(!!lockBoxHTML){									//recipients selected: encrypt
        lock(lockBoxHTML,text)
    }else{
        makeInvitation()													//no recipients: invite
    }
}

//for selecting the Main box contents and copying them to clipboard
function selectMain(){
  if(mainBox.textContent.trim() != ''){
    var range, selection;
    if(document.body.createTextRange){
        range = document.body.createTextRange();
        range.moveToElementText(mainBox);
        range.select()
    }else if (window.getSelection){
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(mainBox);
        selection.removeAllRanges();
        selection.addRange(range)
    }
    document.execCommand('copy');
    mainMsg.textContent = "main Box copied to clipboard"
  }
}

//writes five random dictionary words in the intro Key box
function suggestIntro(){
    var output = '',
        wordlist = wordListExp.toString().slice(1,-2).split('|')
    for(var i = 1; i <= 5 ; i++){
        output += ' ' + replaceVariants(wordlist[Math.floor(Math.random()*wordlist.length)])
    }
    pwdIntroBox.type="text";
    pwdIntroBox.value = output.trim();
    pwdIntroIcon.src = hideImg;
    keyStrength(output.trim(),'pwdIntro')
}

//launches the Intro wizard
function newUser(){
    introscr1.style.display = "block";
    BasicButtons = true
}

//shows email screen so email/token can be changed
function showEmail(){
    if(!fullAccess){
        optionMsg.textContent = 'Email change not allowed in Guest mode. Please restart KyberLock';
        return
    }
    if(isMobile) window.scrollTo(0, 0);
    if(myEmail) emailBox.value = myEmail;
    shadow.style.display = 'block';
    emailScr.style.display = 'block'
}

//shows user name so it can be changed
function showName(){
    if(!fullAccess){
        optionMsg.textContent = 'Name change not allowed in Guest mode. Please restart KyberLock';
        return
    }
    if(isMobile) window.scrollTo(0, 0);
    userNameBox.value = userName;
    shadow.style.display = 'block';
    nameScr.style.display = 'block'
}

//changes the name of the complete database, syncs if possible
function changeName(){
    if(!fullAccess){
        namechangemsg.textContent = 'Name change not allowed in Guest mode';
        return
    }
    if(learnMode.checked){
        var reply = confirm("The current User Name will be changed. Cancel if this is not what you want.");
        if(!reply) return
    }
    var oldUserName = userName,
        userNameTemp = document.getElementById('userNameBox').value;
    if (userNameTemp.trim() == ''){
        return
    }
    recryptDB(KeyStr,userNameTemp);
    localStorage[filePrefix + userNameTemp] = localStorage[filePrefix + userName];
    localStorage.removeItem(filePrefix + userName);
    userName = userNameTemp;

    if(ChromeSyncOn && chromeSyncMode.checked){
        for(var name in locDir){
            syncChromeLock(name,JSON.stringify(locDir[name]));
            chrome.storage.sync.remove((oldUserName+'.'+name).toLowerCase())
        }
        updateChromeSyncList();
        chrome.storage.sync.remove(oldUserName.toLowerCase()+'.ChromeSyncList')
    }
}

//makes base64 code for checkboxes in Options and stores it
function checkboxStore(){
    if(fullAccess){
        var checks = document.querySelectorAll('input[type=checkbox],input[type=radio]');
        var binCode = '', i;
        for(i = 0; i < checks.length; i++){
            binCode += checks[i].checked ? 1 : 0
        }
        if(locDir['myself']){
            locDir['myself'][1] = changeBase(binCode,'01',base64);
            localStorage[filePrefix + userName] = JSON.stringify(locDir);

            if(ChromeSyncOn && chromeSyncMode.checked){
                syncChromeLock('myself',JSON.stringify(locDir['myself']))
            }
        }
    }
}

//resets checkboxes in Options according to the stored code
function code2checkbox(){
    var checks = document.querySelectorAll('input[type=checkbox],input[type=radio]');
    if(locDir['myself'][1]){
        var binCode = changeBase(locDir['myself'][1],base64,'01'), i;
        while(binCode.length < checks.length) binCode = '0' + binCode;
        for(i = 0; i < checks.length; i++){
            checks[i].checked = (binCode[i] == '1')
        }
        BasicButtons = checks[3].checked
    }
    if(!BasicButtons){									//retrieve Advanced interface
        openClose("basicBtnsTop");
        openClose("mainBtnsTop");
        openClose("lockBtnsBottom");
        openClose('hideModes');
        openClose('advancedBtns');
        basicMode.checked = false;
        advancedMode.checked = true
    }
    if(ChromeSyncOn) syncCheck.style.display = 'block'
}

//go to 2nd intro screen, and back. The others are similar
function go2intro2(){
    openClose('introscr1');
    openClose('introscr2')
}
function go2intro3(){
    openClose('introscr2');
    openClose('introscr3')
}
function go2intro4(){
    openClose('introscr3');
    openClose('introscr4')
}
function go2intro5(){
    openClose('introscr4');
    openClose('introscr5')
}

//these close input dialogs
function closeBox(){
    shadow.style.display = "none";
    keyScr.style.display = "none";
    lockScr.style.display = "none";
    decoyIn.style.display = "none";
    decoyOut.style.display = "none";
    partsIn.style.display = "none";
    nameScr.style.display = "none";
    keyChange.style.display = "none";
    emailScr.style.display = "none";
    chatDialog.style.display = "none";
    introscr1.style.display = "none"
}

//Key entry is canceled, so record the limited access mode and otherwise start normally
function cancelKey(){
    if(firstInit) {pwdBox.value = ''; KeyStr = '';}
    if(!allowCancelWfullAccess){
        fullAccess = false;

        if(nameList.options.length == 2){						//only one user, no need to select it
            userName = nameList.options[1].value
        }else{												//several users
            for(var i = 0; i < nameList.options.length; i++){
                if(nameList.options[i].selected){
                    userName = nameList.options[i].value
                }
              }
        }

        getSettings();
        fillList();										//put names in selection box
        if(locDir['myself']){
            locDir['myself'][3] = 'guest mode';
            localStorage[filePrefix + userName] = JSON.stringify(locDir);

            if(ChromeSyncOn && chromeSyncMode.checked){
                syncChromeLock('myself',JSON.stringify(locDir['myself']))
            }
        }
        if(Object.keys(locDir).length == 1 || Object.keys(locDir).length == 0){		//new user, so display a fuller message
            mainMsg.textContent = 'To encrypt you must first enter the recipient’s Lock or shared Key via Edit button'
        }else{
            setTimeout(function(){mainMsg.textContent = 'You are in Guest mode. For full access, reload and enter your Key'},30)
        }
    }
    allowCancelWfullAccess = false;
    closeBox()
}
function cancelName(){
    closeBox();
    mainMsg.textContent = 'User name change canceled';
    callKey = ''
}
function cancelEmail(){
    emailBox.value = '';
    closeBox();
    mainMsg.textContent = 'Email/token change canceled';
    callKey = ''
}
function cancelDecoy(){
    decoyInBox.value = '';
    decoyOutBox.value = '';
    closeBox();
    mainMsg.textContent = 'Hidden message canceled'
}
function cancelPartsIn(){
    partsNumber.value = '';
    closeBox();
    mainMsg.textContent = 'Split canceled'
}
function cancelChat(){
    closeBox();
    mainMsg.textContent = 'Chat canceled'
}
function cancelKeyChange(){
    newKeyBox.value = '';
    closeBox();
    mainMsg.textContent = 'Key change canceled';
    if(keyScr.style.display == 'block') keyScr.style.display = 'none';
    callKey = ''
}

//generic function to evaluate key strength and execute on Enter. Possible names are: pwd, oldPwd, decoyIn, decoyOut, imageBox
function boxKeyup(name,evt){
    evt = evt;
    var key = evt.keyCode || evt.which || evt.keyChar;
    if(key == 13){
        window['accept' + name]()
    }else{
        return keyStrength(document.getElementById(name + 'Box').value, name)
    }
}

//triggered if the user types Enter in the locks screen
function lockBoxKeyup(evt){
    evt = evt;												//IE6 compliance
    var key = evt.keyCode || evt.which || evt.keyChar;
    if(lockBox.textContent.trim() == ''){
        addLockBtn.textContent = "Rand."
    }else{
        addLockBtn.textContent = "Save"
    }
    if(key == 13) {												//sync from Chrome if hit Return
        if(lockMsg.textContent == ''){				//found nothing, so try to get it from Chrome sync
            if(ChromeSyncOn && chromeSyncMode.checked){
                getChromeLock(lockBox.textContent.trim());
            }
        }
    }else if(!suspendFindLock){											//otherwise search database
            return findLock()
    }else{
        if(lockBox.textContent.trim() == ''){
            suspendFindLock = false;
            return findLock()
        }
    }
}

//this one looks at the second box and announces a match
function newKey2up(evt){
    evt = evt || window.event;
    var key = evt.keyCode || evt.which || evt.keyChar;
    if(key == 13){acceptnewKey()}else{
        var	newkey = newKeyBox.value,
            newkey2 = newKey2Box.value,
            length = newkey.length,
            length2 = newkey2.length;
        if(length != length2){
            if(newkey2 == newkey.slice(0,length2)){
                newKeyMsg.textContent = 'Keys match so far. ' + (length - length2) + ' characters to go'
            }else{
                newKeyMsg.textContent = "Keys don't match"
            }
        }else{
            if(newkey2 == newkey){
                newKeyMsg.textContent = "Keys match!"
            }else{
                newKeyMsg.textContent = "Keys don't match"
            }
        }
    }
}

//activated when the user clicks OK on a decoy screen
//function submitDecoy(){
function acceptdecoyIn(){
    closeBox();
    if(callKey == 'sign'){
        signVerify()
    }else{
        lockBtnAction()
    }
}
function acceptdecoyOut(){
    acceptdecoyIn()
}
function acceptpwdIntro(){	//needed because the event listener is created automatically
}
function acceptimage(){
    imageMsg = 'Please click one of the buttons'
}

function partsKeyup(evt){
    evt = evt || window.event;
    var key = evt.keyCode || evt.which || evt.keyChar;
    if(key == 13){submitParts()}
}
function submitParts(){
    if(!isNaN(partsNumber.value)){
    closeBox();
    secretshare()
    }
}
function emailKeyup(evt){
    evt = evt || window.event;
    var key = evt.keyCode || evt.which || evt.keyChar;
    if(key == 13){email2any()}
}
function nameKeyup(evt){
    evt = evt || window.event;
    var key = evt.keyCode || evt.which || evt.keyChar;
    if(key == 13){name2any()}
}

//for switching between sets of buttons
function main2extra(){
    if(basicMode.checked) return;
    openClose("mainBtnsTop");
    openClose("extraButtonsTop");
    fillList()
}

//switch to Advanced mode
function mode2adv(){
    mainBtnsTop.style.display = 'block';
    basicBtnsTop.style.display = 'none';
    emailBtnsTop.style.display = 'none';
    lockBtnsBottom.style.display = 'block';
    hideModes.style.display = 'block';
    advancedBtns.style.display = 'block';
    basicMode.checked = false;
    advancedMode.checked = true;
    anonMode.style.display = '';
    anonMode.checked = true;
    signedMode.checked = false;
    onceMode.checked = false;
    BasicButtons = false;
    checkboxStore()
}

//switch to Basic mode
function mode2basic(){
    mainBtnsTop.style.display = 'none';
    extraButtonsTop.style.display = 'none';
    basicBtnsTop.style.display = 'block';
    emailBtnsTop.style.display = 'none';
    lockBtnsBottom.style.display = 'none';
    hideModes.style.display = 'none';
    advancedBtns.style.display = 'none';
    basicMode.checked = true;
    advancedMode.checked = false;
    resetAdvModes();
    decoyMode.checked = false;
    anonMode.style.display = '';
    anonMode.checked = true;
    signedMode.checked = false;
    onceMode.checked = false;
    BasicButtons = true;
    checkboxStore()
}

//sets modes selectable in Advanced mode to default values
function resetAdvModes(){
    letterMode.checked = true;
    wordMode.checked = false;
    spaceMode.checked = false;
    sentenceMode.checked = false
}

//opens local directory for input if something seems to be missing
function main2lock(){
    if(isMobile) window.scrollTo(0, 0);
    if(tabLinks['mainTab'].className == '') return;
    if(Object.keys(locDir).length == 1 || Object.keys(locDir).length == 0){				//new user, so display a fuller message
        lockMsg.textContent = 'Please enter a Lock or shared Key in the lower box. To store it, write a name in the top box and click Save'
    }
    var string = lockBox.textContent.trim();
    if(string.length > 500 && string.length != 4182){							//cover text detected, so replace the currently selected one
        newCover(string)
    }
    if(string == '') addLockBtn.textContent = "Rand.";
    resetList();
    openClose('lockScr');
    openClose('shadow');
    focusBox()
}

//close image screen
function image2main(){
    if(imageScr.style.display=='block'){
        openClose('imageScr');
        openClose('shadow');
        focusBox()
    }
}

//opens a chat page
function main2chat(token){
    if(token){
        window.open("https://PassLok.com/chat/chat.html#" + token);
        mainMsg.textContent = 'Chat session open in a separate tab'
    }
}

//called when the Key box is empty
function any2key(){
    closeBox();
    shadow.style.display = 'block';
    keyScr.style.display = 'block';
    if(!isMobile){
        pwdBox.focus()
    }else{
        window.scrollTo(0, 0)
    }
    allowCancelWfullAccess = false
}

//called when the email box is empty
function any2email(){
    if(isMobile) window.scrollTo(0, 0);
    shadow.style.display = 'block';
    emailScr.style.display = 'block';
    emailMsg.textContent = 'Please enter your new email or similar item, or a new random token';
    if(!isMobile) emailBox.focus()
}

//close screens and reset Key timer when leaving the Key box. Restarts whatever was being done when the Key was found missing.
function key2any(){
    clearTimeout(keytimer);
    keytimer = setTimeout(resetKeys, 300000);	//reset timer for 5 minutes, then delete Key
    keytime = new Date().getTime();
    keyScr.style.display = 'none';
    shadow.style.display = 'none';
    focusBox()
}

//leave email screen
function email2any(){
    callKey = 'changeemail';
    var email = emailBox.value.trim();
    if(myEmail.length == 43 && fullAccess){
        var result = confirm('If you go ahead, the random token associated with your user name will be overwritten, which will change your Lock. This is irreversible.');
        if(!result){
            emailMsg.textContent = 'Random token overwrite canceled';
            return
        }
    }
    myEmail = email;
    emailBox.value = '';
    if(!refreshKey()) return;
    if(!KeyDir) KeyDir = wiseHash(KeyStr,userName,32);
    
    KeySeed = wiseHash(KeyStr,myEmail,64);                         //Uint8Array, length 64
    myKemKeys = noblePostQuantum.ml_kem768.keygen(KeySeed);       //object with two Uint8Array, public length 1184, secret length 2400
    myDsaKeys = noblePostQuantum.ml_dsa65.keygen(KeySeed.slice(0,32));        //object with two Uint8Array, public length 1952, secret length 4032
    myLock = concatUi8([myKemKeys.publicKey,myDsaKeys.publicKey]);      //signing public key concatenated with encrypting public key, length 3136
    myLockStr = encodeBase64(myLock).replace(/=+$/,'')          //base64, length 4182

    if(fullAccess) storemyEmail();
    emailScr.style.display = 'none';
    key2any();															//close key dialog too, if it was open
    if(tabLinks['optionsTab'].className == 'selected'){
        optionMsg.textContent = 'Email/token changed'
    }else{
        mainMsg.textContent = 'Email entered. You may need to re-set options'
    }
    fillList();
    callKey = ''
}

//leave name change screen
function name2any(){
    callKey = 'changename';
    if(fullAccess){
        changeName()
    }else{
        namechangemsg.textContent = 'Name change not allowed in Guest mode';
        return
    }
    closeBox();
    optionMsg.textContent = 'The User Name has changed to: '+ userName;
    callKey = ''
}

//put cursor in the box. Handy when using keyboard shortcuts
function focusBox(){
    if (!isMobile){															//on mobile, don't focus
        if(keyScr.style.display == 'block'){
            pwdBox.focus()
        } else if(lockScr.style.display == 'block'){
            lockBox.focus()
        } else {
            mainBox.focus()
        }
    }
}

//to hide and unhide stuff
function openClose(theID) {
    if(document.getElementById(theID).style.display === "block"){
        document.getElementById(theID).style.display = "none"
    }else{
        document.getElementById(theID).style.display = "block"
    }
}

//variables and functions for making tabs, by Matt Doyle 2009
var tabLinks = new Array(),
    contentDivs = new Array();

function initTabs(){

      // Grab the tab links and content divs from the page
      var tabListItems = document.getElementById('tabs').childNodes;
      for( var i = 0; i < tabListItems.length - 2 ; i++){            //exclude Help item, which launches a window
        if(tabListItems[i].nodeName == "LI"){
          var tabLink = getFirstChildWithTagName( tabListItems[i], 'A' );
          var id = getHash( tabLink.getAttribute('href'));
          tabLinks[id] = tabLink;
          contentDivs[id] = document.getElementById(id)
        }
      }

      // Assign onclick events to the tab links, and
      // highlight the first tab
      var i = 0;

      for(var id in tabLinks){
        tabLinks[id].onclick = showTab;
        tabLinks[id].onfocus = function(){ this.blur()};
        if (i == 0) tabLinks[id].className = 'selected';
        i++
      }

      // Hide all content divs except the first
      var i = 0;

      for(var id in contentDivs){
        if( i != 0 ) contentDivs[id].className = 'tabContent hide';
        i++
      }
}

function showTab(){
      var selectedId = getHash( this.getAttribute('href'));

      // Highlight the selected tab, and dim all others.
      // Also show the selected content div, and hide all others.
      for(var id in contentDivs){
        if(id == selectedId){
          tabLinks[id].className = 'selected';
          contentDivs[id].className = 'tabContent'
        }else{
          tabLinks[id].className = '';
          contentDivs[id].className = 'tabContent hide'
        }
      }
      if(this.hash == '#mainTab') fillList();
      if(this.hash != '#optionsTab'){
          optionMsg.textContent = 'Change Name, Key, etc.'
      }

      // Stop the browser following the link
      return false
}

function getFirstChildWithTagName(element, tagName){
      for(var i = 0; i < element.childNodes.length; i++){
        if(element.childNodes[i].nodeName == tagName) return element.childNodes[i]
      }
}

function getHash(url){
      var hashPos = url.lastIndexOf('#');
      return url.substring(hashPos + 1)
}
//end of tab functions

//function to search in Help tab, from JAVASCRIPTER.NET 2011
var TRange=null;

function findString (str){
 if (parseInt(navigator.appVersion) < 4) return;
 var strFound;
 if (window.find){

  // CODE FOR BROWSERS THAT SUPPORT window.find

  strFound = self.find(str);
  if (!strFound){
   strFound = self.find(str,0,1);
   while(self.find(str,0,1)) continue
  }
 }
 else if(navigator.appName.indexOf("Microsoft") != -1){

  // EXPLORER-SPECIFIC CODE

  if(TRange != null){
   TRange.collapse(false);
   strFound = TRange.findText(str);
   if(strFound) TRange.select();
  }
  if(TRange == null || strFound == 0){
   TRange = self.document.body.createTextRange();
   strFound = TRange.findText(str);
   if(strFound) TRange.select()
  }
 }
 else if(navigator.appName == "Opera"){
  alert ("Opera browsers not supported, sorry...")
  return
 }
 if(!strFound){
     helpmsg.textContent = 'Text not found in the titles. You may need to switch to Advanced mode'
 }else{
     helpmsg.textContent = 'Text highlighted below. Click again to see more results'
 }
 return
}

//for rich text editing
function formatDoc(sCmd, sValue){
      document.execCommand(sCmd, false, sValue); mainBox.focus()
}

var niceEditor = false;

//function to toggle rich text editing on mainBox
function toggleRichText(){
    if(niceEditor){
        toolBar1.style.display = 'none';
        mainBox.style.borderTopLeftRadius = '15px';
        mainBox.style.borderTopRightRadius = '15px';
        niceEditBtn.innerText = 'Rich';
        niceEditor = false
    }else{
        toolBar1.style.display = 'block';
        mainBox.style.borderTopLeftRadius = '0';
        mainBox.style.borderTopRightRadius = '0';
        niceEditBtn.innerText = 'Plain';
        niceEditor = true
    }
    textheight()
}
