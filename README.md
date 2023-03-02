# Altzone-Server
REST API

## Getting started

### Install software to run the API
1. You have to install Node.js version 18 to your computer. The installation process is similar to installing a regular program. 
You may download it here: [https://nodejs.org/en/download](https://nodejs.org/en/download). For Windows choose the LTS .msi 64-bit version.
2. After that go to the folder where you have saved the project and run ```npm install```

### Start the API
In order to start the API, you need to run the following commands in the terminal(project root repository):
1. ```tsc -w```
2. ```node dist/index.js```

The API will start at http://localhost:8080 by default.

Do not forget to terminate processes in the end (both tsc and node) by pressing Ctrl+C in terminal.

*Currently, the API is only available to run in development mode

## API Schema

![ERD first part](https://github.com/Alt-Org/Altzone-Server/doc/img/ERD1.png)

![ERD second part](https://github.com/Alt-Org/Altzone-Server/doc/img/ERD2.png)

![Relational diagram](https://github.com/Alt-Org/Altzone-Server/doc/img/Relational.png)