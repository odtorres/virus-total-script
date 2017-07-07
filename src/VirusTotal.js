const request = require('request')
const fs = require('fs')

const CREDENTIAL_PATH = "./vtcredentials.json"
let credentialArray = []
let currentCredential = 0
const options = {
    headers: {
        'Content-Type': 'application/json'
    }
}

let readCredentials = function () {
    if (credentialArray.length == 0) {
        let token = fs.readFileSync(CREDENTIAL_PATH, 'utf8')
        credentialArray = JSON.parse(token)
    }
    return credentialArray
}

let virusTotal = {
    scanUrl: function (url, done) {
        if (credentialArray.length == 0) {
            readCredentials()
        }
        options.url = 'https://www.virustotal.com/vtapi/v2/url/scan'
        options.formData = {
            url: url,
            apikey: credentialArray[currentCredential]
        }
        request.post(options, function callback(error, response, body) {
            console.log(error, " ", response.statusCode)
            if (!error && response.statusCode == 200) {
                let info = JSON.parse(body)
                done && done(info)
            } else {
                if (virusTotal.changeCredential()) {
                    virusTotal.scanUrl(url, done)
                } else {
                    done && done(response, response.statusCode)
                }
            }
        })
    },
    getReport: function (resource, scan_id, done) {
        if (credentialArray.length == 0) {
            readCredentials()
        }
        options.url = 'http://www.virustotal.com/vtapi/v2/url/report'
        options.formData = {
            resource: resource,
            apikey: credentialArray[currentCredential],
            scan_id: scan_id

        }
        request.post(options, function callback(error, response, body) {
            console.log(error, " ", response.statusCode)
            if (!error && response.statusCode == 200) {
                let info = JSON.parse(body)
                done && done(info)
            } else {
                if (virusTotal.changeCredential()) {
                    virusTotal.getReport(resource, scan_id, done)
                } else {
                    done && done(response, response.statusCode)
                }
            }
        })
    },
    scanURLResponse: function (url, done) {
        virusTotal.scanUrl(url, (response, error) => {
            if (!error) {
                setTimeout(() => {
                    virusTotal.getReport(response.resource, response.scan_id, (response, error) => {
                        if (!error) {
                            done(response)
                        } else {
                            done(response, response.statusCode)
                        }
                    })
                }, 5000)
            } else {
                done(response, response.statusCode)
            }
        })
    },
    changeCredential: function () {
        console.log("Credential Change")
        if (currentCredential == credentialArray.length - 1) {
            currentCredential = 0
            return false
        } else if (currentCredential >= 0 && currentCredential < credentialArray.length - 1) {
            currentCredential += 1
        }
        return true
    }
}

module.exports = virusTotal