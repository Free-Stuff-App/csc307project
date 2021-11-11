import React, {useState, useEffect} from 'react';
import Form from './Form';
import Cards from './Card';
import Navbar from './Navbar';
import About from './About';
import Register from './Register';
import Login from './Login';
import axios from 'axios';
import {
    BrowserRouter as Router,
    Switch,
    Route,
  } from "react-router-dom";


function App() {

    const[products, setProducts] = useState([])
    const[user, setUser] = useState([])

    useEffect(() => {
        fetchAll().then( result => {
          if (result) {
            setProducts(result.data.productList);
          }

        });
       }, [] );


    async function fetchAll(){
        try {
           const response = await axios.get('http://localhost:5000/');
           console.log("response from frontend")
           console.log(response)
           return response 
        }
        catch (error){
           console.log(error); 
           return false;         
        }
      }  
    

    function addProduct(product) { 
        makePostCall(product).then( result => {
        if (result && result.status === 201)
          setProducts([...products, result.data]);
        });
    }

    function addUser(user) { 
        makeUserPostCall(user).then( result => {
        if (result && result.status === 201)
          console.log(result.data)
          setUser(user, result.data);
        });
    }
    
    async function makePostCall(product) {
        try {
           const response = await axios.post('http://localhost:5000/products', product);
           console.log(response)
           return response;
        }
        catch (error) { 
           console.log(error);
           return false;
        }
    }

    async function makeUserPostCall(user) {
        try {
           const response = await axios.post('http://localhost:5000/register', user);
           console.log("hey heres the response from makeUserPostCall")
           console.log(response)
           return response;
        }
        catch (error) { 
           console.log(error);
           return false;
        }
    }

    return (
        <Router>
            <div>

                <Navbar />
                <Switch>
                    <Route path="/register">
                        <Register handleSubmit={addUser}/>
                    </Route>

                    <Route path="/login">
                        <Login/>
                    </Route>

                    <Route path="/submit">
                        <Form handleSubmit={addProduct} />
                    </Route>

                    <Route path="/about">
                        <About/>
                    </Route>

                    <Route path="/">
                        <Cards productData={products}/>
                    </Route>
                </Switch>

            </div>
        </Router>
    );
}

export default App;