const {SiteChecker} = require('broken-link-checker');
const fs = require('node:fs');
var util = require('node:util');

console.log(`Running, this may take some time. You will only see output for errors.`);
console.log(`Output is also save to logs/link-checker-timestamp.csv`);
console.log(`----`);
console.log(`Begin CSV readout...`);

var log_file = fs.createWriteStream(__dirname + '/logs/link-checker-'+Math.floor(Date.now() / 1000)+'.csv', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

// add a header to the csv
let csvHeader = "Tested URL, Page, Status message, Status code,";
console.log(csvHeader);

// var { HtmlUrlChecker } = require("broken-link-checker");
var brokenUrlList = [];

const defaultBaseUrlList = [
  // add your user pass here to avoid 429 throttles
  // "https://www.undrr.org/about-undrr/work-us", // ERRNO_EPROTO example
  "https://user:pass@www.undrr.org/",
]

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
          maxSocketsPerHost: 5,
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
              
              let brokenLink = `${result.http.response.statusCode} from ${result.base.original} => ${result.url.resolved}`;

              if (result.broken) {
                if (result.http.response && ![undefined, 400, 429, 999, 200].includes(result.http.response.statusCode)) {
                  
                  var urlCrawlResult = new Object();
                  urlCrawlResult.status = result.http.response.statusCode;
                  urlCrawlResult.url = result.url.resolved;
                  urlCrawlResult.htmlBaseUrl = result.base.original;
                  urlCrawlResult.statusMessage = result.http.response.statusMessage;

                  brokenUrlList.push(urlCrawlResult);

                  let message = urlCrawlResult.url + ", " + urlCrawlResult.htmlBaseUrl + ", " + urlCrawlResult.statusMessage + ", "+ urlCrawlResult.status + ", ";
                  console.log(message);
                }
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