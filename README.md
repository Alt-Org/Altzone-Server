# Altzone-Server

This is a REST API for the Altzone game. For API description see the wiki pages


## Links to APIs

Production https://altzone.fi/api (prod branch)
Latest release https://devapi.altzone.fi/latest-release (main branch)
Dev https://devapi.altzone.fi (dev branch)


## Swagger description

1. [Download latest swagger file version](https://devapi.altzone.fi/swagger-json) The most up-to-date API description

2. [Swagger on web](https://devapi.altzone.fi/swagger)


## Getting started

### Install required software

1. Install Node and npm, choose your platform and node version, which should be LTS [Download here](https://nodejs.org/en/download/prebuilt-installer/current)
2. Install docker [Instructions here](https://docs.docker.com/engine/install/)
3. Clone the API repo from GitHub [Link to repo](https://github.com/Alt-Org/Altzone-Server)
4. Open a cloned repo in the IDE and install required dependencies with ```npm install``` 

### Start required services

First, you need to set up the DB. So please run a script for it from the project root folder:

For Windows (PowerShell):
```shell
 powershell -ExecutionPolicy Bypass -File .\init-db-on-windows.ps1
```

For Linux (Bash):
```shell
 bash ./init-db-on-linux.sh
```

Then run ```docker compose up``` to start DB, mongo-express (UI for Mongo) and Nginx (it will take couple minutes for the first time)

### Start the API

Start the API in dev (watch) mode by running ```npm run start:dev``` in a new terminal. 

This command will compile TS to JS and create a dist folder. This folder should not be removed.

The API will be accessible on your machine on http://localhost:8080/

### Stop API and DB

1. Stop API by pressing Ctrl+C in terminal
2. Stop DB and all other Docker services by pressing Ctrl+C (mb couple times) and run ```docker compose down```


## DB Schema

![ERD](doc/img/ERD.png)


## API architecture schema

![architecture](doc/img/architecture/api_modules.svg)