require('dotenv').config()
const { MongoClient } = require("mongodb");
var randomstring = require("randomstring");
const url = process.env.MONGODB_URI;

const client = new MongoClient(url);
async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db('BlicketEvents');
        const col = db.collection('keys');

        // const p = await col.insertOne(keyDocument);
        const myDoc = await col.findOneAndUpdate({id: 0}, { $set: 
            {
                'createdTime': new Date().getTime(),
                'expiryTime': new Date().getTime() + 30000,
                "masterKey": randomstring.generate(),
            }
        });
         // Print to the console
         console.log("Update masterKey");
    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}

setInterval(run, 10*1000);