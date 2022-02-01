
// use the aws-sdk to create the interface with DynamoDB
const AWS = require("aws-sdk");

// using the file system package to read the users.json
const fs = require('fs');


//use the DocumentClient() class this time to create the dynamodb service object. 
//This class offers a level of abstraction that enables us to use JavaScript objects 
//as arguments and return native JavaScript types. This constructor helps map objects, 
//which reduces impedance mismatching and speeds up the development process. 
//We'll be using this class for most of the database calls in this project.
/*
AWS.config.update({
    region: "us-east-2",
    endpoint: "http://localhost:8000"
});
*/
AWS.config.update({
    region: "us-east-2"
});
const dynamodb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });


//use the fs package to read the users.json file and assign the object to the allUsers constant
console.log("Importing thoughts into DynamoDB. Please wait.");
const allUsers = JSON.parse(fs.readFileSync('./server/seed/users.json', 'utf8'));


// loop over the allUsers array and create the params object with the elements in the array
//In the loop, we will assign the values from the array elements in the Item property
allUsers.forEach(user => {
    const params = {
        TableName: "Thoughts",
        Item: {
            "username": user.username,
            "createdAt": user.createdAt,
            "thought": user.thought
        }
    }
    dynamodb.put(params, (err, data) => {
        if (err) {
            console.error("Unable to add thought", user.username, ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", user.username);
        }
    })
})

