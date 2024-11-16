//initialize a few global variables used for GUI interaction
var callKey = '',
    BasicButtons = true,
    fullAccess = true,
    allowCancelWfullAccess = false;

//global variables used for key box expiration
var keytimer = 0,
    keytime = new Date().getTime();

//Alphabets for base conversion. Used in making and reading the ezLok format
var base36 = '0123456789abcdefghijkLmnopqrstuvwxyz',									//L is capital for readability
    base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

//for naming localStorage keys correctly if running from file
var filePrefix = (window.location.origin == 'file://') ? 'KyberLock-' : '';              //add prefix if running from file

//function to test key strength and come up with appropriate key stretching. Based on WiseHash
function keyStrength(string,boxName) {
    var entropy = entropycalc(string),
        msg,colorName;

    if(entropy == 0){
        msg = 'This is a known bad Password!';
        colorName = 'magenta'
    }else if(entropy < 20){
        msg = 'Terrible!';
        colorName = 'magenta'
    }else if(entropy < 40){
        msg = 'Weak!';
        colorName = 'red'
    }else if(entropy < 60){
        msg = 'Medium';
        colorName = 'darkorange'
    }else if(entropy < 90){
        msg = 'Good!';
        colorName = 'green'
    }else if(entropy < 120){
        msg = 'Great!';
        colorName = 'blue'
    }else{
        msg = 'Overkill  !!';
        colorName = 'cyan'
    }

    var iter = Math.max(1,Math.min(20,Math.ceil(24 - entropy/5)));			//set the scrypt iteration exponent based on entropy: 1 for entropy >= 120, 20(max) for entropy <= 20

    var seconds = time10/10000*Math.pow(2,iter-8);			//to tell the user how long it will take, in seconds
    if(BasicButtons){
        var msg = 'Key strength: ' + msg + '\r\nUp to ' + Math.max(0.01,seconds.toPrecision(3)) + ' sec. to process'
    }else{
        var msg = 'Key entropy: ' + Math.round(entropy*100)/100 + ' bits. ' + msg + '\r\nUp to ' + Math.max(0.01,seconds.toPrecision(3)) + ' sec. to process'
    }
    if(boxName){
        var msgName = boxName + 'Msg';
        document.getElementById(msgName).textContent = msg;
        hashili(msgName,string);
        document.getElementById(msgName).style.color = colorName
    }
    return iter
}

//takes a string and calculates its entropy in bits, taking into account the kinds of characters used and parts that may be in the general wordlist (reduced credit) or the blacklist (no credit)
function entropycalc(pwd){

//find the raw Keyspace
    var numberRegex = new RegExp("^(?=.*[0-9]).*$", "g");
    var smallRegex = new RegExp("^(?=.*[a-z]).*$", "g");
    var capRegex = new RegExp("^(?=.*[A-Z]).*$", "g");
    var base64Regex = new RegExp("^(?=.*[/+]).*$", "g");
    var otherRegex = new RegExp("^(?=.*[^a-zA-Z0-9/+]).*$", "g");

    pwd = pwd.replace(/\s/g,'');										//no credit for spaces

    var Ncount = 0;
    if(numberRegex.test(pwd)){
        Ncount = Ncount + 10;
    }
    if(smallRegex.test(pwd)){
        Ncount = Ncount + 26;
    }
    if(capRegex.test(pwd)){
        Ncount = Ncount + 26;
    }
    if(base64Regex.test(pwd)){
        Ncount = Ncount + 2;
    }
    if(otherRegex.test(pwd)){
        Ncount = Ncount + 31;											//assume only printable characters
    }

//start by finding words that might be on the blacklist (no credit)
    var pwd = reduceVariants(pwd);
    var wordsFound = pwd.match(blackListExp);							//array containing words found on the blacklist
    if(wordsFound){
        for(var i = 0; i < wordsFound.length;i++){
            pwd = pwd.replace(wordsFound[i],'');						//remove them from the string
        }
    }

//now look for regular words on the wordlist
    wordsFound = pwd.match(wordListExp);									//array containing words found on the regular wordlist
    if(wordsFound){
        wordsFound = wordsFound.filter(function(elem, pos, self) {return self.indexOf(elem) == pos;});	//remove duplicates from the list
        var foundLength = wordsFound.length;							//to give credit for words found we need to count how many
        for(var i = 0; i < wordsFound.length;i++){
            pwd = pwd.replace(new RegExp(wordsFound[i], "g"),'');									//remove all instances
        }
    }else{
        var foundLength = 0;
    }

    pwd = pwd.replace(/(.+?)\1+/g,'$1');								//no credit for repeated consecutive character groups

    if(pwd != ''){
        return (pwd.length*Math.log(Ncount) + foundLength*Math.log(wordLength + blackLength))/Math.LN2
    }else{
        return (foundLength*Math.log(wordLength + blackLength))/Math.LN2
    }
}

//take into account common substitutions, ignore spaces and case
function reduceVariants(string){
    return string.toLowerCase().replace(/[óòöôõo]/g,'0').replace(/[!íìïîi]/g,'1').replace(/[z]/g,'2').replace(/[éèëêe]/g,'3').replace(/[@áàäâãa]/g,'4').replace(/[$s]/g,'5').replace(/[t]/g,'7').replace(/[b]/g,'8').replace(/[g]/g,'9').replace(/[úùüû]/g,'u')
}

//replaces back variant characters, opposite of reduceVariants
function replaceVariants(string){
    return string.replace(/0/g,'o').replace(/1/g,'i').replace(/2/g,'z').replace(/3/g,'e').replace(/4/g,'a').replace(/5/g,'s').replace(/7/g,'t').replace(/8/g,'b').replace(/9/g,'g')
}

//makes 'pronounceable' hash of a string, so user can be sure the password was entered correctly
var vowel = 'aeiou',
    consonant = 'bcdfghjklmnprstvwxyz',
    hashiliTimer;

function hashili(msgID,string){
    var element = document.getElementById(msgID);
    clearTimeout(hashiliTimer);
    hashiliTimer = setTimeout(function(){
        if(!string.trim()){
            element.innerText += ''
        }else{
            var code = nobleHashes.sha512(decodeUTF8(string.trim())).slice(-2),      //take last 2 bytes of the sha512, for compatibility with PassLok
                code10 = ((code[0]*256)+code[1]) % 10000,		//convert to decimal
                output = '';

            for(var i = 0; i < 2; i++){
                var remainder = code10 % 100;					//there are 5 vowels and 20 consonants; encode every 2 digits into a pair
                output += consonant[Math.floor(remainder / 5)] + vowel[remainder % 5];
                code10 = (code10 - remainder) / 100
            }
            element.innerText += '\n' + output
        }
    }, 1000);						//one second delay to display hashili
}

//these derive from the Key (KeyStr) after running through scrypt stretching. Uint8Array format. KeyDir (salt=userName) is 32-byte, myDsaKeys is a big double object, (salt=email, ML-DSA65); myKemKeys is a big double object (salt=email, ML-KEM768), KeyStr, myEmail are strings.
var KeyStr,
    KeyDir,
    KeySeed,
    myDsaKeys,
    myKemKeys,
    myEmail = '';

//reads Key box and stops if there's something wrong. If the timer has run out, the Key is deleted from box, and stretched keys are deleted from memory
function refreshKey(){
    clearTimeout(keytimer);
    var period = 300000;       //5 minutes in msec

//start timer to erase Key
    keytimer = setTimeout(function() {
        resetKeys();
    }, period);

//erase key at end of period, by a different way
    if ((new Date().getTime() - keytime > period)) {
        resetKeys();
    }
    keytime = new Date().getTime();

    if (!KeyStr){
        any2key();
        if(callKey == 'initkey'){
            pwdMsg.textContent = 'Welcome to KyberLock\r\nPlease enter your secret Key'
        }else{
            pwdMsg.textContent = 'Please enter your secret Key';
            shadow.style.display = 'block'
        }
        return false
    }
    return true
}

//resets the sensitive Keys in memory when the timer ticks off
function resetKeys(){
    KeyStr = '';
    KeyDir = '';
    KeySeed = '';
    myDsaKeys = '';
    myKemKeys = '';
    myEmail = '';
    pwdBox.value = '';
    imageBox.value = '';
    folderKey = '';
    makeKeyBtn.textContent = 'New Folder Key'
}

//reads email address from the main box. This is used as a salt to make the Lock
function readEmail(){
    if(myEmail) return myEmail;
    if(locDir['myself'] && fullAccess){
        if(locDir['myself'][0]){
            var decrypted = keyDecrypt(locDir['myself'][0]);
            if(decrypted == undefined) return undefined;
            return decrypted
        }
    }
    var email = emailBox.value;
    if (email == "" && emailScr.style.display != 'block'){
        any2email();
        return false
    };
    return email.trim()
}

var userName = '';

//to initialize a new user. Executed by final button in new user wizard
function initUser(){
    var key = pwdIntroBox.value,
        email = emailIntro.value;
    userName = nameIntro.value;
    myEmail = email.trim();

    if (key.trim() == ''){
        intromsg2.textContent = 'The User Name or the Key box is empty. Please go back and ensure both are filled.';
        return
    }
    pwdIntroBox.value = '';
    emailIntro.value = '';
    openClose('introscr5');

    if(!localStorage[filePrefix + userName]){
        locDir = {};
        localStorage[filePrefix + userName] = JSON.stringify(locDir)
    }
    locDir = JSON.parse(localStorage[filePrefix + userName]);
    mainMsg.textContent = '';
    var blinker = document.createElement('span'),
        msgText = document.createElement('span');
    blinker.className = "blink";
    blinker.textContent = "LOADING...";
    msgText.textContent = " for best speed, use at least a Medium Key";
    mainMsg.appendChild(blinker);
    mainMsg.appendChild(msgText);
    key2any();

    setTimeout(function(){									//do the rest after a short while to give time for the key screen to show
        KeyStr = key;
        KeyDir = wiseHash(key,userName,32);							//storage stretched key loaded into memory, will be used right away

        if(ChromeSyncOn){											//if sync is available, get settings only from sync, then the rest
            var syncName = '.myself';
            chrome.storage.sync.get(syncName.toLowerCase(), function (obj) {
                var lockdata = obj[syncName.toLowerCase()];
                if(lockdata){											//the user isn't totally new: retrieve settings
                    locDir['myself'] = JSON.parse(lockdata);
                    email = keyDecrypt(locDir['myself'][0]);
                    if(!email) return;
                    retrieveAllSync();
                    setTimeout(function(){fillList();mainMsg.textContent = 'Settings synced from Chrome';}, 500);
                }else{													//user never seen before: store settings
                    locDir['myself'] = [];
                    locDir['myself'][0] = keyEncrypt(email);			//email/token is stored, encrypted by Key
                    if(!locDir['myself'][0]) return;
                    syncChromeLock('myself',locDir['myself'][0]);
                    setTimeout(function(){fillList();}, 500);
                }
                if(email) myEmail = email;
                localStorage[filePrefix + userName] = JSON.stringify(locDir);
                lockNames = Object.keys(locDir)
            });
        }else{															//if not, store the email
            if(!locDir['myself']) locDir['myself'] = [];
            locDir['myself'][0] = keyEncrypt(email);
            if(!locDir['myself'][0]) return;
            localStorage[filePrefix + userName] = JSON.stringify(locDir);
            lockNames = Object.keys(locDir)      
        }

        KeySeed = wiseHash(key,myEmail,64);                         //Uint8Array, length 64
        myKemKeys = noblePostQuantum.ml_kem768.keygen(KeySeed);       //object with two Uint8Array, public length 1184, secret length 2400
        myDsaKeys = noblePostQuantum.ml_dsa65.keygen(KeySeed.slice(0,32));        //object with two Uint8Array, public length 1952, secret length 4032

        if(!myLock){                                           
            myLock = concatUi8([myKemKeys.publicKey,myDsaKeys.publicKey]);    //encrypting public key concatenated with signing public key, length 3136
            myLockStr = encodeBase64(myLock).replace(/=+$/,'');               //base64, length 4182
        }

        //additional text to accompany an invitation
        setTimeout(function(){fillList();}, 500);

        if(ChromeSyncOn) syncCheck.style.display = 'block';

        getSettings();
 
        setTimeout(makeGreeting, 30);									//fill Main box with a special greeting
    },30);
}

//makes a special encrypted greeting for a new user
function makeGreeting(){
    var greeting = "<p>Congratulations! You have decrypted your first message.</p><p>Remember, your Lock, which you should give to other people so they can encrypt messages and files that only you can decrypt, is at the end of this message:</p><p>You can display it at any time by clicking <b>myLock</b> with the main box empty.</p><p>It is already entered into the local directory (top box), under name 'myself'. When you add your friends' Locks or shared Keys by pasting them into the main box or clicking the <b>Edit</b> button, they will appear in the directory so you can encrypt items that they will be able to decrypt. If someone invited you, that person should be there already.</p><p>Try encrypting this back: click on <b>myself</b> in the directory in order to select your Lock, and then click <b>Encrypt</b></p><p>You won't be able to decrypt this back if you select someone else's name before you click <b>Encrypt</b>, but that person will.</p><p><a href='https://passlok.com/learn'>Right-click and open this link</a> to load the very similar PassLok app along with a series of tutorials.</p><p>Now, here's your Lock:</p><pre>----------begin KyberLock 1.0 Lock--------==\r\n\r\n" + myLockStr.match(/.{1,80}/g).join("\r\n") + "\r\n\r\n==---------end KyberLock 1.0 Lock-----------</pre>";
    Encrypt_List(['myself'],greeting);
    var welcomeMsg = document.createElement('p');
    welcomeMsg.innerHTML = "<p>Welcome to KyberLock, the quantum-proof encryption app for everyone!</p><p>Encrypted messages look like the gibberish below this line. Go ahead and decrypt it by clicking the <b>Decrypt</b> button.</p><p>Otherwise, clear the box and click <b>myLock</b> to display your Lock, which other users need in order to encrypt messages that only you can decrypt.</p>";
    mainBox.insertBefore(welcomeMsg,mainBox.firstChild);
    mainMsg.textContent = "KyberLock";
    updateButtons()
}

//checks that the Key is the same as before, resumes operation. Executed by OK button in key entry dialog
function acceptpwd(){
    var key = pwdBox.value.trim();
    if(key == ''){
        pwdMsg.textContent = 'Please enter your Key';
        return
    }
    if(key.length < 4){
        pwdMsg.textContent = 'This Key is too short!';
        return
    }

    var x = document.getElementById('nameList');
    if (x.options.length == 2){						//only one user, no need to select it
        userName = x.options[1].value
    }else{												//several users
        for (var i = 0; i < x.options.length; i++) {
            if(x.options[i].selected){
                userName = x.options[i].value
            }
          }
    }
    if (userName == '' && fullAccess){
        pwdMsg.textContent = 'Please select a user name, or make a new one';
        return
    }

    if(Object.keys(locDir).length == 0 && localStorage[filePrefix + userName]) locDir = JSON.parse(localStorage[filePrefix + userName]);
    if(firstInit){
        mainMsg.textContent = '';
        var blinker = document.createElement('span'),
            msgText = document.createElement('span');
        blinker.className = "blink";
        blinker.textContent = "LOADING...";
        msgText.textContent = " for best speed, use at least a Medium Key";
        mainMsg.appendChild(blinker);
        mainMsg.appendChild(msgText);
    }
    KeyStr = key;
    key2any();

    setTimeout(function(){									//execute after a 30 ms delay so the key entry dialog can go away
        if(locDir['myself']){
            if(!fullAccess){								//OK so far, now check that the Key is good; at the same time populate email and generate stretched Keys
                locDir['myself'][3] = 'guest mode';
                localStorage[filePrefix + userName] = JSON.stringify(locDir);
                mainMsg.textContent = 'You have limited access to functions. For full access, reload and enter the Key'
            }
            if(!checkKey(key)) return;							//check the key and bail out if fail
            getSettings();

            if(ChromeSyncOn && chromeSyncMode.checked){
                syncChromeLock('myself',JSON.stringify(locDir['myself']))
            }
        }else{													//if stored settings are not present: ask for email, compute stretched Keys. Store stuff if full access
            if(firstInit) KeyDir = wiseHash(key,userName,32);
    
            if(ChromeSyncOn && chromeSyncMode.checked && firstInit){	//the Chrome app gets the settings from sync, asynchronously
                var syncName = userName+'.myself';
                chrome.storage.sync.get(syncName.toLowerCase(), function (obj) {
                    var lockdata = obj[syncName.toLowerCase()];
                    if(lockdata){											//the user isn't totally new: retrieve settings
                        locDir['myself'] = JSON.parse(lockdata);
                        email = keyDecrypt(locDir['myself'][0]);
                        if(email){myEmail = email}else{return}
                        localStorage['KyberLock-' + userName] = JSON.stringify(locDir);
                        retrieveAllSync();
                        setTimeout(function(){mainMsg.textContent = 'Settings retrieved Chrome sync';}, 500);
                    }else{													//user missing in sync: store settings
                        var email = readEmail();
                        locDir['myself'] = [];
                        locDir['myself'][0] = keyEncrypt(email);
                        if(!locDir['myself'][0]) return;
                        localStorage[filePrefix + userName] = JSON.stringify(locDir);
                        syncChromeLock('myself',JSON.stringify(locDir['myself']));
                    }
                    lockNames = Object.keys(locDir)
                    KeySeed = wiseHash(key,myEmail,64);                         //Uint8Array, length 64
                    myKemKeys = noblePostQuantum.ml_kem768.keygen(KeySeed);       //object with two Uint8Array, public length 1184, secret length 2400
                    myDsaKeys = noblePostQuantum.ml_dsa65.keygen(KeySeed.slice(0,32));        //object with two Uint8Array, public length 1952, secret length 4032
                });
            } else {											//no sync, so ask user for email and go on making Keys
                firstInit = false;
                var email = readEmail();
                KeySeed = wiseHash(key,myEmail,64);                         //Uint8Array, length 64
                myKemKeys = noblePostQuantum.ml_kem768.keygen(KeySeed);       //object with two Uint8Array, public length 1184, secret length 2400
                myDsaKeys = noblePostQuantum.ml_dsa65.keygen(KeySeed.slice(0,32));        //object with two Uint8Array, public length 1952, secret length 4032
                
                locDir['myself'] = [];
                locDir['myself'][0] = keyEncrypt(email);
                if(!locDir['myself'][0]) return;
                localStorage[filePrefix + userName] = JSON.stringify(locDir);
            }
            checkboxStore();
        }
        pwdBox.value = '';																		//all done, so empty the box

        if(Object.keys(locDir).length == 1 || Object.keys(locDir).length == 0){		//new user, so display a fuller message
            mainMsg.textContent = "To encrypt a message for someone, you must first enter the recipient’s Lock or shared Key by clicking the Edit button"
        }
        if (callKey == 'encrypt'){						//now complete whatever was being done when the Key was found missing
            lockBtnAction()
        }else if(callKey == 'decrypt'){
            lockBtnAction()
        }else if(callKey == 'sign'){
            signVerify()
        }else if(callKey == 'addlock'){
            openClose('lockScr');
            openClose('shadow');
            addLock(false)
        }else if(callKey == 'decryptitem'){
            decryptItem()
        }else if(callKey == 'decryptlock'){
            decryptLock()
        }else if(callKey == 'mergedb'){
            mergeLockDB()
        }else if(callKey == 'movedb'){
            moveLockDB()
        } else if(callKey == 'showlock'){
            showLock()
        } else if(callKey == 'fillbox'){
            fillBox()
        } else if(callKey == 'changekey'){
            acceptnewKey()
        } else if(callKey == 'changename'){
            name2any()
        } else if(callKey == 'changeemail'){
            email2any()
        } else if(callKey == 'movemyself'){
            moveMyself()
        }
        focusBox()
    },30);
}

var locDir = {},        //myLock is a Uint8Array of length 3136; myLockStr is the same in base64
    lockNames = [],
    myLock,
    myLockStr,
    firstInit = true;

//sticky settings are stored in array 'myself' on directory; here is a breakdown of what each index contains:
//0: email/token, encrypted by Key; 1: checkbox code, plain; 2: color scheme; 3: full access on or off, plain

//function to initialize locDir and interface for the user
function getSettings(){
    if(localStorage[filePrefix + userName]){
        if(Object.keys(locDir).length == 0) locDir = JSON.parse(localStorage[filePrefix + userName]);	//database in Object form. Global variable
        lockNames = Object.keys(locDir);												//array for finding Lock names. Global variable
        if(locDir['myself']){															//initialize permanent settings
            if(!firstInit) return;														//skip the rest if it's not the first time
            if(locDir['myself'][3] == 'guest mode'){
                setTimeout(function(){				//add delay so messages are seen and recrypt doesn't get in the way
                    if(fullAccess){
                        var reply = confirm("Last user did not enter the right Key. Would you like to re-encrypt the local directory?");
                        if(reply){
                            recryptDB(KeyStr);
                            mainMsg.textContent = 'The local directory has been re-encrypted'
                        }else{
                            mainMsg.textContent = 'WARNING: last session was in Guest mode'
                        }
                    }else{
                        mainMsg.textContent = 'Last session was also in Guest mode'
                    }
                }, 500);
                locDir['myself'][3] = 'full access';
                localStorage[filePrefix + userName] = JSON.stringify(locDir);
            }
            code2checkbox();										//set checkboxes

            if(ChromeSyncOn && chromeSyncMode.checked) retrieveAllSync();
        }
    }
    fillList();
    resetList();
    firstInit = false;
    setTimeout(function(){
        mainMsg.textContent = 'KyberLock is ready'
    },100)
}

//try decrypting the email/token in 'myself' to see if the Key is the same as the last one used. Then populate email box and generate stretched keys and Lock
var checkingKey = false;

function checkKey(key){
    checkingKey = true;
    KeyDir = wiseHash(key,userName,32);
    if(fullAccess){
        var myEmailcrypt = locDir['myself'][0];
        var email = keyDecrypt(myEmailcrypt);				//this will fail if the Key is not the last one used, displaying a message
        if(!checkingKey) return false;
        if(email){
            myEmail = email
        }else{
            myEmail = readEmail()
        }
    }else{
        myEmail = readEmail();
    }

//make seed from password and email, keypairs for encrypting and signing from the seed, Lock is public signing + public encrypting keys together
    KeySeed = wiseHash(key,myEmail,64);                         //Uint8Array, length 64
    myKemKeys = noblePostQuantum.ml_kem768.keygen(KeySeed);       //object with two Uint8Array, public length 1184, secret length 2400
    myDsaKeys = noblePostQuantum.ml_dsa65.keygen(KeySeed.slice(0,32));        //object with two Uint8Array, public length 1952, secret length 4032
    if(!myLock){                                                //signing public key concatenated with encrypting public key, length 3136
        myLock = concatUi8([myKemKeys.publicKey,myDsaKeys.publicKey]);
        myLockStr = encodeBase64(myLock).replace(/=+$/,'')          //base64, length 4182
    }

    checkingKey = false;
    return true
}

//display Lock in the lower box of the Main tab.
function showLock(){
    if(showLockBtn.textContent == 'Email'){		//redirect to email if not ready to show Lock
        sendMail();
        return
    }
    callKey = 'showlock';
    if(learnMode.checked){
        var reply = confirm("The Lock matching the Key in this box will be placed in the lower box, replacing its contents. Cancel if this is not what you want.");
        if(!reply) return;
    };

    if(!refreshKey()) return;
    if(!locDir['myself']) locDir['myself'] = [];
    if(!myLock){                                           
        myLock = concatUi8([myKemKeys.publicKey,myDsaKeys.publicKey]);    //encrypting public key concatenated with signing public key, length 3136
        myLockStr = encodeBase64(myLock).replace(/=+$/,'')          //base64, length 4182
    }

    //done calculating, now display it
    mainBox.appendChild(lockElement());
    mainMsg.textContent = "The Lock matching your Key is in the box. Send it to people to communicate\r\nThis is its fingerprint:   " + lockPrint(myLock);
    updateButtons();
    showLockBtn.textContent = 'Email';
    showLockBtnBasic.textContent = 'Email';
    callKey = '';
}

//creates fingerprint of a Lock in base36, for display. The lock is a Uint8Array of length 3136
function lockPrint(lock){
    if(lock.length == 3136){
        var print = changeBase(encodeBase64(nobleHashes.cshake256(lock)).replace(/=/g,''),base64,base36,true).match(/.{1,5}/g).join("-");
    }else{
        var print = 'This is not a Lock'
    }
    return print
}

//extracts Lock at the start of an item, from an invitation or prepended Lock
function extractLock(string){
    var CGParts = stripTags(removeHTMLtags(string)).replace(/-/g,'').split('//////');				//if prepended Lock, filter anyway
    if(CGParts[0].length == 4182){
        var possibleLock = CGParts[0];
        string = string.slice(4188)
    }else{
        var possibleLock = removeHTMLtags(string)
    }

    if(possibleLock.length == 4182){
        var index = 0, foundIndex;
        for(var name in locDir){
            if(locDir[name][0] == possibleLock){
                foundIndex = index
            }
            index++
        }
        if(foundIndex != null){															//found it, so select this user
            lockList.options[foundIndex+1].selected = true;
            fillBox()
        }else{																				//not found, so store after asking for a name
            lockBox.textContent = possibleLock;
            addLock(true)
        }
    }
    return string
}

//just to display the Lock. Gets called above and in one more place
function lockElement(){
    var el = document.createElement('pre');
    el.textContent = "----------begin KyberLock 1.0 Lock--------==\r\n\r\n" + myLockStr.match(/.{1,80}/g).join("\r\n") + "\r\n\r\n==---------end KyberLock 1.0 Lock-----------";
    return el
}

//stores email if missing
function storemyEmail(){
    if(!locDir['myself']) locDir['myself'] = [];
    locDir['myself'][0] = keyEncrypt(readEmail());
    if(!locDir['myself'][0]) return;
    localStorage[filePrefix + userName] = JSON.stringify(locDir);

    if(ChromeSyncOn && chromeSyncMode.checked){
        syncChromeLock('myself',JSON.stringify(locDir['myself']))
    }
}

//stretches a password string with a salt string to make a 256-bit Uint8Array Key
function wiseHash(pwd,salt,length){
    var iter = keyStrength(pwd,false),
        output = new Uint8Array(length);
    output = nobleHashes.scrypt(pwd,salt,{ N: 2 ** iter, r: 8, p: 1, dkLen: length });
    return output
}

//returns milliseconds for 10 scrypt runs at iter=10 so the user can know how long wiseHash will take; called at the end of body script
function hashTime10(){
    var before = Date.now();
    for (var i=0; i<10; i++){
        scrypt('hello','world',10,8,32,0,function(){});
    }
    return Date.now() - before
}

//encrypt string with a shared Key, returns a uint8 array
function KLencrypt(plainstr,nonce,sharedKey,isCompressed){
    if(!isCompressed || plainstr.includes('="data:')){						//no compression if it includes a file
        var plain = decodeUTF8(plainstr)
    }else{
        var plain = LZString.compressToUint8Array(plainstr)
    }
    return nobleCiphers.xchacha20poly1305(sharedKey, nonce).encrypt(plain)
}

//decrypt string (or uint8 array) with a shared Key. Var 'label' is to display messages
function KLdecrypt(cipherStr,nonce,sharedKey,isCompressed,label){
    if(typeof cipherStr == 'string'){
        var cipher = decodeBase64(cipherStr);
        if(!cipher) return false
    }else{
        var cipher = cipherStr
    }
    try{
        var plain = nobleCiphers.xchacha20poly1305(sharedKey, nonce).decrypt(cipher);                         //it might not decrypt
    }
    catch{
        failedDecrypt(label);
        return false
    }

    if(!isCompressed || plain.join().match(",61,34,100,97,116,97,58,")){		//this is '="data:' after encoding
        return encodeUTF8(plain)
    }else{
        return LZString.decompressFromUint8Array(plain)
    }
}

//encrypts a string or uint8 array with the secret Key, 24 byte nonce, padding so length for ASCII input is the same no matter what. The input can also be binary, and then it won't be padded
function keyEncrypt(plainstr){
    if(!refreshKey()) return undefined;																		//make sure the Key is still alive
    var nonce = crypto.getRandomValues(new Uint8Array(24));
    if(typeof plainstr == 'string'){
        plainstr = encodeURI(plainstr).replace(/%20/g,' ');
        while (plainstr.length < 43) plainstr = plainstr + ' ';
        var cipher = KLencrypt(plainstr,nonce,KeyDir,false)
    }else{
        var cipher = nobleCiphers.xchacha20poly1305(KeyDir, nonce).encrypt(plainstr)
    }
    return encodeBase64(concatUi8([[144],nonce,cipher])).replace(/=+$/,'')		//1st character should be k
}

//decrypts a string encrypted with the secret Key, 24 byte nonce. Returns original if not encrypted. If isArray set, return uint8 array
function keyDecrypt(cipherStr,isArray){
    var cipher = decodeBase64(cipherStr.replace(/[^a-zA-Z0-9+\/]+/g,''));
    if(!cipher) return false;
    if (cipher[0] == 144){
        if(!refreshKey()) return undefined;											//make sure the Key is still alive
        var	nonce = cipher.slice(1,25),	
            cipher2 = cipher.slice(25);
        if(isArray){
            try{
                var plain = nobleCiphers.xchacha20poly1305(KeyDir, nonce).decrypt(cipher2);
                return plain
            }
            catch{
                return false
            }
        }else{
            var plain = KLdecrypt(cipher2,nonce,KeyDir,false,'key');
            if(!plain) return;
            return decodeURI(plain.trim())
        }
    }else{
        return cipherStr
    }
}

//this strips initial and final tags, plus spaces and non-base64 characters in the middle
function stripTags(string){
    string = string.replace(/\s/g,'').replace(/==+/,'==');										//remove spaces, reduce multiple = to double
    if(string.match('==')) string = string.split('==')[1].replace(/<(.*?)>/gi,"");
    string = string.replace(/[^a-zA-Z0-9+\/]+/g,''); 											//takes out anything that is not base64
    return string
}

//removes stuff between angle brackets
function removeHTMLtags(string){
    return string.replace(/<(.*?)>/gi, "")
}

//this one escapes dangerous characters, preserving non-breaking spaces
function escapeHTML(str){
    escapeHTML.replacements = { "&": "&amp;", '"': "&quot;", "'": "&#039;", "<": "&lt;", ">": "&gt;" };
    str = str.replace(/&nbsp;/gi,'non-breaking-space')
    str = str.replace(/[&"'<>]/g, function (m){
        return escapeHTML.replacements[m];
    });
    return str.replace(/non-breaking-space/g,'&nbsp;')
}

//remove XSS vectors using DOMPurify
function decryptSanitizer(string){
    return DOMPurify.sanitize(string, {ADD_DATA_URI_TAGS: ['a']})
}

var nameBeingUnlocked = '';

//this function replaces an item with its value on the locDir database, decrypted if necessary, if the name exists
function replaceByItem(name){
    var fullName = '',
        index = searchStringInArrayDB(name,lockNames);
    if (index < 0){									//not on database; strip it if it's a Lock
        var stripped = stripTags(name);
        if(stripped.length == 4182) {fullName = stripped}else{fullName = name}
    } else if(name == 'myself'){
        if(myLock) fullName = myLockStr
    } else {									//found name on DB, so get value from the database and decrypt if necessary
        fullName = lockNames[index];
        var string = locDir[fullName][0];
        nameBeingUnlocked = fullName;
        var whole = keyDecrypt(string);
        if(!whole) return undefined;
        nameBeingUnlocked = '';
        var	stripped = stripTags(whole);
        if(stripped.length == 4182) {fullName = stripped} else {fullName = whole}		//if it's a Lock, strip tags
    }
    return fullName
}

//changes the base of a number. inAlpha and outAlpha are strings containing the base code for the original and target bases, as in '0123456789' for decimal. Bases can be string, words separated by spaces, or RegExp
//adapted from http://snippetrepo.com/snippets/bignum-base-conversion, by kybernetikos
function changeBase(numberIn, inAlpha, outAlpha, isLock) {
    var isWordsIn = inAlpha instanceof RegExp || inAlpha.match(' '),				//detect whether it's words into string, or the opposite
        isWordsOut = outAlpha instanceof RegExp || outAlpha.match(' ');			//could be RegExp or space-delimited

    //split alphabets into array
    var alphaIn = isWordsIn ? (inAlpha instanceof RegExp ? inAlpha.toString().slice(1,-2).split('|') : inAlpha.trim().split(' ')) : inAlpha.split(''),
        alphaOut = isWordsOut ? (outAlpha instanceof RegExp ? outAlpha.toString().slice(1,-2).split('|') : outAlpha.trim().split(' ')) : outAlpha.split('');

    var targetBase = alphaOut.length,
        originalBase = alphaIn.length;
    var result = [],
        number = isWordsIn ? numberIn.trim().replace(/ +/g,' ').split(' ') : numberIn.split('');

    if(isWordsIn){										//convert words into dictionary variants
        for(var i = 0; i < number.length; i++){
            number[i] = reduceVariants(number[i])
        }
    }

    while (number.length > 0) {
        var remainingToConvert = [], resultDigit = 0;
        for (var position = 0; position < number.length; ++position) {
            var idx = alphaIn.indexOf(number[position]);
            if (idx < 0) {
                if(lockScr.style.display == 'block'){
                    lockMsg.textContent = "Word '" + replaceVariants(number[position]) + "' in word Lock not found in dictionary. Please check"
                }else{
                    mainMsg.textContent = "Word '" + replaceVariants(number[position]) + "' in pasted word Lock not found in dictionary. Please check"
                }
                    return false
            }
            var currentValue = idx + resultDigit * originalBase;
            var remainDigit = Math.floor(currentValue / targetBase);
            resultDigit = currentValue % targetBase;
            if (remainingToConvert.length || remainDigit) {
                remainingToConvert.push(alphaIn[remainDigit])
            }
        }
        number = remainingToConvert;
        result.push(alphaOut[resultDigit])
    }

    if(isLock){													//add leading zeroes in Locks
        var lockLength = isWordsOut ? 20 : ((targetBase == 36) ? 50 : 43);
        while(result.length < lockLength) result.push(alphaOut[0])
    }
    result.reverse();

    if(isWordsOut){											//convert to regular words
        for(var i = 0; i < result.length; i++){
            result[i] = replaceVariants(result[i])
        }
    }

    return isWordsOut ? result.join(' ') : result.join('')
}

//puts an 43-character random base64 string in the 'emailBox' boxes
function randomToken(){
    var token = encodeBase64(crypto.getRandomValues(new Uint8Array(32))).slice(0,43);
    emailIntro.value = token;
    emailBox.value = token;
}

//takes appropriate UI action if decryption fails
function failedDecrypt(label){
    pwdMsg.style.color = '';
    mainMsg.style.color = '';
    if(checkingKey){
        shadow.style.display = 'block';
        keyScr.style.display = 'block';
        pwdMsg.textContent = "Please write the last Key you used. You can change the Key in Options";
        checkingKey = false
    }else if(lockBox.textContent.trim().slice(0,1) == 'k' || isList || nameBeingUnlocked != '' || label == 'key'){
        any2key();					//this displays the Key entry dialog
        pwdMsg.textContent = "This Key won't decrypt the item " + nameBeingUnlocked;
        allowCancelWfullAccess = true
    }else if(keyChange.style.display == 'block'){
        keyChange.style.display = 'none';
        pwdMsg.textContent = "The Old Key is wrong"
    }else if(label == 'decoy'){
        mainMsg.textContent = 'No hidden message was found'
    }else if(label == 'read-once' && !decoyMode.checked){
        mainMsg.textContent = 'Read-once decrypt has Failed. You may have to reset the exchange with this sender';
    }else if(!decoyMode.checked){
        mainMsg.textContent = 'Decryption has failed'
    }
    return
}
