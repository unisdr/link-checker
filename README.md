# link-checker

## Overview

`link-checker` uses [broken-link-checker](https://github.com/stevenvachon/broken-link-checker) to identify any broken links on UNDRR projects.

It is currently limited to only UNDRR.org and will take a long time to run

## Usage

### Installation

To get started, install the necessary dependencies using npm:

```bash
npm install
```

### Configuration

To prevent 429 throttling issues, it's recommended to set your username and password in the `index.js` file.

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