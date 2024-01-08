# link-checker

## Overview

`link-checker` uses [broken-link-checker](https://github.com/stevenvachon/broken-link-checker) to identify any broken links on UNDRR projects.

It is currently limited to only UNDRR.org and will take a long time to run

### Fork repo

Note we install from https://github.com/khawkins98/broken-link-checker (https://github.com/khawkins98/broken-link-checker/archive/refs/tags/v0.0.1.tar.gz) to allow setting for the header. This is needed until https://github.com/stevenvachon/broken-link-checker/pull/263 is merged. We use the .tar.gz file as github is funny when dealing with fork repos.

## Usage

### Installation

To get started, install the necessary dependencies using npm:

```bash
npm install
```

### Configuration

To prevent 429 throttling issues, it's recommended to set your username and password in the `index.js` file.

```js
const siteChecker  = new SiteChecker (
  {
    customHeaders: { "your-header": "secret" },
```

You can also pass a user/pass header.

```javascript
// index.js
const options = {
  // Set your authentication credentials to avoid 429 throttling
  auth: {
    user: 'your_username',
    pass: 'your_password',
  },
  // Additional configurations...
};
```

### Execution

Run the link checker using the following command:

```bash
npm start
```

## Background

This project utilizes the [broken-link-checker](https://github.com/stevenvachon/broken-link-checker) library to perform link checks. It was created to address the requirements outlined in [this GitLab issue](https://gitlab.com/undrr/web-backlog/-/issues/1461).

## Future Plans

In future releases, the project aims to integrate seamlessly with GitHub Actions, streamlining the link-checking process as part of continuous integration. Two potential options are being explored for this purpose:

1. [broken-link-checker-action](https://github.com/marketplace/actions/broken-link-checker-action): A GitHub Action specifically designed for checking broken links.

2. [broken-link-check](https://github.com/marketplace/actions/broken-link-check): Another GitHub Action tailored for identifying broken links in a repository.

Alternatively, the project is considering the use of [linkinator](https://github.com/JustinBeckwith/linkinator), a versatile link-checking tool. The [GitHub Actions integration](https://github.com/JustinBeckwith/linkinator#github-actions) for linkinator provides an alternative approach to address broken link issues within a GitHub repository.