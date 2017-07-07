const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
const SCOPES = ['https://spreadsheets.google.com/feeds'];
const TOKEN_DIR = //(process.env.HOME || process.env.HOMEPATH)// ||
    //process.env.USERPROFILE) 
    '/.credentials/';

const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
let spreadSheetId = '1vqcFlPgyjMFWiGfTXoyiSKLI_Lr9OzuMCBxN30IGlSA'

let valuesToSave = []
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, baseUrl, values) {
    var clientSecret = credentials.installed.client_secret
    var clientId = credentials.installed.client_id
    var redirectUrl = credentials.installed.redirect_uris[0]
    var auth = new googleAuth()
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback)
        } else {
            oauth2Client.credentials = JSON.parse(token)
            callback(oauth2Client, baseUrl, values)
        }
    })
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorizeRead(credentials, callback, done) {
    var clientSecret = credentials.installed.client_secret
    var clientId = credentials.installed.client_id
    var redirectUrl = credentials.installed.redirect_uris[0]
    var auth = new googleAuth()
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback)
        } else {
            oauth2Client.credentials = JSON.parse(token)
            callback(oauth2Client, done)
        }
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * @description Name and excecute of all sites:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function siteList(auth, done) {
    let sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadSheetId,
        range: 'Test 1!A2:M',
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        let rows = response.values;
        if (rows.length == 0) {
            console.log('No data found.')
        } else {
            let siteListArray = []
            for (var i = 0; i < rows.length; i++) {
                let row = rows[i]
                siteListArray.push({
                    "site": row[0],
                    "execute": (row[12]==undefined || row[12] != 0) ? true : false
                })
            }
            done(siteListArray)
        }
    })
}

function writeRow(sheets, auth, spreadSheetId, sheet, positionOnsheet, values) {
    sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: spreadSheetId,
        range: sheet + '!T' + positionOnsheet + ':T' + positionOnsheet,
        valueInputOption: 'USER_ENTERED',
        resource: {
            range: sheet + '!T' + positionOnsheet + ':T' + positionOnsheet,
            majorDimension: 'ROWS',
            values: values,
        }
    }, (err, resp) => {
        if (err) {
            console.log('Data Error :', err)
        }
        console.log(resp)
    })
}

function writeValues(auth, baseUrl, values) {
    let sheets = google.sheets('v4')
    //let spreadSheetId = '1s8Ygwest9F55zxqiDZ6BlLAqYt36iyp6CGNzu90TgD4'
    let spreadSheetId = '1vqcFlPgyjMFWiGfTXoyiSKLI_Lr9OzuMCBxN30IGlSA'
    let sheet = 'Test 1'
    let positionOnsheet = -1

    //read position 
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadSheetId,
        range: sheet + '!A1:H',
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        let rows = response.values;
        if (rows.length == 0) {
            console.log('No data found.')
        } else {
            //show all the spreadsheets
            //console.log(rows)
            for (var i = 1; i < rows.length; i++) {
                var row = rows[i]
                // find base url in the list
                if (baseUrl == row[0]) {
                    console.log("Found")
                    positionOnsheet = i + 1
                }
            }
            if (positionOnsheet == -1)
                positionOnsheet = rows.length

            writeRow(sheets, auth, spreadSheetId, sheet, positionOnsheet, values)
        }
    })

}

module.exports = {
    write: function (baseUrl, values) {
        // Load client secrets from a local file.
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Google Sheets API.
            //authorize(JSON.parse(content), listMajorss)
            authorize(JSON.parse(content), writeValues, baseUrl, values)
        })
    },
    readAll: function (callback) {
        // Load client secrets from a local file.
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Google Sheets API.
            authorizeRead(JSON.parse(content), siteList, callback)
        })
    }
}  