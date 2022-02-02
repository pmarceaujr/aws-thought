//import express and use the Router() to create the routes
const express = require('express');
const router = express.Router();


//
const AWS = require("aws-sdk");
/*
const awsConfig = {
    region: "us-east-2",
    endpoint: "http://localhost:8000",

};
*/
const awsConfig = {
    region: "us-east-2"

};

AWS.config.update(awsConfig);
const dynamodb = new AWS.DynamoDB.DocumentClient();
const table = "Thoughts";


//use the scan method to return all the items of the table. 
//We also added a status code in case there was an internal error 
//with retrieving the data from the table. Notice that the data in 
//the table is actually in the Items property of the response, so data.Items was returned.
router.get('/users', (req, res) => {
    const params = {
        TableName: table
    };
    // Scan return all items in the table
    dynamodb.scan(params, (err, data) => {
        if (err) {
            res.status(500).json(err); // an error occurred
        } else {
            res.json(data.Items)
        }
    });
})


//we'll use query parameters to pass the username from the client to the server. 
//We'll capture the query parameter with the req.params object
router.get('/users/:username', (req, res) => {
    console.log(`Querying for thought(s) from ${req.params.username}.`);




    //Next we'll declare params to define the query call to DynamoDB. 
    //We'll use the username retrieved from req.params to provide a condition for the query, 
    //because we're only interested in one user. The goal is to find all the thoughts from this user. 
    //Begin by declaring params, as shown in the following expression:
    //Similar to the WHERE clause in SQL, the KeyConditionExpression property is used to filter the query with an expression.
    /*
    -  The KeyConditionExpression property specifies the search criteria.As the name suggests, 
        we can use expressions by using comparison operators such as <, =, <=, and BETWEEN to find a range of values.
        We need to retrieve all the thoughts from a specific user, so we used the = operator to specify all items that pertain to a single username. 
        The #un and :user symbols are actually aliases that represent the attribute name and value.    The #un represents the attribute name username. 
        This is defined in the ExpressionAttributeNames property. While attribute name aliases have the # prefix, the actual value of this key is up to us. 
        DynamoDB suggests using aliases as a best practice to avoid a list of reserved words from DynamoDB that can't be used as attribute names in the
        KeyConditionExpression. Because words such as time, date, user, and data can't be used, abbreviations or aliases can be used in their place as 
        long as the symbol # precedes it.
    
    -  For the same reason, the attribute values can also have an alias, which is preceded by the : symbol. The attribute values also have a property 
        that defines the alias relationship. In this case, the ExpressionAttributeValues property is assigned to req.params.username, which was received 
        from the client. To reiterate, we're using the username selected by the user in the client to determine the condition of the search. This way, the 
        user will decide which username to query.
    
    -  Next is the ProjectExpression property. This determines which attributes or columns will be returned. This is similar to the SELECT statement in 
        SQL, which identifies which pieces of information is needed. In the preceding code statement, we specify that the thoughts and createdAt attributes 
        should be returned. We didn't add the username, because this value is part of the condition criteria; therefore, this info is redundant and won't be rendered.
    
    -  Last is the ScanIndexForward property. This property takes a Boolean value. The default setting is true, which specifies the order for the sort key, 
        which will be ascending. The sort key was assigned to the createdAt attribute when we first created the table. Because we want the most recent posts on top, 
        we set the ScanIndexForward property to false so that the order is descending.
    */

    const params = {
        TableName: table,
        KeyConditionExpression: "#un = :user",
        ExpressionAttributeNames: {
            "#un": "username",
            "#ca": "createdAt",
            "#th": "thought",
            "#img": "image"    // add the image attribute alias
        },
        ExpressionAttributeValues: {
            ":user": req.params.username
        },
        ProjectionExpression: "#un, #th, #ca, #img", // add the image to the database response
        ScanIndexForward: false  // false makes the order descending(true is default)
    };
    dynamodb.query(params, (err, data) => {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            res.status(500).json(err); // an error occurred
        } else {
            console.log("Query succeeded.");
            res.json(data.Items)
        }
    });
}); // closes the route for router.get(users/:username)

/*
we set the params object to the form data of the ThoughtForm, 
which we can access with req.body. Also notice that we use the JavaScript native 
Date object to set the value of the createdAt property. This is so that we know 
when this thought from the user was posted. Remember that we used the createdAt 
property as the sort key, which will help us sort the thoughts chronologically 
when we want to render them in the profile page.
*/
// Create new user at /api/users
router.post('/users', (req, res) => {
    console.log(" are we here")
    const params = {
        TableName: table,
        Item: {
            "username": req.body.username,
            "createdAt": Date.now(),
            "thought": req.body.thought,
            "image": req.body.image  // add new image attribute
        }
    };
    // database call
    dynamodb.put(params, (err, data) => {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json(err); // an error occurred
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            res.json({ "Added": JSON.stringify(data, null, 2) });
        }
    });
});  // ends the route for router.post('/users')






module.exports = router;