import { LinkChecker, LinkState, getConfig } from 'linkinator';

async function complex() {
  // create a new `LinkChecker` that we'll use to run the scan.
  const checker = new LinkChecker();

  // Respond to the beginning of a new page being scanned
  checker.on('pagestart', url => {
    console.log(`Scanning ${url}`);
  });

  // After a page is scanned, check out the results!
  checker.on('link', result => {

    // check the specific url that was scanned
    console.log(`  ${result.url}`);

    // How did the scan go?  Potential states are `BROKEN`, `OK`, and `SKIPPED`
    console.log(`  ${result.state}`);

    // What was the status code of the response?
    console.log(`  ${result.status}`);

    // What page linked here?
    console.log(`  ${result.parent}`);
  });

  // Go ahead and start the scan! As events occur, we will see them above.
  const result = await checker.check({
    // path: 'https://www.preventionweb.net/understanding-disaster-risk/terminology/hips',
    path: 'https://allaboutken.com',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
    },
    // port: 8673,
    "concurrency": 100,
    verbosity: "none",
    format: "csv",
    recurse: true,
    // linksToSkip: [
    //   'https://jbeckwith.com/some/link',
    //   'http://example.com'
    // ]
  });

  // Check to see if the scan passed!
  console.log(result.passed ? 'PASSED :D' : 'FAILED :(');

  // How many links did we scan?
  console.log(`Scanned total of ${result.links.length} links!`);

  // The final result will contain the list of checked links, and the pass/fail
  const brokeLinksCount = result.links.filter(x => x.state === 'BROKEN');
  console.log(`Detected ${brokeLinksCount.length} broken links.`);
}

complex();