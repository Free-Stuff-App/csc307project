const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true
		},
		description: {
			type: String,
			required: true,
			trim: true
		},
		category: {
			type: String,
			required: true
		},
		image: {
			type: String,
			required: true
		},
		contactInfo: {
			type: String,
			required: true,
		},
		location: {
			type: String,
			required: true
		},
		datePosted: {
			type: Date,
			required: true,
			default: Date.now
		}
	},
	{ collection: "Products" }
);

module.exports = productSchema;
