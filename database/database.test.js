const mongoose = require("mongoose");
const ProductSchema = require("./productSchema");
const dbServices = require("./database");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let conn;
let productModel;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();

	const mongooseOpts = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	};

	conn = await mongoose.createConnection(uri, mongooseOpts);

	productModel = conn.model("Product", ProductSchema);

	dbServices.setConnection(conn);
});

afterAll(async () => {
	await conn.dropDatabase();
	await conn.close();
	await mongoServer.stop();
});

beforeEach(async () => {
	let dummyProduct = {
		title: "hair",
		datePosted: "11/5/21",
		//productID: "",
		categories: ["human", "head", "wearable"],
		description: "I shaved my head want some hair?",
		condition: "used",
		location: "Bakersfield",
		seller: "Barry McKockiner",
		image: "",
	};
	let result = new productModel(dummyProduct);
    await result.save();
    
    dummyProduct = {
		title: "pianting",
		datePosted: "11/10/21",
		//productID: "",
		categories: ["art", "piant", "good", "collor"],
		description: "dont spel god but i piant good",
		condition: "collorful",
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
		categories: ["artsy", "opaint", "great", "colorful"],
		description: "should show up for a paintint title search",
		condition: "beautiful",
		location: "Cupertino, CA",
		seller: "itay rabinovic",
		image: "",
	};
	result = new productModel(dummyProduct);
	await result.save();

	dummyProduct = {
		title: "Painting",
		datePosted: "11/7/21",
		//productID: "",
		categories: ["art", "paint", "old"],
		description: "Old painting that I found, might be good",
		condition: "Pretty good for being old",
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
		categories: ["art", "paint", "new", "head"],
		description: "drew a picture of my head, kinda cool",
		condition: "new",
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
		categories: ["phone", "old", "nokia"],
		description: "Don't need this anymore, who wants it?",
		condition: "used",
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
		categories: ["food", "tasty", "homemade", "sweet", "chocolate"],
		description: "Just some regular brownies that I made",
		condition: "fresh and warm",
		location: "Mt Shasta, CA",
		seller: "dylan steize",
		image: "",
	};
	result = new productModel(dummyProduct);
	await result.save();
});

afterEach(async () => {
	await productModel.deleteMany();
});

// test("Fetching all users", async () => {
// 	const users = await dbServices.getUsers();
// 	expect(users).toBeDefined();
// 	expect(users.length).toBeGreaterThan(0);
// });

// ["title","datePosted", "productID", "categories", "description", "condition", "seller"]
test("Fetching all products", async () => {
	const prods = await dbServices.getProducts(["", "", "", "", "", "", ""]);
	expect(prods).toBeDefined();
	expect(prods.length).toBeGreaterThan(0);
});

test("Fetching products by name", async () => {
	const prodName = "Painting";
	const prods = await dbServices.getProducts([
		"",
		"Painting",
		"",
		"",
		"",
		"",
		"",
	]);
	expect(prods).toBeDefined();
    expect(prods.length).toBeGreaterThan(0);
    let titles = [];
    let expectedTitles = ["Painting", "pianting", "opainting"];
    prods.forEach((prod) => titles.push(prod.title));
    console.log(titles);
    expectedTitles.forEach((et) => expect(titles.includes(et)).toBe(true));
});
