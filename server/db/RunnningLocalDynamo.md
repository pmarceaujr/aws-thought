# Running local dynamoDB:

Run in a new terminal window:
'C:\Program Files (x86)\Java\jre1.8.0_321\bin\java' -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

This will run a local copy of dynamoDB
</br>
</br>
</br>

# Connecting and running EC2 Instances

- Make sure instance is running
- must be in `~?.ssh` directory
- Ensure key isn't publicly executable:
  - `chmod 400 aws-thought.pem`
- Connect to the EC2 instance using SSH
  - the ec2-xx-xxx-xx-xxxx- changes with each start up, the command is:
  - `ssh -i "aws-thought.pem" ubuntu@ec2-18-220-97-236.us-east-2.compute.amazonaws.com`
  - If successful, the command line prompt will change:
  - `ubuntu@ip-xxx-xx-xx-xxx:~$`
  - now in a virtual machine in a data center located in the Midwest.
- Now you can execute commands and install or do whatever.
  </br>
  </br>
  </br>

# Installing/Setting Up Application Environment:

- Start with the following command to receive root access control:
  - `sudo su -`
- We can see the command prompt changed to root. Without assigned root user status, we'd need to prefix the installation commands with sudo to run these commands with root user permission. Because the EC2 instance has open access to the internet, we need tightened security around file permissions, especially for code installations.
- Update the environment with the following Ubuntu command using the `APT` package:
  - `apt update`
- Install AWS-CLI: Next install AWS-CLI, which is a useful command-line tool that we used previously to connect to the DynamoDB service. Here, we'll use it to store the access keys that the application will use to authenticate access for the S3 and DynamoDB services.
  - `apt install aws-cli `
- While the CLI tool is installing, we can create the `.ssh` folder at `~/`, then `cd` into the new folder by running the following command:
  - mkdir ~/.ssh; cd ~/.ssh;
- Store the Access Key and Private Key: Now we'll use the AWS-CLI tool to store the access key and private key. Run the below command and follow the prompts to enter keys, secrets region, etc.
  - `aws configure`
- SInce we are bulding our site with node.js, install node, npm and git:
  - `curl -sL https://deb.nodesource.com/setup_VERSION.x | bash `
  - `apt install -y nodejs`
  - `$ apt install git-all`
  - Run `node --version` to verify installation was successful.
  - Run `git --version` to verify that installation was successful.
- In the browser, navigate to the GitHub repo for `aws-thought`. We'll clone this repo in the EC2 instance by copying the HTTPS URL from the GitHub repo on the `main` branch.
- Go back to the CLI and navigate to `/opt/` and clone `aws-thought` to the EC2 instance. Root folder access to the application will simplify the application's availability to the application server.
- Install NGINX: We also need the `nginx` (pronounced "engine-x") tool to coordinate the application server that will expose the EC2 instance. To install `nginx`, run the following command in the Ubuntu CLI:
  - `apt install nginx #install nginx`
  - `sudo systemctl start nginx #start nginx`
- To see if the nginx server has started, go to the browser and enter the public IPv4 address of the EC2 instance. This can be found in the EC2 console after the EC2 instance id has been selected. The public IPv4 address will direct us to the webpage and should show a `Welcome to nginx!` start page.
  - If error starting:
    - `apt install net-tools #instal net-tools`
    - `sudo netstat -tulpn #run netstat`
    - see if anything running on port 80, usually Apache
    - `sudo kill -2 <pid> #to kill the app on port 80`
    - `sudo netstat -tulpn #verify port 80 is free`
    - `sudo systemctl start nginx #start nginx`
    - `sudo netstat -tulpn #verify nginx is running on port 80`
- The server configuration file is located at the root folder in the following path:

  - `sudo nano /etc/nginx/sites-available/default`
  - We'll replace the current configuration with the following JSON:

  ```
  server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;

  location /{
          root /opt/aws-thoughts/client/build;
          index index.html;
          try_files $uri /index.html;
      }
  location /api/ {
          proxy_pass http://localhost:3001;
      }
  }
  ```

  - To exit and save the configuration file, press Ctrl+X on Windows and Command+X on macOS. This will prompt to save. Press Y, then select Enter.
  - The preceding configuration file is known as a .conf file type. These are used to store configuration settings for operating systems and server processes. In the preceding .conf, the nginx server is listening on port 80 for an internet request. We then proxy the endpoints in the application at the / and /api/ locations, for the front end and back end respectively.
  - Also notice that we're serving the production build of the application.
  - Next we need to restart the nginx server by running the following command:
    - `sudo systemctl restart nginx`
  - Run the following command to configure the nginx server to automatically launch whenever the EC2 instance is started or booted:
    - `systemctl enable nginx`

- Modify the API Calls: We'll use the text editor nano to modify the fetch requests in the UI components to target the correct path.
  Currently, we know of the following three access points that connect the client to the database service. The three API fetch calls occur in the `Home` component, to fetch all the users' thoughts; in the `ThoughtForm` component, to create a new thought; and in the `Profile` component, to retrieve a single user's thoughts. - Run the following commands to modify the three components:
  - `sudo nano /opt/aws-thoughts/client/src/pages/Home.js`
  - ` const res = await fetch('http://3.22.57.177/api/users');`
  - `sudo nano /opt/aws-thoughts/client/src/pages/Profile.js`
  - `` const res = await fetch(`http://3.144.194.67/api/users/${userParam}`); ``
  - `sudo nano /opt/aws-thoughts/client/src/components/ThoughtForm/index.js`
  - `const res = await fetch('http://3.144.194.67/api/image-upload', {`
- Now that the source code modifications are complete, navigate to the aws-thought folder to install the application's dependencies, by typing the following commands:
  - `cd /opt/aws-thought`
  - `npm install `
- Build and Run a Production Version of the App: Once the client and server dependencies have successfully been installed and set up, we can build a production version of the React application. Navigate to the client directory, then run the following command:
  - `sudo npm run build`
  - It will take a few minutes to create a compressed version of the React application and place it in the build folder of the client.
- Once this step has completed, we'll start the React application. We could use the command `npm start`. However, to keep the application running even after we've logged out of the server, we must use a process manager for production Node.js applications, called `pm2`.
- Install the process manager globally by running the following command:
  - `sudo npm install pm2 -g #from the client directory`
  - `sudo pm2 start node_modules/react-scripts/scripts/start.js --name "aws-thought" `
  - On a successful start, we'll see a monitor log that resembles the following image:

| id  | name         | namespace | version | mode | pid   | uptime | status | cpu |
| --- | ------------ | --------- | ------- | ---- | ----- | ------ | ------ | --- |
| 0   | aws-thoughts | default   | 5.0.0   | fork | 15776 | 0s     | online | 0%  |

- Now if we enter the Public IPv4 address, we can see the UI of the Deep Thoughts application. Although the data isn't populating, we can see that `pm2` and the `nginx` server are delivering the application to the internet. Next we'll start the back end of the application so that the data from the DynamoDB service can render to the browser. Run the following command from the `aws-thought/server` location:
  - `sudo pm2 start server.js #must be in server directory`
  - On a successful start, we'll see a monitor log that resembles the following image:

| id  | name         | namespace | version | mode | pid   | uptime | status | cpu |
| --- | ------------ | --------- | ------- | ---- | ----- | ------ | ------ | --- |
| 0   | aws-thoughts | default   | 5.0.0   | fork | 15776 | 0s     | online | 0%  |
| 0   | server       | default   | 1.0.0   | fork | 15776 | 0s     | online | 0%  |

</br>
</br>

# Final Notes:

- ## Need to rebuild when code changes.
- ## Almost everything needs to be done with sudo unless you use `sudo su -`
