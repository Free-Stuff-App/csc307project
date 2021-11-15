// Database for Free Stuff App
// This file will do database operations

const mongoose = require("mongoose");
const ProductSchema = require("./productSchema");
// const UserSchema = require("./userSchema");
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
	"_id",
	"title",
	"datePosted",
	"categories",
	"description",
	"condition",
	"location",
	"seller",
];

/**
 * @param {*} criteria should be a list of 5 strings, where each element
 *     corresponds to the search criteria in the order above. Criteria
 *     which are not being filtered should be represented by empty strings.
 * Examples:
 * ["", "", "", "", "", "", ""] // returns all products
 * ["", "", "", "", "", "new", "", ""] // returns all condition = "new" products
 * ["", "Toy", "", "", "", "", "", "Dave"] // returns all title = "Toy" products posted by Dave
 * ["abc123", "Toy", "", "", "", "", "", "Dave"] // returns product _id = "abc123", no matter the other criteria
 */
async function getProducts(criteria) {
	const productModel = getConnection().model("Product", ProductSchema);
	let products;
	// if _id not in search criteria, filter by other criteria
	if (criteria[0] === "") {
		products = await productModel.find();
		return filterProducts(products, criteria);
	} else {
		// else return product with that _id
		return productModel.findById(criteria[0]);
	}
}

/**
 * Would like to implement "contains" for criteria
 * @param {*} products
 * @param {*} criteria
 * for each criteria
 * 		for each product
 * 			if similar, don't remove prod
 */
async function filterProducts(products, criteria) {
	// shallow copy products
	let prods = Array.from(products);
	// define variables
	let prodsThatPass = [];
	let pVals = [];
	let pVal = "";
	// for each product excluding _id (i==0)
	for (let i = 1; i < criteria.length; i++) {
		// if this criteria is being searched for
		if (!(criteria[i] === "")) {
			// for each prod in prods, which is updated after each criteria filtering
			prods.forEach((prod) => {
				// have to fetch all product values and then choose the one matching this criteria
				pVals = [
					prod.title,
					prod.datePosted,
					prod.categories,
					prod.description,
					prod.condition,
					prod.seller,
				];
				pVal = pVals[i - 1];
				const similar = dynamicSimilarity(
					String(pVal),
					String(criteria[i])
				);
				// add semi in order to array, much better ordering can be designed later
				console.log(
					String(pVal) +
						" and " +
						String(criteria[i]) +
						" : " +
						similar +
						"\n\n"
				);
				if (similar > 0.75) {
					prodsThatPass.unshift(prod); // add best ones to front
				}
				if (similar > 0.6) {
					prodsThatPass.push(prod); // add not best ones to end
				}
			});
			// update product list, reverse so that worst are added to front first
			prods = Array.from(prodsThatPass.reverse());
			// clear prodsThatPass for next criteria filtering
			prodsThatPass = [];
		}
	}
	return prods;
}

function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();
	console.log("Compare " + s1 + " vs " + s2);
	var costs = new Array();
	for (var i = 0; i <= s1.length; i++) {
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++) {
			if (i == 0) costs[j] = j;
			else {
				if (j > 0) {
					var newValue = costs[j - 1];
					if (s1.charAt(i - 1) != s2.charAt(j - 1))
						newValue =
							Math.min(Math.min(newValue, lastValue), costs[j]) +
							1;
					costs[j - 1] = lastValue;
					lastValue = newValue;
				}
			}
		}
		if (i > 0) costs[s2.length] = lastValue;
	}
	let longerLength = Math.max(s1.length, s2.length);
	let ed = (longerLength - costs[s2.length]) / longerLength;
	console.log(ed);
	return ed;
}

function dynamicSimilarity(s1, s2) {
	let array = [];
	for (let i = 0; i < s1.length + 1; i++) {
		let ar = [];
		for (let j = 0; j < s2.length + 1; j++) {
			ar.push(0);
		}
		array.push(ar);
	}
	for (let i = 0; i < s1.length + 1; i++) {
		for (let j = 0; j < s2.length + 1; j++) {
			if (i == 0) array[i][j] = j;
			else if (j == 0) array[i][i] = i;
			else {
				let o1 = array[i][j - 1] + 1;
				let o2 = array[i - 1][j] + 1;
				let o3 = array[i - 1][j - 1];
				if (!(s1.charAt(i) === s2.charAt(j))) o3 += 1;
				array[i][j] = Math.min(o1, o2, o3);
			}
		}
	}
	let len = Math.max(s1.length, s2.length);
	let ed = array[s1.length][s2.length];
	return 1 - ed / (len + 1);
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
exports.getUsers = getUsers;
exports.addUser = addUser;
exports.deleteUser = deleteUser;

exports.setConnection = setConnection;
