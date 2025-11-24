// mongodb.js

const { MongoClient, ObjectId } = require('mongodb');

/**
 * A client for interacting with a MongoDB database with a persistent connection.
 */
class MongoDBClient {
  // Static variables to hold the single client and database instances
  static client = null;
  static db = null;
  
  // Define connection details statically, or load from environment variables here
  static uri = "mongodb+srv://admin:admin@ClusterKite.9a8vt.mongodb.net/spring?retryWrites=true&w=majority&appName=ClusterKite";
  //static uri = "mongodb://localhost:27017"; 
  static dbName = "flyspring"; 

  // Constructor is just for potential instantiation, but the static methods handle connection
  constructor() {
    // Optional: could be used to instantiate the client via a non-static method
  }

  /**
   * Establishes the initial connection to the MongoDB server on application start.
   */
  static async connect() {
    if (MongoDBClient.db && MongoDBClient.client.topology && MongoDBClient.client.topology.isConnected()) {
        console.log("MongoDB is already connected.");
        return MongoDBClient.db;
    }

    try {
      console.log("Attempting to connect to MongoDB...");
      MongoDBClient.client = new MongoClient(MongoDBClient.uri);
      await MongoDBClient.client.connect();
      MongoDBClient.db = MongoDBClient.client.db(MongoDBClient.dbName);
      console.log("Connected successfully to MongoDB server.");
      return MongoDBClient.db;

    } catch (error) {
      console.error("Failed to connect to MongoDB", error);
      // Exit the process or handle the error appropriately if startup fails
      process.exit(1); 
    }
  }

  /**
   * Closes the MongoDB connection when the application shuts down.
   */
  static async close() {
    if (MongoDBClient.client) {
      await MongoDBClient.client.close();
      console.log("MongoDB connection closed.");
      MongoDBClient.db = null;
      MongoDBClient.client = null;
    }
  }

  /**
   * Helper function to get the current database instance, ensuring connection validity.
   */
  static getDb() {
    // If the connection is lost during runtime, reconnect
    if (!MongoDBClient.db || !MongoDBClient.client.topology.isConnected()) {
        console.warn("Connection lost. Reconnecting to MongoDB...");
        // This makes sure operations wait for a connection if one drops mid-operation
        return MongoDBClient.connect().then(() => MongoDBClient.db);
    }
    return MongoDBClient.db;
  }

  /**
   * Retrieves documents from a specific collection.
   */
  async getData(collectionName, query = {}) {
    const db = await MongoDBClient.getDb();
    const collection = db.collection(collectionName);
    return collection.find(query).toArray();
  }

  /**
   * Inserts a single document into a specific collection.
   */
  async insertData(collectionName, document) {
    const db = await MongoDBClient.getDb();
    const collection = db.collection(collectionName);
    return collection.insertOne(document);
  }

  /**
   * Updates a single document in a specific collection.
   */
  async updateData(collectionName, filter, updateDoc) {
    try{
    const db = await MongoDBClient.getDb();
    const collection = db.collection(collectionName);
    //console.log('Updating document in', collectionName, 'with filter:', filter, 'and update:', updateDoc);
    return collection.updateOne(filter, updateDoc);
    } catch(err){console.log(err);}
    return null;
  }

  /**
   * Deletes a single document from a specific collection.
   */
  async deleteData(collectionName, filter) {
    const db = await MongoDBClient.getDb();
    const collection = db.collection(collectionName);
    return collection.deleteOne(filter);
  }
  
  static get ObjectId() {
    return ObjectId;
  }
}

// Keep the CommonJS module export syntax as requested previously
module.exports = MongoDBClient;
