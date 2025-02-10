# Altzone-Server

This is a REST API for the Altzone game. For API description see the wiki pages


## Releases

- [Release notes 09.02.2025](https://github.com/Alt-Org/Altzone-Server/blob/dev/doc/release-notes/release-09-02-2025.md)
- [Release notes 26.01.2025](https://github.com/Alt-Org/Altzone-Server/blob/dev/doc/release-notes/release-26-01-2025.md)
- [Release notes 23.12.2024](https://github.com/Alt-Org/Altzone-Server/blob/dev/doc/release-notes/release-23-12-2024.md)


## Link to the API

Production https://altzone.fi/api (prod branch)
Latest release https://devapi.altzone.fi/latest-release (main branch)
Dev https://devapi.altzone.fi (dev branch)


## Swagger description

1. [Latest swagger file version](https://github.com/Alt-Org/Altzone-Server/blob/dev/swagger/swagger.json) The most up-to-date API description

2. [Swagger on web](https://swagger.altzone.fi/)

## Wiki pages quick access

### Client side docs (game and webpages teams):

#### [General info](https://github.com/Alt-Org/Altzone-Server/wiki)
#### [Authentication and authorization](https://github.com/Alt-Org/Altzone-Server/wiki/2.-Authentication-and-authorization)
#### [Data fetching (GET requests)](https://github.com/Alt-Org/Altzone-Server/wiki/3.-Data-fetching-(GET-requests))

### API developers pages:

#### [Development process](https://github.com/Alt-Org/Altzone-Server/wiki/Development-process)
#### [Branches](https://github.com/Alt-Org/Altzone-Server/wiki/Branches)
#### [JSDocs](https://github.com/Alt-Org/Altzone-Server/wiki/JSDocs)
#### [Tests](https://github.com/Alt-Org/Altzone-Server/wiki/Tests)
#### [Pull request check list](https://github.com/Alt-Org/Altzone-Server/wiki/Pull-request-check-list)
#### [Documentation](https://github.com/Alt-Org/Altzone-Server/wiki/Documentation)
#### [Files that should not be modified](https://github.com/Alt-Org/Altzone-Server/wiki/Files-that-should-not-be-modified)
#### [What to do if](https://github.com/Alt-Org/Altzone-Server/wiki/What-to-do-if)

## Getting started

### Install required software

1. Install Node and npm, choose your platform and node version, which should be LTS [Download here](https://nodejs.org/en/download/prebuilt-installer/current)
2. Install docker [Instructions here](https://docs.docker.com/engine/install/)
3. Clone the API repo from GitHub [Link to repo](https://github.com/Alt-Org/Altzone-Server)
4. Open cloned repo in IDE and install required dependencies with ```npm install``` 

### Start DB

Run ```docker compose up``` to start DB, mongo-express (UI for Mongo) and Nginx (it will take couple minutes for the first time)

### Start the API

Start the API in dev (watch) mode by running ```npm run start:dev``` in a new terminal. 

This command will compile TS to JS and create a dist folder. This folder should not be removed.

The server will be accessible on your machine on http://localhost:8080/

### Stop API and DB

1. Stop API by pressing Ctrl+C in terminal
2. Stop DB and all other Docker services by pressing Ctrl+C (mb couple times) and run ```docker compose down```


## DB Schema

![ERD](doc/img/ERD.png)


## API architecture schema

![architecture](doc/img/architecture/api_modules.svg)