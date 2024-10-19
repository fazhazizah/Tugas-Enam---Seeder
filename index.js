const mongoose = require("mongoose");
const fs = require("fs");

require("dotenv").config();

async function main() {
  /--------------- Not allowed to be edited - start - --------------------- */
  const mongoUri = process.env.MONGODB_URI;
  const collection = process.env.MONGODB_COLLECTION;

  const args = process.argv.slice(2);
  const command = args[0];
  /--------------- Not allowed to be edited - end - --------------------- */

  // Connect to MongoDB
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000, // Tambahkan timeout untuk pemilihan server
  });

  // Define a schema for the collection
  const schema = new mongoose.Schema(
    {
      title: String,
      year: Number,
      genre: [String],
      description: String,
      director: String,
      cast: [String],
    },
    { strict: false }
  );
  const Model = mongoose.model(collection, schema);

  switch (command) {
    case "check-db-connection":
      await checkConnection();
      break;
    case "reset-db":
      await resetDatabase(Model);
      break;
    case "bulk-insert":
      // Baca dan parse data dari file seed.json
      const data = fs.readFileSync("./seed.json", "utf-8");
      const parsedData = JSON.parse(data); // Pastikan data dalam format yang benar

      // Log data yang akan di-insert ke terminal
      console.log("Data yang akan di-insert:", parsedData);

      // Gunakan insertMany untuk memasukkan data ke dalam koleksi
      await Model.insertMany(parsedData);
      console.log("Data bulk-inserted successfully!");
      break;
    case "get-all":
      await getAllDocuments(Model);
      break;
    default:
      throw Error("command not found");
  }

  await mongoose.disconnect();
  return;
}

async function resetDatabase(Model) {
  console.log("Resetting the database...");
  try {
    const result = await Model.deleteMany({});
    console.log(`${result.deletedCount} documents deleted.`); // Tambahkan tanda kutip di sini
  } catch (err) {
    console.error("Error while resetting the database:", err);
  }
  console.log("Database reset completed.");
}

async function getAllDocuments(Model) {
  console.log("Fetching all documents...");
  try {
    const documents = await Model.find({});
    console.log("Documents fetched successfully:");
    console.log(documents);
  } catch (err) {
    console.error("Error while fetching documents:", err);
  }
}

async function checkConnection() {
  console.log("check db connection started...");
  try {
    await mongoose.connection.db.admin().ping();
    console.log("MongoDB connection is successful!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
  console.log("check db connection ended...");
}

main();
