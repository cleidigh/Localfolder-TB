# ![LocalFolder icon](src/chrome/skin/classic/localfolder-32x32.png "LocalFolder")  LocalFolder

LocalFolder is a Thunderbird Add-on to create additional local folders within accounts.
Updated ! works with TB60 - TB65

This add-on is the original work of l'Abbé Christian-Philippe Chanut (philoux) and with his permission I will be updating
the code for compatibility going forward and possible improvements.

![localFolder_version](https://img.shields.io/badge/version-v0.8.15-darkorange.png?label=LocalFolder)
![localFolder_tb_version](https://img.shields.io/badge/version-v0.8.15-blue.png?label=Thunderbird%20Add-on)
![Thunderbird_version](https://img.shields.io/badge/version-v60.0_--_65.*-blue.png?label=Thunderbird)
[![License: GPL v2](https://img.shields.io/badge/License-MPL,%20GPL%20v2-red.png)](src/LICENSE)
#

## LocalFolder Add-on Installation

Normal install from [Thunderbird Add-on site](https://addons.thunderbird.net/):
- [Download](https://addons.thunderbird.net/addon/localfolder/) and install from the add-on menu
- Within Thunderbird ``Tools\Add-ons`` search for “LocalFolder” install and restart.

Install XPI directly:
- Download desired version package from the [XPI](xpi) folder.
- Within Thunderbird ``Tools\Add-ons`` click the gear icon and choose ``Install Add-on From File…``
- Choose XPI file, install and restart.

## XPI Add-on Package Build instructions

1. Make sure that you have [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation) tool installed.
2. Open a terminal in the ./src dir
3. Run ``jpm xpi`` to make the xpi

Note: ``jpm xpi`` adds ``bootstrap.js`` to the src directory, you can delete this as a post-build step: 
Delete using your favorite compression tool WinZip, 7Zip etc...

## Issues & Questions
Post any issues or questions for LocalFolder under [Issues](https://github.com/cleidigh/Localfolder-TB/issues)

## Changelog
LocalFolder’s changes are logged [here](CHANGELOG.md).

## Credits
Original Author: [philoux](https://addons.thunderbird.net/user/philoux/ "philoux")

## License

.

