// Database for Free Stuff App
// This file will do database operations

const mongoose = require("mongoose");
const productModel = require("./product");
// const sellerModel = require("./user");

mongoose
	.connect("mongodb://localhost:27017/FreeStuff", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.catch((error) => console.log(error));

async function getProducts() {
	let result = await productModel.find();
	return result;
}

async function getUsers() {}

async function addProduct(product) {
	try {
		const prodToAdd = new productModel(product);
		const savedProd = await prodToAdd.save();
		return savedProd;
	} catch (error) {
		console.log(error);
		return false;
	}
}

async function addUser(user) {}

async function deleteProduct(id) {
    try {
		return await productModel.findByIdAndDelete(id);
	} catch (error) {
		console.log(error);
		return undefined;
	}
}

async function deleteUser(id) {}
