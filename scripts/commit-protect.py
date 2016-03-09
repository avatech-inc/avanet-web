
import sys
import os

import requests
from parse import parse

circle_api = ('https://circleci.com/api/v1/project/{circle_username}/'
              '{circle_repo}/{circle_build}?circle-token={circle_token}')
github_api = ('https://api.github.com/repos/{username}/{repo}/compare/'
              '{circle_branch}...{sha1}')

commit_pattern = '{message} - depends on {username}/{repo}#{sha1}'
error_message = ('Refusing to deploy {current_sha1}, depends on {username}/'
                 '{repo}#{sha1} being deployed to {circle_branch}.')

circle_username = os.environ.get('CIRCLE_PROJECT_USERNAME')
circle_repo = os.environ.get('CIRCLE_PROJECT_REPONAME')
circle_build = os.environ.get('CIRCLE_BUILD_NUM')
circle_branch = os.environ.get('CIRCLE_BRANCH')

circle_token = os.environ.get('CIRCLE_TOKEN')
github_token = os.environ.get('GITHUB_TOKEN')

if __name__ == '__main__':
    res = requests.get(circle_api.format(**vars()))

    for commit in res.json().get('all_commit_details', []):
        subject = commit.get('subject', '')
        current_sha1 = commit.get('commit')

        if ' - depends on ' in subject:
            depends = parse(commit_pattern, subject)

            username = depends.get('username')
            repo = depends.get('repo')
            sha1 = depends.get('sha1')

            res = requests.get(github_api.format(**vars()), headers=dict(
                authorization='token {github_token}'.format(**vars()))
            )

            status = res.json().get('status')

            if status == 'behind' or status == 'identical':
                sys.exit(os.EX_OK)
            else:
                print(error_message.format(**vars()))

                sys.exit(os.EX_TEMPFAIL)
