require("dotenv").config();
const jsforce = require("jsforce");
const { SF_USERNAME, SF_PASSWORD, SF_TOKEN, SF_LOGIN_URL } = process.env;
