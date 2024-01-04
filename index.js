const {SiteChecker} = require('broken-link-checker');
const fs = require('node:fs');
const util = require('node:util');
const colors = require('colors');
colors.enable();

console.log(`Running, this may take some time. You will only see output for errors.`);
console.log(`Output is also save to logs/link-checker-timestamp.csv`);
console.log(`----`);
console.log(`Begin CSV readout...`);

var log_file = fs.createWriteStream(__dirname + '/logs/link-checker-'+Math.floor(Date.now() / 1000)+'.csv', {flags : 'w'});
var log_stdout = process.stdout;

console.csv = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

const options = {
  // Set your authentication credentials to avoid throttling
  auth: {
    // user: 'your_username',
    // pass: 'your_password',
  },
  // not https prefix!
  url: [
    "www.undrr.org/implementing-sendai-framework/catalyze-investment-in-resilience",
    "www.preventionweb.net/understanding-disaster-risk"
  ]
  // Additional configurations...
};


// add a header to the csv
let csvHeader = "Tested URL, Page, Status message, Status code,";
console.csv(csvHeader);

// var { HtmlUrlChecker } = require("broken-link-checker");
var brokenUrlList = [];

// Use the options object to set authentication in the defaultBaseUrlList
const defaultBaseUrlList = options.url.map(url => `https://${options.auth.user}:${options.auth.pass}@${url}`);

async function main() {
  async function urlChecker(url) {
    await new Promise(resolve => {

      const siteChecker  = new SiteChecker (
        // https://github.com/stevenvachon/broken-link-checker#options
        {
          excludeInternalLinks: false,
          excludeExternalLinks: false,
          // excludedKeywords: ['*linkedin*'],
          filterLevel: 0, // links only
          maxSocketsPerHost: 10,
          acceptedSchemes: ["http", "https"],
          requestMethod: "get"
        },
        {
          "error": (error) => {
            console.error(error);
          },
          "link": (result) => {
            try {
              if (result.http.response == null) {
                result.http.response = {};
                result.http.response.statusCode = "ERRNO_EPROTO";
                // console.log('Caught ' + result.http.response.statusCode + " from " + result.base.original)
              }
              
              let link = `${result.http.response.statusCode} from ${result.base.original} => ${result.url.resolved}`;

              if (result.broken) {
                if (result.http.response && ![undefined, 400, 429, 999, 200].includes(result.http.response.statusCode)) {
                  console.log("broken".red, link);
                  
                  var urlCrawlResult = new Object();
                  urlCrawlResult.status = result.http.response.statusCode;
                  urlCrawlResult.url = result.url.resolved;
                  urlCrawlResult.htmlBaseUrl = result.base.original;
                  urlCrawlResult.statusMessage = result.http.response.statusMessage;

                  brokenUrlList.push(urlCrawlResult);

                  let message = urlCrawlResult.url + ", " + urlCrawlResult.htmlBaseUrl + ", " + urlCrawlResult.statusMessage + ", "+ urlCrawlResult.status + ", ";
                  console.csv(message);
                }
              } else {
                console.log("checked".green, link);
              }
            } catch (error) {
              console.log(result)
              console.log(error)
              console.log("error encountered, stopping checking ..");
              resolve();
            }

          },
          "end": () => {
            console.log("base url check completed..");
            resolve();
          }
        }
      );

      try {
        siteChecker.enqueue(url);

      } catch (error) {
        console.log(error)
      }

    });
  }

  async function checkAndGetResults() {

    for (let baseUrl of defaultBaseUrlList) {
      await urlChecker(baseUrl);
    }

    await new Promise(resolve => {
      if (brokenUrlList.length > 0) {
        console.log(`${brokenUrlList.length} errors found.`);
      }
      else {
        console.log("\nJob Completed.. There is no broken links!!")
      }

      resolve();
    });
  }

  async function executeJob() {
    await checkAndGetResults();
    process.exit(0);
  };

  executeJob();
}

main(...process.argv.slice(2));