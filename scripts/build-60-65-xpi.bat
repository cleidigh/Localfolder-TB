call jpm xpi --dest-dir ./xpi --addon-dir ./src
call 7z d .\xpi\localfolder-0.8.15-tb.xpi bootstrap.js
call 7z a .\xpi\localfolder-0.8.15-tb.xpi .\src\manifest.json