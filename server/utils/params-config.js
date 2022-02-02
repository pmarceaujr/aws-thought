

//https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require('uuid');


//declare the params function that will configure the file, as shown in the following statement:
/*
    the params function receives a parameter called fileName, which this function will receive as an argument from the Express route.
    Once we store the reference to the fileType, we'll declare imageParams.
    We must define three properties of imageParams. The Bucket, Key, and Body properties to connect to S3. 
    We'll assign the Bucket with the name of the S3 bucket we created previously. Next we'll assign the Key property, 
    which is the name of this file. We use the uuidv4() to ensure a unique file name. We'll also add the file extension from fileType. 
    Next is the Body property, which we assign the buffer property of the image. This is the temporary storage container of the image file. 
    Once the buffer has been used, the temporary storage space is removed by multer.
*/
const params = fileName => {
    const myFile = fileName.originalname.split('.');
    const fileType = myFile[myFile.length - 1];

    const imageParams = {
        Bucket: 'bootcamp-user-images-f86aeb7c-130b-4a2a-8ab3-8cb27fc256df',
        Key: `${uuidv4()}.${fileType}`,
        Body: fileName.buffer,
        ACL: 'public-read' // allow read access to this file
    };

    return imageParams;
};


module.exports = params;