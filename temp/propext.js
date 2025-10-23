// extract dtd entries

const fsp = require('node:fs/promises');
const path = require('path');
const prettier = require("prettier");
var parser = require("dtd-file");

// full locale set

var locales = ['ja', 'de', 'en_US', 'es_ES', 'fr', 'hu',
'it', 'nl', 'pt_BR', 'sv_SE', 'zh_CN'];

let locales2 = ['ca', 'ko2']
let localeDir = ".\\localeSrc";
let localeDst = ".\\localeDst";

//\ca\chrome\ca\locale\ca\messenger

async function main() {
  let dc = await fsp.readdir(`${localeDir}`);
  console.log("locales", dc)

  for (const dobj of dc) {
    if ((await fsp.stat(`${localeDir}\\${dobj}`)).isDirectory()) {
      console.log("Locale:", dobj, "\n")

      let mpFile = `${localeDir}\\${dobj}\\chrome\\${dobj}\\locale\\${dobj}\\messenger\\messenger.properties`
      let fobj = await fsp.readFile(mpFile, {encoding: `utf8`});
      //console.log(fobj)
      

      let inboxMP = fobj.match(/^inboxFolderName\s*=\s*(.*)/m);
      let draftsMP = fobj.match(/^draftsFolderName\s*=\s*(.*)/m);
      let sentMP = fobj.match(/^sentFolderName\s*=\s*(.*)/m);
      let archivesMP = fobj.match(/^archivesFolderName\s*=\s*(.*)/m);
      let trashMP = fobj.match(/^trashFolderName\s*=\s*(.*)/m);
      let junkMP = fobj.match(/^junkFolderName\s*=\s*(.*)/m);
      let outboxMP = fobj.match(/^outboxFolderName\s*=\s*(.*)/m);
      let templatesMP = fobj.match(/^templatesFolderName\s*=\s*(.*)/m);

      console.log(`draftsFolderName:\t\t${draftsMP[1]}`)
      console.log(`inboxFolderName:\t\t${inboxMP[1]}`)
      console.log(`sentFolderName:\t\t${sentMP[1]}`)
      console.log(`archivesFolderName:\t${archivesMP[1]}`)
      console.log(`trashFolderName:\t\t${trashMP[1]}`)
      console.log(`junkFolderName:\t\t${junkMP[1]}`)
      console.log(`outboxFolderName:\t${outboxMP[1]}`)
      console.log(`templatesFolderName:\t${templatesMP[1]}\n`)

      let dstLocaleFile = `${localeDst}\\${dobj}\\hdrs.properties`;
      await fsp.mkdir(`${localeDst}\\${dobj}`)
      await fsp.appendFile(dstLocaleFile, `archivesFolderName=${archivesMP[1]}\n`)
      await fsp.appendFile(dstLocaleFile, `inboxFolderName=${inboxMP[1]}\n`)
      await fsp.appendFile(dstLocaleFile, `draftsFolderName=${draftsMP[1]}\n`)
      await fsp.appendFile(dstLocaleFile, `sentFolderName=${sentMP[1]}\n`)
      await fsp.appendFile(dstLocaleFile, `trashFolderName=${trashMP[1]}\n`)
      await fsp.appendFile(dstLocaleFile, `junkFolderName=${junkMP[1]}\n`)

      await fsp.appendFile(dstLocaleFile, `templatesFolderName=${templatesMP[1]}\n`)
      await fsp.appendFile(dstLocaleFile, `outboxFolderName=${outboxMP[1]}\n`)




    }
  }
}

(async () => {
  await main();
})();


/*
node ../scripts/propext.js

*/
