const vt = require('./src/VirusTotal')
const ss = require('./src/Spreadsheets')
const moment = require('moment')
/*vt.scanURLResponse("greenvillesc-ilovekickboxing.com", (response, error) => {
    if(!error){
        console.log("respuesta ", response)
    }else{
        console.log("No se pudo")
    }
})*/

ss.readAll((siteListArray = []) => {
    //recursiveCall(1940, 1950, siteListArray)
    recursiveCall(557, 2146, siteListArray)
})

let recursiveCall = function (pos, length, siteListArray) {
    if (siteListArray[pos] && length > pos) {
        console.log(siteListArray[pos].site)
        vt.scanURLResponse(siteListArray[pos].site, function (response, error) {
            if (!error && response.positives != undefined) {
                ss.write(siteListArray[pos].site, [[moment().format("MM/DD/YYYY HH:mm:ss ")+' - (' + response.positives+')']])
                recursiveCall(pos + 1, length, siteListArray)
            } else {
                setTimeout(() => {
                    recursiveCall(pos, length, siteListArray)
                }, 120000)
            }

        })
    }
}
