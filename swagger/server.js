const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`Swagger documentation available at http://localhost:${port}`);
});