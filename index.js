const {SiteChecker} = require('broken-link-checker');
const fs = require('node:fs');
const util = require('node:util');
const colors = require('colors');
colors.enable();

// Get the current date
let currentDate = new Date();

// Format the date as YYYY-MM-DD
const formattedDate = currentDate.toLocaleString('en-GB', {
  timeZone: 'UTC',
  literal: '-'
}).replace(/\:/g, '-').replace(/\, /g, '-').replace(/\//g, '-');

console.log(`Running, this may take some time.`);
console.log(`Output is also saved to ./logs/link-checker-timestamp.csv`);
console.log(`----`);

var log_file = fs.createWriteStream(__dirname + '/logs/link-checker-' + formattedDate + '.csv', { flags: 'w' });
var log_files_checked = fs.createWriteStream(__dirname + '/logs/link-checker-checked-' + formattedDate + '.csv', { flags: 'w' });
var log_stdout = process.stdout;

console.csv = function(d,target) { //
  target.write(util.format(d) + '\n');
  // log_stdout.write(util.format(d) + '\n');
};

const options = {
  // Set your authentication credentials to avoid throttling
  auth: {
    // user: 'your_username',
    // pass: 'your_password',
    user: 'your_username',
    pass: 'your_password',
  },
  // not https prefix!
  url: [
    "www.preventionweb.net/knowledge-base/type-content/documents-publications"
  ]
  // Additional configurations...
};


// add a header to the csv
let csvHeader = "Tested URL, Page, Status message, Status code,";
console.csv(csvHeader,log_file);
console.csv("Page",log_files_checked);

// var { HtmlUrlChecker } = require("broken-link-checker");
var brokenUrlList = [];

// Use the options object to set authentication in the defaultBaseUrlList
const defaultBaseUrlList = options.url.map(url => `https://${url}`);
// const defaultBaseUrlList = options.url.map(url => `https://${options.auth.user}:${options.auth.pass}@${url}`);

function printProgress(progress){
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(progress);
}

async function main() {
  async function urlChecker(url) {
    await new Promise(resolve => {

      const siteChecker  = new SiteChecker (
        // https://github.com/stevenvachon/broken-link-checker#options
        {
          excludeInternalLinks: false,
          excludeExternalLinks: false,
          // excludedKeywords: ['*linkedin*'],
          // retryHeadFail: false,
          filterLevel: 0, // links only
          maxSocketsPerHost: 100,
          maxSockets: 50,
          excludeInternalLinks: true,
          cacheMaxAge: 60000,
          // cacheResponses: false,
          responseTimeout: 2000,
          customHeaders: { "undrr-dev-tester": "4J6Y8B2D9F6Q" },
          acceptedSchemes: ["http", "https"],
          requestMethod: "get",
          retryHeadCodes: [405,503],
          excludedKeywords: ["*www.twitter.com*", "*forms.office.com*"],
          // excludedKeywords: ["understanding-disaster-risk", "/community/", "/drr-glossary", "/knowledge-base", "/upload-your", "/sendai-framework/", "/publication/", "/news/", "/event", "community-voices/", "/blog-type/", "/news-type/", "/community/", "/collections/", "/blog/", "/vacancy/"],
          includedKeywords: ["www.preventionweb.net/knowledge-base/type-content/documents-publications/*"],
        },
        {
          "error": (error) => {
            console.error(error);
          },
          "queue": () => {
            console.log("queue")
          },
          "page": (error, pageURL, customData) => {
            printProgress(colors.green.bgWhite(`Testing page: ${pageURL}`));
            console.csv(pageURL,log_files_checked);
          },
          "link": (result) => {
            printProgress(colors.green.bgWhite(`Queue: on ${result.base.original} links ${siteChecker.numActiveLinks()} queued ${siteChecker.numQueuedLinks()} Pages ${siteChecker.numPages()}`));
            try {
              if (result.http.response == null) {
                result.http.response = {};
                result.http.response.statusCode = "ERRNO_EPROTO";
                // console.log('Caught ' + result.http.response.statusCode + " from " + result.base.original)
              }
              
              let link = `${result.http.response.statusCode} from ${result.base.original} => ${result.url.resolved}`;

              if (result.broken) {
                if (result.http.response && ![undefined, 400, 429, 999, 200, "ERRNO_EPROTO"].includes(result.http.response.statusCode)) {
                  // printProgress("broken".red, link);
                  
                  var urlCrawlResult = new Object();
                  urlCrawlResult.status = result.http.response.statusCode;
                  urlCrawlResult.url = result.url.resolved;
                  urlCrawlResult.htmlBaseUrl = result.base.original;
                  urlCrawlResult.statusMessage = result.http.response.statusMessage;

                  brokenUrlList.push(urlCrawlResult);

                  let message = urlCrawlResult.url + ", " + urlCrawlResult.htmlBaseUrl + ", " + urlCrawlResult.statusMessage + ", "+ urlCrawlResult.status + ", ";
                  console.csv(message,log_file);
                }
              } else {
                let currentDate = new Date();
                // printProgress("checked link: ".green, currentDate.getMinutes(), currentDate.getSeconds(), link);
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
        // url = new URL(url);
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