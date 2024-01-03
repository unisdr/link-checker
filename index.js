const {SiteChecker} = require('broken-link-checker');
// var { HtmlUrlChecker } = require("broken-link-checker");
var brokenUrlList = [];

const defaultBaseUrlList = [
  // add your user pass here to avoid 429 throttles
  // "https://www.undrr.org/about-undrr/work-us", // ERRNO_EPROTO example
  "https://user:pass@www.undrr.org/",
]

console.log(`Running, this may take some time. You will only see output for errors.`);

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
        // brokenUrlList.forEach(url => {
        //   let message = "\nurl is: " + url.url + "\n"
        //     + "html base url is: " + url.htmlBaseUrl + "\n"
        //     + "status message is: " + url.statusMessage + "\n"
        //     + "status is: " + url.status + "\n";

        //   console.log(message);
        // });
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