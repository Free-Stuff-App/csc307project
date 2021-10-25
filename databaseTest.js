/**
 * NPM Module dependencies.
 */
const express = require('express');
const photoRoute = express.Router();

const multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage, limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 } });

const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
let db;

/**
 * NodeJS Module dependencies.
 */
const { Readable } = require('stream');

/**
 * Create Express server && Routes configuration.
 */
// const app = express();
// app.use('/photos', photoRoute);

/**
 * Connect Mongo Driver to MongoDB.
 */
MongoClient.connect('mongodb://localhost/27017/FreeStuff', (err, database) => {
    if (err) {
        console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
        process.exit(1);
    }
    db = database;
});

/**
 * GET photo by ID Route
 */
//photoRoute.get('/:photoID', (req, res) => {
function getPhoto(photoID) {
    let bucket = new mongodb.GridFSBucket(db, {
        bucketName: 'photos'
    });

    let downloadStream = bucket.openDownloadStream(photoID);

    downloadStream.on('data', (chunk) => {
        res.write(chunk);
    });

    downloadStream.on('error', () => {
        res.sendStatus(404);
    });

    downloadStream.on('end', () => {
        res.end();
    });
});

/**
 * POST photo Route
 */
// photoRoute.post('/', (req, res) => {
function postPicture(name) {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: "Upload Request Validation Failed" });
        } else if (!name) {
            return res.status(400).json({ message: "No photo name in request body" });
        }

        let photoName = name;

        // Covert buffer to Readable Stream
        const readablePhotoStream = new Readable();
        readablePhotoStream.push(req.file.buffer);
        readablePhotoStream.push(null);

        let bucket = new mongodb.GridFSBucket(db, {
            bucketName: 'photos'
        });

        let uploadStream = bucket.openUploadStream(photoName);
        let id = uploadStream.id;
        readablePhotoStream.pipe(uploadStream);

        uploadStream.on('error', () => {
            return res.status(500).json({ message: "Error uploading file" });
        });

        uploadStream.on('finish', () => {
            return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
        });
    });
});

app.listen(3005, () => {
    console.log("App listening on port 3005!");
});