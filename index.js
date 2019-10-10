require("dotenv").config();

const jsforce = require("jsforce");
const chalk = require("chalk");
const log = console.log;
const { SF_USERNAME, SF_PASSWORD, SF_TOKEN, SF_LOGIN_URL } = process.env;
const conn = new jsforce.Connection({ loginUrl: SF_LOGIN_URL });
const DELETE_APEX_LOGS = "deleteApexLogs";

if (!(SF_USERNAME && SF_PASSWORD && SF_TOKEN && SF_LOGIN_URL)) {
  log(
    chalk.red.bold(
      "Cannot start app: missing mandatory configuration. Please add Username, Password, Token and Login Url to Your .env file"
    )
  );
  process.exit(-1);
}

let callback = null;
if (process.argv[2]) {
  console.log(process.argv[2]);
  switch (process.argv[2]) {
    case DELETE_APEX_LOGS:
      callback = deleteApexLogs;
      break;
    default:
      log(
        chalk.blue("Sorry, I don't know this command: ") +
          chalk.bold.inverse(process.argv[2])
      );
      log(chalk.blue("Available commands are: "));
      log(chalk.underline.green(DELETE_APEX_LOGS));
  }
}
if (callback) {
  login(callback);
}

function login(callback) {
  conn.login(SF_USERNAME, SF_PASSWORD + SF_TOKEN, err => {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    if (callback) {
      callback();
    }
  });
}

function deleteApexLogs() {
  conn.bulk.pollInterval = 10000;
  conn.bulk.pollTimeout = 60000;
  conn
    .sobject("ApexLog")
    .find({}, ["Id"])
    .sort({ LogLength: -1 })
    .execute({ autoFetch: true, maxFetch: 10000 }, function(err, records) {
      if (err) {
        return console.error(err);
      }
      console.log(records.length);
    })
    .del({ allowRecursive: true }, function(err, rets) {
      if (err) {
        return console.error(err);
      }
      log(chalk.bold.green("NUMBER OF DELETED RECORDS: ") + rets.length);
    });
}
