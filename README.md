# GitHub Issue Tracker Action

![](https://github.com/actioncloud/issue-tracker-action/workflows/Test%20tracker/badge.svg)

This is a GitHub Action which runs periodically (e.g. once an hour) and grabs the current data from the Github API and stores it in a file in the repository(in the `.github/actioncloud/issue-tracker/data.json`). The code is mainly from [vscode-issue-tracker](https://github.com/lannonbr/vscode-issue-tracker), and I make it a GitHub Action.

## Usage

```yaml
# A workflow config example
name: Test tracker

on:
  # a cron schedule to run periodically
  schedule:
    - cron: '0 * * * *'

jobs:
  test_issue_tracker:
    runs-on: ubuntu-latest
    name: A job to test issue tracker
    steps:
    - name: Checkout
      uses: actions/checkout@v1
    - name: Track issues
      id: tracking
      uses: actioncloud/issue-tracker-action@master
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
    # you need git commit to push the issue data to the folder: .github/actioncloud
    - name: Git commit
      run: |
        # git commit if there's any change
        if test -n "$(git status --porcelain 2>/dev/null)"; then
            git config --global user.email "idegorepl@gmail.com"
            git config --global user.name "ActionCloud Bot"
            git add .
            git commit -m "Update forks data"
            git push
        fi
    # you can get badge code of ActionCloud viewer App, and click it to view your data
    - name: Check output
      run: echo '${{ steps.tracking.outputs.actioncloud-badge }}'
```

## GitHub Issue Tracker Viewer

The Action will store the issues data into your repository, and you need a web view page to see the chart. The viewer page is hosted in `actioncloud.io`, the url is `https://free.actioncloud.io/apps/github-issue-tracker?owner=<your_owner_name>&repo=<your_repo_name>`.

You can put a badge in your README file:

[![](https://img.shields.io/badge/ActionCloud%20App-Issue%20Tracker-blue)](https://free.actioncloud.io/apps/github-issue-tracker?owner=actioncloud&repo=issue-tracker-action)

```pre
# remember to change the owner_name and repo_name to yours:

[![](https://img.shields.io/badge/ActionCloud%20App-Issue%20Tracker-blue)](https://free.actioncloud.io/apps/github-issue-tracker?owner=<owner_name>&repo=<repo_name>)
```

### Page preview

![github issue tracker preview](https://raw.githubusercontent.com/actioncloud/actioncloud.github.io/master/apps/github-issue-tracker/images/issueTrackerPreview.png)
