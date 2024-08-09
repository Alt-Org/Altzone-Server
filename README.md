# Altzone-Server

This is a REST API for the Altzone game. For API description see the wiki pages


## Link to the production API

Server is available on https://altzone.fi/api


## Swagger description

[Swagger](https://swagger.altzone.fi/)


## Getting started

### Install required software

1. Install Node and npm, choose your platform and node version, which should be LTS [Download here](https://nodejs.org/en/download/prebuilt-installer/current)
2. Install docker [Instructions here](https://docs.docker.com/engine/install/)
3. Clone the API repo from GitHub [Link to repo](https://github.com/Alt-Org/Altzone-Server)
4. Open cloned repo in IDE and install required dependencies with ```npm install``` 

### Start DB

Run ```docker compose up``` to start DB, mondo-express (UI for Mongo) and Nginx (it will take couple minutes for the first time)

### Start the API

Start the API in dev (watch) mode by running ```npm run start:dev``` in a new terminal. 

This command will compile TS to JS and create a dist folder. This folder should not be removed.

The server will be accessible on your machine on http://localhost:8080/

### Stop API and DB

1. Stop API by pressing Ctrl+C in terminal
2. Stop DB and all other Docker services by pressing Ctrl+C (mb couple times) and run ```docker compose down```


## DB Schema

![ERD](doc/img/ERD.png)


## Instructions for development team

Instruction can be found from wiki pages on pages with dev word in the beginning: [Wiki pages](https://github.com/Alt-Org/Altzone-Server/wiki)


## Wiki pages quick access

### General information

 - [Home page](https://github.com/Alt-Org/Altzone-Server/wiki)
 - [Authentication and authorization](https://github.com/Alt-Org/Altzone-Server/wiki/2.-Authentication-and-authorization)
 - [Data fetching](https://github.com/Alt-Org/Altzone-Server/wiki/3.-Data-fetching-(GET-requests))

### API Developers Pages

 - [Dev process and Branches](https://github.com/Alt-Org/Altzone-Server/wiki/dev-Branches)