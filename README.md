# Avanet Web Client

## Install

1. Install npm packages: ```npm install```

## Run

On the first build:

- `npm run build:develop`

Then, and for subsequent builds:

- `npm start`

View in browser: `http://localhost:8080/`. Page reloads automatically when changes are made.

## Testing

Start the Jasmine test server:

- `npm run test-server`

View in browser: `http://localhost:8888/webpack-dev-server/SpecRunner.html`. Tests in browser re-run automatically when changes are made.

Or run tests in PhantomJS (this is what runs on CI):

- `grunt jasmine`

## Deploying

Code is deployed via rsyncing static assets to the server. Pushing to the `develop` branch pushes code to avanet-demo.avatech.com. Pushing to the `master` branch pushes code to avanet.avatech.com.

Both deploys happen on CI once tests pass.