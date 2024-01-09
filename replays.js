const {UrlChecker} = require('broken-link-checker');
const extractUrls = require("extract-urls");
const fs = require('node:fs');
const util = require('node:util');
const colors = require('colors');
colors.enable();

// Get the current date
const currentDate = new Date();

// Format the date as YYYY-MM-DD
const formattedDate = currentDate.toLocaleString('en-GB', {
  timeZone: 'UTC',
  literal: '-'
}).replace(/\:/g, '-').replace(/\, /g, '-').replace(/\//g, '-');

console.log(`Running, this may take some time.`);
console.log(`Output is also saved to ./logs/link-checker-timestamp.csv`);
console.log(`----`);

var log_file = fs.createWriteStream(__dirname + '/logs/link-checker-' + formattedDate + '.csv', { flags: 'w' });
var log_stdout = process.stdout;

console.csv = function(d) { //
  log_file.write(util.format(d) + '\n');
  // log_stdout.write(util.format(d) + '\n');
};

// add a header to the csv
let csvHeader = "Tested URL, Redirect, Status message, Status code,";
console.csv(csvHeader);

// load the links from replays.txt
console.log('Loading replays.txt and extracting links...')
var replaystxt;
try {
  replaystxt = fs.readFileSync(__dirname + '/replays.txt', 'utf8');
  console.log('... done.')
} catch (err) {
  console.error(err);
}

let urls = extractUrls(replaystxt);
console.log(urls)

const options = {
  excludeInternalLinks: true,
  excludeExternalLinks: false,
  // excludedKeywords: ['*linkedin*'],
  filterLevel: 0, // links only
  maxSocketsPerHost: 20,
  cacheResponses: false,
  cacheMaxAge: 1,
  customHeaders: { "your-header": "secret" },
  acceptedSchemes: ["http", "https"],
  // requestMethod: "get",
  retryHeadCodes: [405,503],
  // excludedKeywords: ["understanding-disaster-risk", "/community/", "/drr-glossary", "/knowledge-base", "/upload-your", "/sendai-framework/", "/publication/", "/news/", "/event", "community-voices/", "/blog-type/", "/news-type/", "/community/", "/collections/", "/blog/", "/vacancy/"],
  // includedKeywords: ["www.preventionweb.net/understanding-disaster-risk/terminology/hips/*"],
};

const urlChecker = new UrlChecker(options,{
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
      
      // console.log(result)
      let link = `${result.http.response.statusCode} | ${result.url.resolved} => ${result.url.redirected} `;
      console.log(link)
      var urlCrawlResult = new Object();
      urlCrawlResult.status = result.http.response.statusCode;
      urlCrawlResult.url = result.url.resolved;
      urlCrawlResult.redirected = result.url.redirected;
      urlCrawlResult.htmlBaseUrl = result.base.original;
      urlCrawlResult.statusMessage = result.http.response.statusMessage;
      let message = urlCrawlResult.url + ", " + urlCrawlResult.redirected + ", " + urlCrawlResult.statusMessage + ", "+ urlCrawlResult.status + ", ";
      console.csv(message);

      if (result.broken) {
        if (result.http.response && ![undefined, 400, 429, 999, 200, "ERRNO_EPROTO"].includes(result.http.response.statusCode)) {
          console.log("broken".red, link);
          brokenUrlList.push(urlCrawlResult);

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
    // resolve();
  }



});

for (let url of urls) {
 urlChecker.enqueue(url);;
}






// // Use the options object to set authentication in the defaultBaseUrlList
// const defaultBaseUrlList = options.url.map(url => `${url}`);
// console.log(defaultBaseUrlList)

// async function main() {
//   async function urlChecker(url) {
//     await new Promise(resolve => {

//       const siteChecker  = new SiteChecker (
//         // https://github.com/stevenvachon/broken-link-checker#options
//         {
//           excludeInternalLinks: true,
//           excludeExternalLinks: false,
//           // excludedKeywords: ['*linkedin*'],
//           filterLevel: 0, // links only
//           maxSocketsPerHost: 20,
//           cacheMaxAge: 1,
//           customHeaders: { "your-header": "secret" },
//           acceptedSchemes: ["http", "https"],
//           // requestMethod: "get",
//           retryHeadCodes: [405,503],
//           // excludedKeywords: ["understanding-disaster-risk", "/community/", "/drr-glossary", "/knowledge-base", "/upload-your", "/sendai-framework/", "/publication/", "/news/", "/event", "community-voices/", "/blog-type/", "/news-type/", "/community/", "/collections/", "/blog/", "/vacancy/"],
//           // includedKeywords: ["www.preventionweb.net/understanding-disaster-risk/terminology/hips/*"],
//         },
//         {
//           "error": (error) => {
//             console.error(error);
//           },
//           "link": (result) => {
//             try {
//               if (result.http.response == null) {
//                 result.http.response = {};
//                 result.http.response.statusCode = "ERRNO_EPROTO";
//                 // console.log('Caught ' + result.http.response.statusCode + " from " + result.base.original)
//               }
              
//               let link = `${result.http.response.statusCode} from ${result.base.original} => ${result.url.resolved}`;

//               if (result.broken) {
//                 if (result.http.response && ![undefined, 400, 429, 999, 200, "ERRNO_EPROTO"].includes(result.http.response.statusCode)) {
//                   console.log("broken".red, link);
                  
//                   var urlCrawlResult = new Object();
//                   urlCrawlResult.status = result.http.response.statusCode;
//                   urlCrawlResult.url = result.url.resolved;
//                   urlCrawlResult.htmlBaseUrl = result.base.original;
//                   urlCrawlResult.statusMessage = result.http.response.statusMessage;

//                   brokenUrlList.push(urlCrawlResult);

//                   let message = urlCrawlResult.url + ", " + urlCrawlResult.htmlBaseUrl + ", " + urlCrawlResult.statusMessage + ", "+ urlCrawlResult.status + ", ";
//                   console.csv(message);
//                 }
//               } else {
//                 console.log("checked".green, link);
//               }
//             } catch (error) {
//               console.log(result)
//               console.log(error)
//               console.log("error encountered, stopping checking ..");
//               resolve();
//             }

//           },
//           "end": () => {
//             console.log("base url check completed..");
//             resolve();
//           }
//         }
//       );

//       try {
//         siteChecker.enqueue(url);

//       } catch (error) {
//         console.log(error)
//       }

//     });
//   }

//   async function checkAndGetResults() {

//     for (let baseUrl of defaultBaseUrlList) {
//       await urlChecker(baseUrl);
//     }

//     await new Promise(resolve => {
//       if (brokenUrlList.length > 0) {
//         console.log(`${brokenUrlList.length} errors found.`);
//       }
//       else {
//         console.log("\nJob Completed.. There is no broken links!!")
//       }

//       resolve();
//     });
//   }

//   async function executeJob() {
//     await checkAndGetResults();
//     process.exit(0);
//   };

//   executeJob();
// }

// main(...process.argv.slice(2));