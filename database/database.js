const mongoose = require("mongoose");
const productSchema = require("./productSchema");
const userSchema = require("./userSchema");
const dotenv = require("dotenv");
dotenv.config();

let conn;

function setConnection(newConn) {
	return (conn = newConn);
}

function getConnection() {
	if (!conn) {
		if (process.argv.includes("--prod")) {
			console.log("Connecting to Atlas DB...\n");
			conn = mongoose.createConnection(
				"mongodb+srv://" +
					process.env.MONGO_USER +
					":" +
					process.env.MONGO_PWD +
					"@freestuffapp.rezg1.mongodb.net/" +
					process.env.MONGO_DB +
					"?retryWrites=true&w=majority",
				{
					useNewUrlParser: true,
					useUnifiedTopology: true,
				});
		}
		else {
			conn = mongoose.createConnection("mongodb://127.0.0.1:27017/freestuffapp",
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
		}
	}
	return conn;
}

/**
 * Gets and filters products based on the sidebar and search bar inputs
 * @param {*} sidebarCriteria : array with [“_id”, "condition", "category", "date posted"] included with values
 * if being filtered for or empty strings if not being filtered for
 * @param {*} searchCriteria : string representing the search bar input, empty string if nothing searched
 */
async function getProducts(sidebarCriteria, searchCriteria) {
	// change to accept search and sidebar criteria, filter by sidebar and then search bar
	let products = await getProductsSidebar(sidebarCriteria);
	return filterProductsSearch(products, searchCriteria);
}

// criteriaList = [“_id”, "condition", "category", "date posted"]
async function getProductsSidebar(criteriaList) {
	const productModel = getConnection().model("Product", ProductSchema);
	let filter = 0;
	// if _id not in search criteria, filter by other criteria
	if (!(criteriaList[0] === "")) {
		// return product with that _id
		return await productModel.findById(criteriaList[0]);
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

	let products;
	if (filter === 1) products = await productModel.find(q);
	else products = await productModel.find();

	if (!(criteriaList[3] === "")) {
		// filter by date posted
		products = filterByDate(products, criteriaList[3]);
	}
	return products;
}

function filterByDate(products, constraint) {
	let productsFiltered = [];
	products.forEach((prod) => {
		if (
			checkProductDate(Date.now() - prod.datePosted.getTime(), constraint)
		) {
			productsFiltered.push(prod);
		}
	});
	return productsFiltered;
}

function checkProductDate(diff, constraint) {
	switch (constraint) {
		case "Past 24 Hours":
			if (diff < 1000 * 3600 * 24) return true;
			else return false;
			break;
		case "Past Week":
			if (diff < 1000 * 3600 * 24 * 7) return true;
			else return false;
			break;
		case "Past 2 Weeks":
			if (diff < 1000 * 3600 * 24 * 7 * 2) return true;
			else return false;
			break;
		case "Past Month":
			if (diff < 1000 * 3600 * 24 * 30) return true;
			else return false;
			break;
		case "Past Year":
			if (diff < 1000 * 3600 * 24 * 365) return true;
			else return false;
			break;
		default:
			break;
	}
}

function filterProductsSearch(products, searchString) {
	// verify that there search criteria exists
	if (searchString === "") return products;
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
	prodScores.sort((a, b) => (a.score < b.score ? 1 : -1));

	// compile a list of just the projects in their sorted order
	prodsSorted = [];
	prodScores.forEach((p) => {
		prodsSorted.push(p.product);
	});

	return prodsSorted;
}

function getSellerName(id) {
	// findById to get user name from the product's seller _id, not tested yet

	const userModel = getConnection().model("User", UserSchema);
	return userModel.getUsers(id).name;

	// return id;

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

async function addProduct(product, user_id) {
	const productModel = getConnection().model("Product", productSchema);
	try {
		const prodToAdd = new productModel(product);
		prodToAdd.seller = user_id;
		const savedProd = await prodToAdd.save();
		return savedProd;
	} catch (error) {
		console.log(error);
		return false;
	}
}

async function deleteProduct(id) {
	const productModel = getConnection().model("Product", productSchema);
	try {
		return await productModel.findByIdAndDelete(id); //write search algorithm
	} catch (error) {
		console.log(error);
		return false;
	}
}

/**
 * Returns all users if id is an empty string, or the user with that id otherwise
 * @param {*} id : user _id or an empty string
 */
async function getUser(id) {
	const userModel = getConnection().model("User", UserSchema);
	if (!(id === "")) {
		// find user by id
		return await userModel.findById(id); // might need to convert from string to ObjectID type
	} else {
		return await userModel.find();
	}
}

async function addUser(user) {
	const userModel = getConnection("User").model("User", userSchema);
	try {
		const userToAdd = new userModel(user);
		const savedUser = await userToAdd.save();
		return savedUser;
	} catch (error) {
		console.log(error);
		return false;
	}
}

async function findUserByEmail(givenEmail) {
	const userModel = getConnection().model("User", userSchema);
	try {
		return await userModel.find({email:givenEmail}).lean();
	} catch (error) {
		console.log(error);
		return false;
	}
}

async function deleteUser(id) {
	const userModel = getConnection().model("User", userSchema);
	try {
		return await userModel.deleteOne({_id: id});
		//return await findByNameAndIdAndDelete(id); //write search algorithm
	} catch (error) {
		console.log(error);
		return false;
	}
}

exports.getProducts = getProducts;
exports.addProduct = addProduct;
exports.deleteProduct = deleteProduct;
exports.getUser = getUser;
exports.addUser = addUser;
exports.deleteUser = deleteUser;
exports.findUserByEmail = findUserByEmail;
