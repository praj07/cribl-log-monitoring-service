# cribl-log-monitoring-service
On demand log monitoring service for unix based servers. This application allows a user to deploy a service to their remote server which will expose an endpoint within that server to allow users to retrieve the most recent logs that have been produced. All this can be done remotely without ever having to access the server directly.

The monitoring service was built on Nodejs using express as the backend framework and the in built fs module to synchronously stream in the data from the log files. The main technical challenge with this application lies in the inherent implementation of the fs.readFile() function as in most cases reading a file from the top down would work, however in this scenerio it is more useful for users if the logs retrieved are presented in reverse chronological order, that is with the newest logs being presented first. To achieve this effectively, first the size of the file is determined and then a 64kb chunk is read in from the end of the file. From there the chunk is converted back to text and the lines are split up and read from end to finish (reverse order). From there if a keyword is used to filter the lines further so we only return the latest N lines with the associated keyword.

## Set Up
### Remote Testing
Request: `GET /logs/file/:fileName?lines=[number]&keyword=[string]`
Example Request: `http://ec2-35-183-118-137.ca-central-1.compute.amazonaws.com:8080/logs/file/logfile?lines=26&keyword=error`

The application is currently live and running on `ec2-35-183-118-137.ca-central-1.compute.amazonaws.com`. Simply going to the endpoint in browser will allow you to see the response. The params for this Endpoint are `fileName`, which will let the application know which file to look at and thus cannot be undefined. The query parameters for this endpoint are `lines` and `keyword`, both of which are optional. Lines determines the how many log entries to return from the file and keyword will filter the results to only contain entries that contain the keyword.
Currently accessible files on `ec2-35-183-118-137.ca-central-1.compute.amazonaws.com` are `logfileshort` and `logfile`.
logfileshort is 1Mb in size and logfile is 1Gb in size.
`logfileshort` has spoof entries with keywords `debug`, `error`, and `info` 

### Local development
Development can be completed locally by running `npm install` in the base directory of the application and subsequently running either `npm start` or `npm run start-dev` to run the application in development mode. Using npm run start-dev uses `nodemon` to hot reload the application as changes are made so that that the developer can quickly make test different implementations.
To add more logfiles to test against, create a local folder at the level called `var/log` and put any log files that you would want to access in there and test from there.

### Running in docker
Since this application was developed to be running in remote servers, it makes sense to containerize it. To run the docker instance, run `docker compose up -d` in your command line or terminal, and the application should deploy itself. Additionally, docker has been configured in such a way that `/var/log` will be mounted to the docker container, meaning even after the docker container is deployed it can read new logs coming to the server. This also makes testing easier as even after the container is live it will continue to function on new data.

##Limitations and Improvements
  [ ] 1. File extensions
     By default, a lot of unix based log files have no extensions and are just raw text files that can be read and written to, so a result this implementation just searches the raw files within the `var/log` without any extensions since adding a `.` to the fileName parameter would cause issues. A solution to fix this would be to add in an extension parameter to the query so that it can be appended to the filepath variable when we look for the file to read in.
  [ ] 2. Security
    Right now anybody with the url to the server can access it and look at the logs that are present. For the purpose of demonstration and testing this is allowed since the IPs to whitelist server access for is unknown (as well as the ec2 server being a dummy just for this demonstration). In the future a secret/private key communication or authentification flow might need to be implemented using something like JWTs to ensure that the user accessing the logs are have the appropriate permissions to see them. Another avenue of security would also be the only allow inbound/outbound traffic on the API's port to those IPs that have access (or using a VPN of some sort). A final solution could also be to use a web application to add an interface layer between the user and API and make it so that only that client can access the logs (provided again that the user has the appropriate credentials)


