# Avanet Web Client

## Install

1. Node.js - Download and Install [Node.js](http://www.nodejs.org/download/). You can also follow [this gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm (Node Package Manager)
2. Clone repo
3. Install npm packages: ```sudo npm install```
4. Install Gulp globally ```sudo npm install -g gulp```

## Run

1. Run locally: ```gulp start```
2. View in browser: ```http://localhost:3000/```

## Build & Deploy

Install and login to the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command)

#### Build 

- Build: `gulp build`
- Run built app: `gulp start-dist`

#### Deploy

- Deploy to prod: `gulp deploy --app=avanet`
- Deploy to demo: `gulp deploy --app=avanet-demo`
- To combine build and deploy into a single step, run  `gulp build-deploy` (with `--app` arg as above)
- **IMPORTANT:** The gulp script does not set any default app settings. Please make sure all app variables (such as API URL etc.) are properly set before deploying. 

