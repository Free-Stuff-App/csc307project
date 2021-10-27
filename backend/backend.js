// backend for Free Stuff App


const products = { 
    productsList :
    [
       { 
          id : 'xyz789',
          title : 'Skateboard',
          description: 'cool skateboard',
          location: 'San Luis Obispo, CA',
          category: 'fun',
          contactInfo: 'boone@mail.com'
       },
       {
          id : 'abc123', 
          title: 'BBgun',
          description: 'shoots bbs',
          location: 'Los Angeles, CA',
          category: 'fun',
          contactInfo: 'ryan@mail.com'
          
       },
       {
          id : 'ppp222', 
          title: 'Fork',
          description: 'a metal fork',
          location: 'San Luis Obispo, CA',
          category: 'cooking',
          contactInfo: 'bruno@mail.com'
       }
    ]
 }
 
 
const express = require('express');
const app = express();
const port = 5000;

const cors = require('cors');
app.use(cors());

app.use(express.json());

const userServices = require('./database');

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.post('/products', (req, res) => {
    const productToAdd = req.body;
    productToAdd.id = generateProductID();
    console.log(req.body)
    addProduct(productToAdd);
    res.status(201).send(productToAdd);
});

app.delete('/products/:id', (req, res) => {
    const id = req.params['id'];
    let result = findProductById(id);
    if (result === undefined || result.length == 0)
        res.status(404).send('Resource not found.');
    else {
        deleteProduct(id);
        res.status(204).end();
    }
});

app.get('/products', (req, res) => {
    res.send(products);
});

function addProduct(product){
    products['productsList'].push(product);
}

function deleteProduct(id) {
    for (let [i, item] of products['productsList'].entries()) {
        if (item.id == id)
            products['productsList'].splice(i, 1);
    }
}

function findProductById(id) {
    return products['productsList'].find((products) => products['id'] === id); 
}

function generateProductID(){
    const chars = '1234567890abcdefghijklmnopqrstuvwxyz'
    let id = ''

    for (var i = 0; i < 6; i++) {
        id += chars[Math.floor(Math.random() * 37)]
    }

    return id
}