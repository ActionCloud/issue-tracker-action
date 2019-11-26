const core = require('@actions/core');
const fs = require('fs');
const fetch = require("node-fetch");
const moment = require("moment");

const dataDir = `./.github/actioncloud/issue-tracker`;
if (!fs.existsSync(dataDir)){
  fs.mkdirSync(dataDir, { recursive: true });
}
const dataFilePath = dataDir + '/data.json'
let issueData = [];
fs.readFile(dataFilePath, 'utf8', (err, data) => {
  if (!err) {
    var jsonObj = JSON.parse(data);
    if (typeof jsonObj === "object") {
      issueData = jsonObj
    }
  }
});

const githubToken = core.getInput('github-token');
const repo = process.env.GITHUB_REPOSITORY;
const repoInfo = repo.split("/");
const repoOwner = repoInfo[0];
const repoName = repoInfo[1];

const body = state =>
  JSON.stringify({
    query: `
        query {
            repository(owner:"${repoOwner}", name:"${repoName}") {
                issues(states:${state}) {
                  totalCount
                }
              }
        }`
  });

function getIssues(body) {
  const url = "https://api.github.com/graphql";
  const options = {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `bearer ${githubToken}`
    }
  };

  return fetch(url, options)
    .then(resp => resp.json())
    .then(data => {
      return data.data.repository.issues.totalCount;
    }).catch((err) => {console.log(err)});
}

function getOpenIssues() {
  return getIssues(body("OPEN"));
}

function getClosedIssues() {
  return getIssues(body("CLOSED"));
}

function storeData(record) {
  issueData.push(record);
}

function dumpData() {
  const jsonData = JSON.stringify(issueData);
  fs.writeFile(dataFilePath, jsonData, (err) => {
    if (err) throw err;
  });
}

async function run() {
  var openIssues = await getOpenIssues();
  var closedIssues = await getClosedIssues();
  const now = moment().unix();

  storeData({
    timestamp: now,
    openIssues: openIssues,
    closedIssues: closedIssues
  });

  dumpData();
  const actioncloudBadge = '[![](https://img.shields.io/badge/ActionCloud%20App-Issue%20Tracker-blue)](https://free.actioncloud.io/apps/github-issue-tracker?owner=' + repoOwner + '&repo=' + repoName + ')';
  console.log(`::set-output name=actioncloud-badge::${actioncloudBadge}`)
}

run();
