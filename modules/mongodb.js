import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = `mongodb+srv://bellokhalid74:${process.env.MONGO_PASS}@cluster0.lwmfrxd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
function createClient () {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  return client;
}; // end of createClient

export default createClient;