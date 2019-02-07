# ![Localfolder icon](src/chrome/skin/classic/localfolder-32x32.png "Localfolder")  Localfolder

Localfolder is a Thunderbird Add-On to create additional local folders within accounts.
Updated ! works with TB60 - TB65

This add-on is the original work of Philoux and with his permission I will be updating
the code for compatibility going forward and possible improvements.

![localfolder_version](https://img.shields.io/badge/version-v0.8.12-darkorange.png?label=Localfolder)
![localfolder_tb_version](https://img.shields.io/badge/version-v0.8.12-blue.png?label=Thunderbird%20Add-On)
![Thunderbird_version](https://img.shields.io/badge/version-v60.0_--_65.*-blue.png?label=Thunderbird)
[![License: GPL v2](https://img.shields.io/badge/License-MPL,%20GPL%20v2-red.png)](src/LICENSE)
#

## Localfolder Add-On Installation

Normal install from Thunderbird Add-On site:
- Download and install from the add-on menu
- Within Thunderbird ``Tools\Add-ons`` search for 'Localfolder' install and reload.

Install XPI directly:
- Download desired version package from the [XPI](xpi) folder.
- Within Thunderbird ``Tools\Add-ons`` click the gear icon and choose ``Install Add-ons From File..``
- Choose XPI file, install and reload.

## XPI Add-On Package Build instructions

1. Make sure that you have [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation) tool installed.
2. Open a terminal in the ./src dir
3. Run ``jpm xpi`` to make the xpi

Note : ``jpm xpi`` adds ``bootstrap.js`` to the src directory, you can delete this as a post-build step: 
Delete using your favorite compression tool WinZip, 7Zip etc...

## Issues & Questions
Post any issues or questions for Localfolder under [Issues](https://github.com/cleidigh/Localfolder-TB/issues)

## Changelog
Localfolder's changes are logged [here](CHANGELOG.md).

## Credits
Original Author: [Philoux](https://addons.thunderbird.net/en-US/thunderbird/user/philoux/ "Philoux")

## License

.

