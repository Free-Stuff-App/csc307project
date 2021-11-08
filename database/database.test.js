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
		categories: ["food","tasty","homemade","sweet","chocolate"],
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

test("Fetching all products", async () => {
	const users = await dbServices.getProducts([]);
	expect(users).toBeDefined();
	expect(users.length).toBeGreaterThan(0);
});
