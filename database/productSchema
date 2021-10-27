const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (value.length < 1) throw new Error("Invalid title.");
		},
	},
	datePosted: {
		type: Date,
		default: Date.now,
	},
	productID: Schema.Types.ObjectID,
	categories: [String],
	description: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (value.length < 1) throw new Error("Invalid description.");
		},
	},
	condition: String,
	location: {
		type: String,
		required: true,
	},
	seller: String, //userID
	image: {
		data: Buffer,
		contentType: String,
	},
	//https://stackoverflow.com/questions/29780733/store-an-image-in-mongodb-using-node-js-express-and-mongoose
});

module.exports = Product;
