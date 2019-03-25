# ![LocalFolders icon](src/chrome/skin/classic/localfolder-32x32.png "LocalFolders")  LocalFolders

LocalFolders is a [Thunderbird](https://www.thunderbird.net/) Add-on to create additional local folders within accounts.

This add-on is the original work of l'Abbé Christian-Philippe Chanut (philoux) and with his permission I will be updating
the code for compatibility going forward and possible improvements.

![localFolders_version](https://img.shields.io/badge/version-v0.8.15-darkorange.png?label=LocalFolder)
![localFolders_tb_version](https://img.shields.io/badge/version-v0.8.15-blue.png?label=Thunderbird%20Add-on)
![Thunderbird_version](https://img.shields.io/badge/version-v60.0_--_65.*-blue.png?label=Thunderbird)
[![License: GPL v2](https://img.shields.io/badge/License-MPL,%20GPL%20v2-red.png)](src/LICENSE)

## LocalFolders Add-on Installation

Normal install (requires Internet access) from [Thunderbird Add-on site](https://addons.thunderbird.net/):
- Download and install [ATN version](https://addons.thunderbird.net/addon/localfolder/) via the ``Add-ons Manager``.
- From the [Thunderbird Menu Bar](https://support.mozilla.org/en-US/kb/display-thunderbird-menus-and-toolbar), select ``Tools`` then ``Add-ons`` to open the ``Add-ons Manager``. Choose the ``Extensions`` tab, search for “LocalFolders”, select ``+ Add to Thunderbird`` and follow the prompts to install and then restart.

Install (with or without Internet access) XPI directly:
- Download and install [GitHub XPI version](xpi) via the ``Add-ons Manager``.
- From the [Thunderbird Menu Bar](https://support.mozilla.org/en-US/kb/display-thunderbird-menus-and-toolbar), select ``Tools`` then ``Add-ons`` to open the ``Add-ons Manager``. Choose the ``Extensions`` tab, click the gear icon and choose ``Install Add-on From File…``
- Choose [XPI file](xpi), install and restart.

## XPI Add-on Package Build instructions

1. Make sure that you have [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation) tool installed
2. Open a terminal in the ``./src`` directory
3. Run ``jpm xpi`` to make the XPI file

Note: ``jpm xpi`` adds ``bootstrap.js`` to the src directory, you can delete this as a post-build step: 
Delete using your favorite compression tool WinZip, 7Zip, etc.

## Issues & Questions
Post any issues or questions for LocalFolders [here](https://github.com/cleidigh/Localfolder-TB/issues).

## Changelog
LocalFolders’ changes are logged [here](CHANGELOG.md).

## Credits
Original Author: [l'Abbé Christian-Philippe Chanut (philoux)](https://addons.thunderbird.net/user/philoux/ "l'Abbé Christian-Philippe Chanut (philoux)")

## License
[MPL, GPL v2](src/LICENSE)
