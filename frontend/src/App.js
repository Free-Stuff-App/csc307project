import React, {useState} from 'react';
import Form from './Form';
import Cards from './Card';
import axios from 'axios';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";


function App() {

    const[products, setProducts] = useState([])

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
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/products">Submit a product</Link>
                        </li>
        
                    </ul>
                </nav>

                <Switch>

                    <Route path="/products">
                        <Form handleSubmit={addProduct} />
                    </Route>

                    <Route path="/">
                        <Cards/ >
                    </Route>

                </Switch>
            </div>
        </Router>
    );
}

export default App;