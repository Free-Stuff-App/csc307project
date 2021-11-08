import React, {useState, useEffect} from 'react';
import Form from './Form';
import Cards from './Card';
import NavBar from './NavBar';
import axios from 'axios';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";


function App() {

    const[products, setProducts] = useState([])

    useEffect(() => {
        fetchAll().then( result => {
          if (result)
              setProducts(result);
        });
       }, [] );

    async function fetchAll(){
        try {
           const response = await axios.get('http://localhost:5000/products');
           return response.data.productsList;     
        }
        catch (error){
           //We're not handling errors. Just logging into the console.
           console.log(error); 
           return false;         
        }
      }  
    

    function addProduct(product) { 
        makePostCall(product).then( result => {
        if (result && result.status === 201)
          setProducts([...products, result.data] );
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

    // function removeOneCharacter(index) {

    //     makeDeleteCall(characters[index].id).then( result => {
    //       if (result && result.status === 204) {
    //         const updated = characters.filter((characters, i) => {
    //           return i !== index
    //         });
    //         setCharacters(updated);
    //       }
    //     });
    // }

    return (
        <Router>
            <div>
                <NavBar/>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>    
                        </li>
                        <li>
                            <Link to="/submit">Submit a product</Link>
                        </li>                        
                    </ul>
                    
                </nav>

                <Switch>

                    <Route path="/submit">
                        <Form handleSubmit={addProduct} />
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