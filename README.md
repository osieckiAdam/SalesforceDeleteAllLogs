# SalesforceDeleteAllLogs
## Description
Simple node.js script which allows You to delete all debug logs on Your Salesforce org.
For now it is able to delete max 10000 records in single invocation

## Installation
1. Clone the repository:
```
git clone https://github.com/osieckiAdam/SalesforceDeleteAllLogs.git`
```
2. Open the repository folder:
```
cd SalesforceDeleteAllLogs
```
3. Install npm packages (node needs to be installed. To check if Node is installed globally, run `node -v` command)
```
npm install
```
4. Configure environment variables. 
Create .env file in root folder of Your project. You need to specify four variables with Your org credentials: SF_USERNAME, SF_PASSWORD, SF_TOKEN, SF_LOGIN_URL. Example file should look like: 
```
SF_USERNAME = 'user@name.com'
SF_PASSWORD = 'Pa33word'
SF_TOKEN = 'afsd1294819sfjd'
SF_LOGIN_URL = 'https://test.salesforce.com'
```
## Usage
Execute following command in root folder of the project:
```
npm run deletelogs
```
