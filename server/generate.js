const csv = require('csv-parser')
const fs = require('fs')
let {google} = require('googleapis');
let privatekey = require("../secrets.json");

const results = {};
results.all = [];
 
var SrcFileRegex = /^data\/(.*).csv$/

function addToResults(entry, labelstr, fileprefix) {
    results["all"].push(entry)

    if (!labelstr) {
        return
    }

    var labels = labelstr.split(",").map(item => item.trim());

    if (fileprefix) {
        labels.push(fileprefix)
    }

    labels.forEach(label => {
        if (label) {
            if (!results[label]) {
                results[label] = [entry]
            } else {
                results[label].push(entry)
            }
        }
    });
}

function generateFile(label) {
    let labeldata = labels[label]
    if (!labeldata) {
        labeldata = {}
    }

    let timeline = {
        "title": {
              "text": {
                "headline": labeldata.headline || `Seth Family Timeline - ${label}`,
                "text": labeldata.text || "The family tree of the Seth family, starting with Behari Lal and Rukmani Bai Seth c. 2014 appears on the left"
              }
        },
        "events" : results[label]
    }

    fs.writeFileSync(`public/json/sethfamily-${label}.json`, JSON.stringify(timeline, null, 2))

}

function initTimelineEntry(year, month, day, headline, text, media, caption) {
    let entry = {
        "start_date": {
            "month": month,
            "day": day,
            "year": year
        },
        "text": {
            "headline": headline,
            "text": text
        }
    }

    if (media) {
        entry.media = {
            "url": media,
            "caption": caption,
            "credit": ""
        }
    }

    return entry

}

function processInputFile(filename) {
    return new Promise(function(resolve, reject) {
        let fileprefix = ""
        let fileprefixes = filename.match(SrcFileRegex);
        if (fileprefixes) {
            fileprefix = fileprefixes[1];
        }

        try {
            fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (data) => {
                let timelineEntry = initTimelineEntry(data.Year, data.Month, data.Day, data.Headline, data.Text, data.Media, data['Media Caption'])
                
                addToResults(timelineEntry, data.Label, fileprefix)

            })
            .on('end', () => {
                resolve(filename)
            })        
        } 
        catch(error) {
            reject(error)
        }
    })
}

async function processAllFiles() {
    var files = fs.readdirSync('data').filter(fn => fn.endsWith('.csv'))
    for (var i = 0; i < files.length; i++) {
        filename = await processInputFile('data/' + files[i])
        console.log(filename + " completed")
    }

    Object.keys(results).forEach(label => generateFile(label))
}

let labels = JSON.parse(fs.readFileSync('public/labels.json')).labels;


function generateAllFiles() {
    var fs = require('fs');
    if (!fs.existsSync('public/json')) fs.mkdirSync('public/json'); 

    let spreadsheetId = '1OWJh840Fy04OsazqS-TUZfdZ4zme7iOgEjatIkO093U';
    let eventRange = 'events!A2:H'
    let sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: eventRange
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
            } else {
                for (let row of response.data.values) {
                    let timelineEntry = initTimelineEntry(...row)
                    addToResults(timelineEntry, row[7], null)
                }
                Object.keys(results).forEach(label => generateFile(label))
            }
    });

}

let jwtClient = new google.auth.JWT(
    privatekey.client_email,
    null,
    privatekey.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']);
    //  'https://www.googleapis.com/auth/drive',
    //  'https://www.googleapis.com/auth/calendar'

    //authenticate request
jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log("Successfully connected to google!");
    }
});

function generateResult(label, lab_results) {
    let labeldata = labels[label]
    if (!labeldata) {
        labeldata = {}
    }

    let timeline = {
        "title": {
              "text": {
                "headline": labeldata.headline || `Seth Family Timeline - ${label}`,
                "text": labeldata.text || "The family tree of the Seth family, starting with Behari Lal and Rukmani Bai Seth c. 2014 appears on the left"
              }
        },
        "events" : lab_results
    }

    return JSON.stringify(timeline, null, 2)

}

function containsLabel(filterlabel, labelstr) {
    if (filterlabel == "all") {
        return true;
    }

    if (!labelstr) {
        return false
    }

    var labels = labelstr.split(",").map(item => item.trim());

    for (let label of labels) {
        if (label && label == filterlabel) {
            return true
        }
    }

    return false
}

function getJsonFromSheet() {
    return (req, res) => {
        let results = [];
        let filterlabel = req.params.label
        console.log('Processing label ' + filterlabel)
        let spreadsheetId = '1OWJh840Fy04OsazqS-TUZfdZ4zme7iOgEjatIkO093U';
        let eventRange = 'events!A2:H'
        let sheets = google.sheets('v4');
        sheets.spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: spreadsheetId,
            range: eventRange
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
            } else {
                for (let row of response.data.values) {
                    let timelineEntry = initTimelineEntry(...row)
                    //console.log(timelineEntry)
                    if (containsLabel(filterlabel, row[7])) {
                        results.push(timelineEntry)
                    }
                }
                res.send(generateResult(filterlabel, results))
            }
        })
    }        
}

module.exports = {
    getJsonFromSheet,
    generateAllFiles
}

