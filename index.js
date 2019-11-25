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
  conn
    .sobject("ApexLog")
    .find({}, ["Id"])
    .sort({ LogLength: -1 })
    .execute({ autoFetch: true, maxFetch: 10000 }, function(err, records) {
      if (err) {
        return console.error(err);
      }
      console.log("Number of ApexLog records to be deleted: " + records.length);
      let job = conn.bulk.createJob("ApexLog", "delete");
      let batch = job.createBatch();
      batch.execute(records);
      batch.on("queue", batchInfo => {
        batch.poll(1000, 10000000);
        console.log("Delete job is started. Id of the job: " + batchInfo.jobId);
      });
      batch.on("progress", response => {
        batch.check().then(batchInfo => {
          process.stdout.write(
            "\x1Bc\rProcessed records: " +
              batchInfo.numberRecordsProcessed +
              " / " +
              records.length
          );
        });
      });
      batch.on("response", response => {
        batch.check().then(batchDetails => {
          console.log(
            "\nJob is finished, status of the job is:",
            batchDetails.state,
            ". Total processing time was " + batchDetails.totalProcessingTime,
            "ms"
          );
          if (batchDetails.numberRecordsFailed !== "0") {
            console.log(
              "Number of failed records: " + batchDetails.numberRecordsFailed
            );
          } else {
            console.log("All records were deleted sucessfully");
          }
        });
      });
      batch.on("error", response => {
        console.log("response", response);
      });
    });
}
