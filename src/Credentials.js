/**
 * Credentials Management 
 */
const fs = require('fs')

const CREDENTIAL_PATH = "./credentials.json"
let currentCredential = -1
let credentialArray = []
/**
 * @description Read credential 
 * @return {number}
 */
let readCredentials = function (done) {
    if (credentialArray.length == 0) {
        let token = fs.readFileSync(CREDENTIAL_PATH, 'utf8')
        credentialArray = JSON.parse(token)
    }
    return credentialArray
}
module.exports = {
    /**
     * @description Change credentials
     * @param {number} credentialPos
     * @returns boolean
     */
    changeCredentials: function (credentialPos) {
        let jsonConfig = readCredentials()
        if (credentialPos >= 0 && credentialPos < jsonConfig.length) {
            process.env.AWS_ACCESS_KEY_ID = jsonConfig[credentialPos].AWS_ACCESS_KEY_ID
            process.env.AWS_SECRET_ACCESS_KEY = jsonConfig[credentialPos].AWS_SECRET_ACCESS_KEY
            currentCredential = credentialPos
            console.log("credentials ", currentCredential," id " ,process.env.AWS_ACCESS_KEY_ID)
            return true
        }
        return false
    },
    /**
     * @description Change to credential 2
     * @return {number}
     */
    getCurrentCredential: function () {
        return currentCredential
    },
}