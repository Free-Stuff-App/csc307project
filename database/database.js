// Database for Free Stuff App
// This file will do database operations

const mongoose = require("mongoose");
const ProductSchema = require("./productSchema");
const UserSchema = require("./userSchema");
const process = require("process");
const dotenv = require("dotenv");
dotenv.config({ path: "" }); // insert path to .env here

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

async function getProducts(criteria) {
	// change to accept search and sidebar criteria, filter by sidebar and then searchs

	if (Array.isArray(criteria)) {
		// it's a sidebar filter
		return getProductsSidebar(criteria);
	} else {
		// it's a search bar filter
		return getProductsSearch(criteria);
	}
}

// criteriaList = [“_id”, "condition", "category", "date posted"]
async function getProductsSidebar(criteriaList) {
	const productModel = getConnection().model("Product", ProductSchema);
	let products;
	let filter = 0;
	// if _id not in search criteria, filter by other criteria
	if (!(criteriaList[0] === "")) {
		// return product with that _id
		return productModel.findById(criteriaList[0]);
	}
	let find = "";
	let q = {};
	if (!(criteriaList[1] === "")) {
		// add condition to query
		find = find + " condition: " + criteriaList[1] + ",";
		q = Object.assign(q, { condition: criteriaList[1] });
		filter = 1;
	}
	if (!(criteriaList[2] === "")) {
		// add category to query
		find = find + " category: " + criteriaList[2];
		q = Object.assign(q, { category: criteriaList[2] });
		filter = 1;
	}

	if (filter === 1) products = await productModel.find(q);
	else products = await productModel.find();

	if (!(criteriaList[3] === "")) {
		// filter by date posted
		products = filterByDate(products, criteriaList[3]);
	}
	return products;
}

function filterByDate(products, date) {
	// to be implemented next
}

async function getProductsSearch(searchString) {
	const productModel = getConnection().model("Product", ProductSchema);
	products = await productModel.find();
	return filterProductsSearch(products, searchString);
}

function filterProductsSearch(products, searchString) {
	// break search into individual words
	let searchWords = searchString.split(" ");
	// list of {product, score} tuples
	prodScores = [];
	products.forEach((prod) => {
		// complie product keywords from title, description, seller, location, etc.
		let sellerName = getSellerName(prod.seller); // get seller name from product's user _id
		let prodStrs = [prod.title, sellerName, prod.description];
		// list to accumulate points for each product search attribute
		let rs = [0, 0, 0];
		// compare each keyword to search and update product's score
		for (let i = 0; i < prodStrs.length; i++) {
			// compare to each prod str
			let prodWords = prodStrs[i].split(" ");
			prodWords.forEach((pword) => {
				searchWords.forEach((sword) => {
					// calculate Levenshtein distance
					let lev = dynamicSimilarity(
						pword.toLowerCase(),
						sword.toLowerCase()
					);
					rs[i] += lev;
					// if (lev > threshold) rs[i] += 1;
				});
			});
		}
		// weight rs accordingly
		let points = 10 * rs[0] + 6 * rs[1] + 9 * rs[2];
		// add tripple to list
		prodScores.push({ product: prod, score: points });
	});

	// sort products by their respective search scores
	let x = prodScores.sort((a, b) => (a.score < b.score ? 1 : -1));

	// compile a list of just the projects in their sorted order
	prodsSorted = [];
	prodScores.forEach((p) => {
		prodsSorted.push(p.product);
	});

	return prodsSorted;
}

function getSellerName(id) {
	// findById to get user name from the product's seller _id
	// const userModel = getConnection().model("User", UserSchema);
	// return userModel.getUsers(id);
	return id;

	// // // // // // // // // // // // // // // // // // // // // // // //
}

/**
 * Use Levenshtein distance to calculate the similarity between 2 strings
 * @param {C} s1 : first String
 * @param {*} s2 : second String
 */
function dynamicSimilarity(s1, s2) {
	// if they are the same, return an extra high similarity
	if (s1 === s2) {
		return 2;
	}
	let array = [];
	// build 2d array with the right shape and size
	for (let i = 0; i < s1.length + 1; i++) {
		let ar = [];
		for (let j = 0; j < s2.length + 1; j++) {
			ar.push(0);
		}
		array.push(ar);
	}
	// fill in table with Levenshtein distances
	for (let i = 0; i < s1.length + 1; i++) {
		for (let j = 0; j < s2.length + 1; j++) {
			if (i == 0) array[i][j] = j;
			else if (j == 0) array[i][j] = i;
			else {
				let o1 = array[i][j - 1] + 1;
				let o2 = array[i - 1][j] + 1;
				let o3 = array[i - 1][j - 1];
				if (!(s1.charAt(i - 1) === s2.charAt(j - 1))) o3 += 1;
				array[i][j] = Math.min(o1, o2, o3);
			}
		}
	}
	// calculate % similarity
	let len = Math.max(s1.length, s2.length);
	let ed = array[s1.length][s2.length];
	return (len - ed) / len;
}

async function getUsers(id) {
	const userModel = getConnection().model("User", UserSchema);
	if (!(id === "")) {
		// find user by id
		return await userModel.findById(id); // might need to convert from string to ObjectID type
	} else {
		return await userModel.find();
	}
}

/**
 * db.products.insertOne({title: "Bench", datePosted: "11/01/2021", productID: "abc124", categories: ["sit","sturdy","furniture","wood"], description: "It's a good bench", condition: "used", seller: "peteroustem"})
 * Verify setting product seller as user._id implementation
 * @param {*} product
 */
async function addProduct(product, user) {
	const productModel = getConnection().model("Product", ProductSchema);
	try {
		const prodToAdd = new productModel(product);
		prodToAdd.seller = user._id;
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
