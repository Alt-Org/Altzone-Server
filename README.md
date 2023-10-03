# Altzone-Server

This is a REST API for Altzone game

## Link to server

Server is now available on https://altzone.fi/

Server description is here https://altzone.fi/swagger

## Getting started

### Docker compose

1. Install docker [Windows](https://www.docker.com/products/docker-desktop/) | [Linux](https://docs.docker.com/engine/install/)
2. Start docker (by default it starts automatically, you can test whenever it is installed by running ```docker version```)
3. In the terminal run: ```npm install```
4. Run ```tsc -w``` (this command will recompile project after changes)
5. Run ```docker compose up``` (this will start the actual API in dev mode(=will restart API each time you make changes to files in the /src folder))
6. Stop the API by pressing CTRL+C and ```docker compose down```

### Directly on PC

#### Install software to run the API
1. You have to install Node.js version 18 to your computer. The installation process is similar to installing a regular program.
   You may download it here: [https://nodejs.org/en/download](https://nodejs.org/en/download). For Windows choose the LTS .msi 64-bit version.
2. Install MongoDB Community Server: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
3. After that go to the folder where you have saved the project and run ```npm install``` in the terminal

#### Create a .env file

Create .env file in the root directory.

Here is example *.env* content:

    HOST=localhost
    PORT=8080
    MONGO_URL=mongodb://127.0.0.1
    MONGO_PORT=27017
    MONGO_DB_NAME=altzone

#### Start API

In order to start the API, you need to run the following commands in the terminal(project root repository):
1. ```tsc -w```
2. ```npm run dev``` or ```node dist/index.js```

The API will start at http://localhost:8080 by default.

Do not forget to terminate processes in the end (both tsc and node) by pressing Ctrl+C in terminal.

## API Schema

![ERD](doc/img/ERD.png)


