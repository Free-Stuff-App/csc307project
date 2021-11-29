const mongoose = require("mongoose");
const ProductSchema = require("./productSchema");
const UserSchema = require("./userSchema");
const dbServices = require("./database");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let conn;
let productModel;
let userModel;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();

	const mongooseOpts = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	};

	conn = await mongoose.createConnection(uri, mongooseOpts);

	productModel = conn.model("Product", ProductSchema);
	userModel = conn.model("User", UserSchema);

	dbServices.setConnection(conn);
});

afterAll(async () => {
	await conn.dropDatabase();
	await conn.close();
	await mongoServer.stop();
});

beforeEach(async () => {
	let dummyUser = {
		name: "Barry McKockiner",
		email: "bmck@aol.com",
		password: "b00b5021e022",
	};
	let result = new userModel(dummyUser);
	await result.save();

	dummyUser = {
		name: "Bryce McLovin",
		email: "runk@hotmail.com",
		password: "8=-db_arsg",
	};
	result = new userModel(dummyUser);
	await result.save();

	dummyUser = {
		name: "Dustin Glockman",
		email: "dusting@gmail.com",
		password: "8sdf8f880_a0",
	};
	result = new userModel(dummyUser);
	await result.save();

	dummyUser = {
		name: "Clementine McLovin",
		email: "cloveinmc@hotmail.com",
		password: "8sdf8f880a0",
	};
	result = new userModel(dummyUser);
	await result.save();

	//

	let dummyProduct = {
		title: "hair",
		datePosted: "11/5/21",
		category: "Gardening",
		description: "I shaved my head want some hair?",
		condition: "Used",
		location: "Bakersfield",
		seller: "Barry McKockiner",
		image: "",
	};
	result = new productModel(dummyProduct);
	await result.save();

	dummyProduct = {
		title: "pianting",
		datePosted: "11/10/21",
		category: "Household",
		description: "dont spel god but i piant good",
		condition: "Used",
		location: "Oceanside, CA",
		seller: "pablo del bosque",
		image: "",
	};
	result = new productModel(dummyProduct);
	await result.save();

	dummyProduct = {
		title: "opainting",
		datePosted: "11/10/21",
		//productID: "",
		category: "Household",
		description: "should show up for a paintint title search",
		condition: "New",
		location: "Cupertino, CA",
		seller: "itay rabinovic",
		image: "",
	};
	result = new productModel(dummyProduct);
	await result.save();

	dummyProduct = {
		title: "Painting",
		datePosted: "11/7/21",
		category: "Household",
		description: "Old painting that I found, might be good",
		condition: "Good",
		location: "Marin, CA",
		seller: "Darnel Simons",
		image: "",
	};
	result = new productModel(dummyProduct);
	await result.save();

	dummyProduct = {
		title: "Painting",
		datePosted: "11/8/21",
		//productID: "",
		category: "Household",
		description: "drew a picture of my head, kinda cool",
		condition: "New",
		location: "Ventura, CA",
		seller: "Maxie Simons",
		image: "",
	};
	result = new productModel(dummyProduct);
	await result.save();

	dummyProduct = {
		title: "Flip phone",
		datePosted: "11/12/21",
		//productID: "",
		category: "Electronics",
		description: "Don't need this anymore, who wants it?",
		condition: "Good",
		location: "Soledad, CA",
		seller: "leslie banks",
		image: "",
	};
	result = new productModel(dummyProduct);
	await result.save();

	dummyProduct = {
		title: "Brownies",
		datePosted: "4/31/19",
		productID: "tyu666",
		category: "Household",
		description: "Just some regular brownies that I made",
		condition: "Like New",
		location: "Mt Shasta, CA",
		seller: "dylan Simons",
		image: "",
	};
	result = new productModel(dummyProduct);
	await result.save();
});

afterEach(async () => {
	await productModel.deleteMany();
	await userModel.deleteMany();
});

// test("Fetching all users", async () => {
// 	const users = await dbServices.getUsers();
// 	expect(users).toBeDefined();
// 	expect(users.length).toBeGreaterThan(0);
// });

// ["title","datePosted", "productID", "categories", "description", "condition", "seller"]
test("Fetching all products", async () => {
	const prods = await dbServices.getProducts(["", "", "", ""]);
	expect(prods).toBeDefined();
	expect(prods.length).toBeGreaterThan(0);
});

test("Fetching products by name", async () => {
	const prodName = "Painting";
	let expectedTitles = ["Painting", "Painting", "pianting", "opainting"];
	const prods = await dbServices.getProducts(prodName);
	expect(prods).toBeDefined();
	expect(prods.length).toBeGreaterThan(0);

	let titles = [];
	prods.forEach((prod) => titles.push(prod.title));
	titles = titles.slice(0, expectedTitles.length);
	// console.log(titles);
	expect(titles.length).toBe(expectedTitles.length);
	titles.forEach((t) => expect(expectedTitles.includes(t)).toBe(true));
});

test("Fetching products by description", async () => {
	const prodDescription = "my head";
	let expectedTitles = ["Painting", "hair"];
	const prods = await dbServices.getProducts(prodDescription);
	expect(prods).toBeDefined();
	expect(prods.length).toBeGreaterThan(0);

	let titles = [];
	prods.forEach((prod) => titles.push(prod.title));
	titles = titles.slice(0, expectedTitles.length);
	// console.log(titles);
	expect(titles.length).toBe(expectedTitles.length);
	titles.forEach((t) => expect(expectedTitles.includes(t)).toBe(true));
});

test("Fetching products by seller", async () => {
	const prodSearch = "Simons";
	let expectedTitles = ["Painting", "Brownies", "Painting"];
	const prods = await dbServices.getProducts(prodSearch);
	expect(prods).toBeDefined();
	expect(prods.length).toBeGreaterThan(0);

	let titles = [];
	prods.forEach((prod) => titles.push(prod.title));
	titles = titles.slice(0, expectedTitles.length);
	// console.log(titles);
	expect(titles.length).toBe(expectedTitles.length);
	titles.forEach((t) => expect(expectedTitles.includes(t)).toBe(true));
});

// criteriaList = [“_id”, "condition", "category", "date posted"]
test("Fetching products by condition", async () => {
	const condition = "Used";
	let expectedTitles = ["hair", "pianting"];
	const prods = await dbServices.getProducts(["", condition, "", ""]);
	expect(prods).toBeDefined();
	expect(prods.length).toBeGreaterThan(0);

	let titles = [];
	prods.forEach((prod) => titles.push(prod.title));
	console.log(titles);
	expect(titles.length).toBe(expectedTitles.length);
	titles.forEach((t) => expect(expectedTitles.includes(t)).toBe(true));
});

test("Fetching products by category", async () => {
	const category = "Household";
	let expectedTitles = ["pianting", "opainting", "Painting", "Painting", "Brownies"];
	const prods = await dbServices.getProducts(["", "", category, ""]);
	expect(prods).toBeDefined();
	expect(prods.length).toBeGreaterThan(0);

	let titles = [];
	prods.forEach((prod) => titles.push(prod.title));
	console.log(titles);
	expect(titles.length).toBe(expectedTitles.length);
	titles.forEach((t) => expect(expectedTitles.includes(t)).toBe(true));
});

test("Fetching products by condition and category", async () => {
	const condition = "New";
	const category = "Household";
	let expectedTitles = ["opainting", "Painting"];
	const prods = await dbServices.getProducts(["", condition, category, ""]);
	expect(prods).toBeDefined();
	expect(prods.length).toBeGreaterThan(0);

	let titles = [];
	prods.forEach((prod) => titles.push(prod.title));
	console.log(titles);
	expect(titles.length).toBe(expectedTitles.length);
	titles.forEach((t) => expect(expectedTitles.includes(t)).toBe(true));
});

test("split test", async () => {
	let str = "dylan Simons";
	let split = str.split(" ");
	// console.log(split);
	expect(1).toBe(1);
});

test("sort test", async () => {
	let list = [];
	list.push({ word: "one", rank: 1 });
	list.push({ word: "five", rank: 5 });
	list.push({ word: "four", rank: 4 });
	list.push({ word: "two", rank: 2 });
	let x = list.sort((a, b) => (a.rank < b.rank ? 1 : -1));
	// console.log(x);
	expect(1).toBe(1);
});
