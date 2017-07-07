const vt = require('./src/VirusTotal')
const ss = require('./src/Spreadsheets')

/*vt.scanURLResponse("greenvillesc-ilovekickboxing.com", (response, error) => {
    if(!error){
        console.log("respuesta ", response)
    }else{
        console.log("No se pudo")
    }
})*/

ss.readAll((siteListArray = []) => {
    //recursiveCall(1940, 1950, siteListArray)
    recursiveCall(0, 2146, siteListArray)
})

let recursiveCall = function (pos, length, siteListArray) {
    if (siteListArray[pos] && length > pos) {
        console.log(siteListArray[pos].site)
        vt.scanURLResponse(siteListArray[pos].site, function (response, error) {
            if (!error && response.positives != undefined) {
                ss.write(siteListArray[pos].site, [['' + response.positives]])
                recursiveCall(pos + 1, length, siteListArray)
            } else {
                setTimeout(() => {
                    recursiveCall(pos, length, siteListArray)
                }, 60000)
            }

        })
    }
}
