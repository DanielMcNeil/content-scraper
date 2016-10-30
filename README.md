# content-scraper
Full Stack JavaScript Techdegree Project 6

A web crawler that gets t-shirt data from the http://shirts4mike.com website once per 24 hours.

**notes**

I used the x-ray module for the web crawler, fast-csv for the csv writer, and async for iterating the tshirt links.

each of these modules have active development (multiple releases, with the latest release being fairly recently).  Most of these have multiple contributors.  They also have fairly good (for the most part) documentation.

I used the async module to ensure that all of the data that I needed was collected before being passed to the function that writes the csv.  (asynchronous execution is definatly a double-edged sword)

I used the JSHint module when running 'npm run lint'.  The '|| true' in the package.json file supresses the npm error message that is thrown when JSHint finds syntax errors.  The JSHint error message provides all of the necessary information, the additional NPM message is unnecessary (the NPM error message does go away if you don't have any JavaScript syntax errors).