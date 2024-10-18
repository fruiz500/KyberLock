# KyberLock
Quantum-proof encryption with a simple interface
===============

KyberLock is a toolkit that implements quantum-resistant public key cryptography and steganography to supplement any communications program.

These are the principles guiding the design of KyberLock:
* Perfect portability. Runs on any computer or mobile device.
* Completely self-contained so it runs offline. No servers.
* Nothing should be installed. No required secrets saved.
* Highest-level security at every step. No compromises.
* Easy to understand and use by novices. Graphical interface, as clean and simple as possible. No crypto jargon.

Because of this, KyberLock is pure html code consisting mostly of JavaScript instructions. Its cryptography code is based on noble-port-quantum, a JavaScript implementation of the ML-KEM standard, by . It uses Xchacha20 for symmetric encryption.

KyberLock was started as URSA, also by F. Ruiz, and developed privately up to version 1.3.03, made on 8/15/13, at which point the name changed to PassLok. Commits on GitHub began seriously with this version. The engine was based on the SJCL library up to version 2.1.03, later changed to TweetNacl. PassLok is still an active project, but I felt a new name was necessary when replacing the elliptic curve cryptosystem with ML-KEM because the public keys would be much longer in the lattar case. Thus, KyberLock v1.0 bears a close resemblance to PassLok 2.5.5, though it is expected to diverge in later versions.

These are the open source libraries used in KyberLock, which can be found in the js-opensrc directory:
* DOMpurify XSS filter by Cure53: <https://github.com/cure53/DOMPurify>
* noble-post-quantum JavaScript implementation of ML-KEM (Crystals-Kyber) by Paul Miller: <https://github.com/paulmillr/noble-post-quantum>
* noble-ciphers JavaScript symmetric ciphers by Paul Miller: <https://github.com/paulmillr/noble-ciphers>
* noble-hashes JavaScript standard hashes by Paul Miller: <https://github.com/paulmillr/noble-hashes>
* lz-string compression algorithm by Pieroxy: <https://github.com/pieroxy/lz-string>
* jpeg image steganography by Owen Campbell-Moore et al.: <https://github.com/owencm/js-steg>
* isaac seedable PRNG by Yves-Marie Rinquin: <https://github.com/rubycon/isaac.js>
* encoding and decoding for Uint8 arrays, by Dmitry Chestnykh: <https://github.com/dchest/tweetnacl-util-js>

The KyberLock original code is in directories js-head and js-body:
* this only loads two word arrays: wordlist and blacklist: dictionary_en.js
* Key and Lock functions: keylock.js
* main cryptographic functions: crypto-main.js
* other crypto: crypto-extra.js
* extra functions for mail, etc.: mail&chat.js
* text steganograghy: textstego.js
* image steganography: imagestego.js
* local Directory functions: localdir.js
* functions for switching screens, etc.: screens.js
* special functions that work only with Chrome apps and extensions: Chromestuff.js
* window reformatting, special functions: bodyscript.js
* initialization, button connections: initbuttons.js

This repository contains both the standalone app, and the Chrome and Firefox extensions, which require a few extra files.

Full documentation can be found at: <https://kyberlock.com/> 

License
-------

  Copyright (C) 2024 Francisco Ruiz

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.

Acknowledgements
----------------

  KyberLock contains and/or links to code from a number of open source
  projects on GitHub, including the Noble crypto library, and others.

Cryptography Notice
-------------------

  This distribution includes cryptographic software. The country in
  which you currently reside may have restrictions on the import,
  possession, use, and/or re-export to another country, of encryption
  software. BEFORE using any encryption software, please check your
  country's laws, regulations and policies concerning the import,
  possession, or use, and re-export of encryption software, to see if
  this is permitted. See <http://www.wassenaar.org/> for more
  information.

  The U.S. Government Department of Commerce, Bureau of Industry and
  Security (BIS), has classified this software as Export Commodity
  Control Number (ECCN) 5D002.C.1, which includes information security
  software using or performing cryptographic functions with asymmetric
  algorithms. The form and manner of this distribution makes it
  eligible for export under the License Exception ENC Technology
  Software Unrestricted (TSU) exception (see the BIS Export
  Administration Regulations, Section 740.13) for both object code and
  source code.
