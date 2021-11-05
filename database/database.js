// Database for Free Stuff App
// This file will do database operations

const mongoose = require("mongoose");
const ProductSchema = require("./productSchema");
const UserSchema = require("./userSchema");
const process = require("process");
const dotenv = require("dotenv");
dotenv.config();

let conn;

function setConnection(newConn) {
	return (conn = newConn);
}

function getConnection() {
	if (!conn) {
		if (process.argv.includes("--prod")) {
			conn = mongoose.createConnection(
				//"mongodb+srv://"+"rdmaier"+":"+"<password>"+"@freestuffapp.dycx2.mongodb.net/"+"myFirstDatabase"+"?retryWrites=true&w=majority"
				"mongodb+srv://" +
					process.env.MONGO_USER +
					":" +
					process.env.MONGO_PWD +
					"@freestuffapp.dycx2.mongodb.net/" +
					process.env.MONGO_DB +
					"?retryWrites=true&w=majority",
				//'mongodb://localhost:27017/users',
				{
					useNewUrlParser: true,
					useUnifiedTopology: true,
				}
			);
		} else {
			conn = mongoose.createConnection(
				"mongodb://localhost:27017/users",
				{
					useNewUrlParser: true,
					useUnifiedTopology: true,
				}
			);
		}
	}
	return conn;
}

let prodCriteria = [
	"title",
	"datePosted",
	"productID",
	"categories",
	"description",
	"condition",
	"seller",
];

/**
 * @param {*} criteria should be a list of 5 strings, where each element
 *     corresponds to the search criteria in the order above. Criteria
 *     which are not being filtered should be represented by empty strings.
 * Examples:
 * ["", "", "", "", ""] // returns all products
 * ["", "", "", "new", ""] // returns all condition = "new" products
 * ["Toy", "", "", "", "Dave"] // returns all title = "Toy" products posted by Dave
 */
async function getProducts(criteria) {
	const productModel = getConnection().model("Product", ProductSchema);
	let products = await productModel.find();
	let result = filterProducts(products, criteria);
	return result;
}

/**
 * Would like to implement "contains" for criteria
 * @param {*} products
 * @param {*} criteria
 */
async function filterProducts(products, criteria) {
	let filtered = [];
	products.forEach((prod) => {
		console.log(prod);
		for (let i = 0; i < criteria.length; i++) {
			let crit = criteria[i];
			if (!(crit === "")) {
				//prodValue = prod.find({ prodCriteria[i]: });
			}
		}
	});
	return products;
}

async function getUsers() {
	const userModel = getConnection().model("User", UserSchema);
	let users = await userModel.find();
	return users;
}

/**
 * db.products.insertOne({title: "Bench", datePosted: "11/01/2021", productID: "abc124", categories: ["sit","sturdy","furniture","wood"], description: "It's a good bench", condition: "used", seller: "peteroustem"})
 * @param {*} product
 */
async function addProduct(product) {
	const productModel = getConnection().model("Product", ProductSchema);
	try {
		const prodToAdd = new productModel(product);
		const savedProd = await prodToAdd.save();
		return savedProd;
	} catch (error) {
		console.log(error);
		return false;
	}
}

async function addUser(user) {
	const userModel = getConnection().model("User", UserSchema);
	try {
		const userToAdd = new userModel(user);
		const savedUser = await userToAdd.save();
		return savedUser;
	} catch (error) {
		console.log(error);
		return false;
	}
}

async function deleteProduct(id) {
	const productModel = getConnection().model("Product", ProductSchema);
	try {
		return await productModel.findByIdAndDelete(id);
	} catch (error) {
		console.log(error);
		return undefined;
	}
}

async function deleteUser(id) {
	const userModel = getConnection().model("User", UserSchema);
	try {
		return await userModel.findByIdAndDelete(id);
	} catch (error) {
		console.log(error);
		return undefined;
	}
}

exports.getProducts = getProducts;
exports.addProduct = addProduct;
exports.deleteProduct = deleteProduct;
exports.getUser = getUser;
exports.addUser = addUser;
exports.deleteUser = deleteUser;
