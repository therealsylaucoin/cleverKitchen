import { useState, useEffect } from 'react';
import axios from 'axios';
import SearchResults from './SearchResults';
import { FaSearch } from 'react-icons/fa';


function Search() {

    const [ trivia, setTrivia ] = useState(''); //a random piece of food trivia
    const [ ingredientError, setIngredientError ] = useState(false);
    const [ ingSearchInput, setIngSearchInput ] = useState(''); //To capture the user search input
    const [ ingSearchResults, setIngSearchResults ] = useState([]); //To store the result recieved from the API
    const [ userIngredients, setUserIngredients ] = useState([]); //To store the ingredients that the user chooses to add
    const [ recipeResults, setRecipeResults ] = useState([]); //To store the recipe results received from the API (that include the users ingredients)

    //On load/mount, get a random trivia fact
    useEffect(() => {
        axios({
            url: 'https://api.spoonacular.com/food/trivia/random',
            method: 'GET',
            dataResponse: 'json',
            params: {
                apiKey: 'ebf0bdc8934b4824b0e22c89263afc4d',
            },
        }).then((res) => {
            setTrivia(res.data.text);
        })
    }, [])

    //Every time the input changes, call the API to get the ingredients that match the query
    useEffect(() => {
        axios({
            url: 'https://api.spoonacular.com/food/ingredients/search',
            method: 'GET',
            dataResponse: 'json',
            params: {
                apiKey: 'ebf0bdc8934b4824b0e22c89263afc4d',
                query: ingSearchInput,
            },
        }).then((res) => {
            //set the results in state
            setIngSearchResults(res.data.results);
            //If there are no ingredients and the input isn't an empty string, display error
            res.data.results.length === 0 && ingSearchInput !== '' ? setIngredientError(true) : setIngredientError(false)
            //If there are user ingredients, compare the arrays of ingredients
            if(userIngredients.length >= 1){
                compareIngredients(res.data.results, userIngredients);
            }
        }).catch((error) => {
            console.log(error);
        })
    }, [ingSearchInput, userIngredients])
    
    //Function to get receipes that match the user's selected ingredients - called on click
    const getRecipes = () => {
        axios({
            url: 'https://api.spoonacular.com/recipes/findByIngredients',
            method: 'GET',
            dataResponse: 'json',
            params: {
                apiKey: 'ebf0bdc8934b4824b0e22c89263afc4d',
                ingredients: JSON.stringify(userIngredients), //the query must be a string, we have an array
                number: 12,
            },
        }).then((res) => {
            //Call the sort recipes function to sort and set the result
            sortRecipes(res.data);
        }).catch((error) => {
            console.log(error);
        })
        //scroll to results section
        const element = document.getElementById('results');
        setTimeout(() => {
            window.scrollTo({
                behavior: element ? "smooth" : "auto",
                top: element ? element.offsetTop : 0
            });
        }, 100);
    }

    //Function to sort the recipes by missing ingredient (ascending)
    const sortRecipes = (array) => {
        array.sort((a, b) => (a.missedIngredientCount > b.missedIngredientCount) ? 1 : -1);
        setRecipeResults(array);
    }

    //Function to get another random trivia about food - called on click
    const getFact = () => {
        axios({
            url: 'https://api.spoonacular.com/food/trivia/random',
            method: 'GET',
            dataResponse: 'json',
            params: {
                apiKey: 'ebf0bdc8934b4824b0e22c89263afc4d',
            },
        }).then((res) => {
            setTrivia(res.data.text);
        })
    }

    //Function to trigger the Find Ingredients animation
    const toggleSearch = () => {
        const input = document.querySelector('.input');
        const button = document.querySelector('.searchBtn');
        input.classList.toggle('active'); //adding the active class transforms the button and input
        button.classList.toggle('active');
    }

    //Function to set the user input on change in order to be able to use it as a query for the API call
    const handleChange = (e) => {
        setIngSearchInput(e.target.value);
    }
    
    //Function to compare the user ingredients and the search results and disbale the ingredients that are already in the users list
    const compareIngredients = (resultArray, userArray) => {
        resultArray.forEach(ingredient => {
            for(let i = 0; i < userArray.length; i++){
                if(userArray[i].id === ingredient.id){
                    //store the id
                    const id = ingredient.id;
                    //find the button with that data attrribute
                    const buttons = document.querySelectorAll('.addBtn');
                    buttons.forEach(button => {
                        if(button.dataset.id === JSON.stringify(id)){
                            //disable it and change text
                            button.disabled = true;
                            button.innerHTML = "Added";
                            button.classList.add('inactive');
                        }
                    })
                }
            }
        })
    }

    //Function to add ingredients from the search results to the user's selected list
    const handleAdd = (ingredient) => {
        setUserIngredients([...userIngredients, ingredient]);
        //Clear the input
        const input = document.querySelector('input');
        input.value = '';
        setIngSearchInput('');
    }

    //Function to remove ingredients from the user's selected list
    const handleRemove = (ingredient) => {
        const array = [...userIngredients];
        const indexToRemove = userIngredients.indexOf(ingredient);
        if (indexToRemove > -1) {
            array.splice(indexToRemove, 1);
            setUserIngredients(array);
        }
    }

    //Function to clear the ingredient list and recipe results
    const handleClear = () => {
        setUserIngredients([]);
        setRecipeResults([]);
    }


    return (
        <>
            <div className="rightColumn">

                <h2>Find ingredients:</h2>   

                <div className="search">
                    <input 
                        onChange={handleChange} 
                        type="text" 
                        placeholder="Search ingredients"
                        className="input"
                    />  
                    <button
                        className="searchBtn"
                        onClick={toggleSearch}>
                        < FaSearch />
                    </button>
                </div>         

                <ul className="wrapper searchIng">
                {
                    ingredientError
                    ?   
                        <p>We couldnt find any ingredients that matched your search. Try a different search query.</p>
                    : 
                        ingSearchResults.map(ingredient => {
                        return (
                            < Ingredient
                                key={ingredient.id}
                                ingredient={ingredient}
                                handleClick={handleAdd}
                                action={'Add'}
                                className={'addBtn'}
                            />
                        )
                    })
                }
                </ul>

                <h2>Your ingredients:</h2>
                <p>Add ingredients by searching for them above.</p>
                <ul className="wrapper remove">
                {
                    userIngredients.map(ingredient => {
                    
                        return (
                            < Ingredient
                                key={ingredient.id}
                                ingredient={ingredient}
                                handleClick={handleRemove}
                                action={'Remove'}
                                className={'removeBtn'}
                            />
                        )
                    })
                }
                </ul>
                {
                    userIngredients.length >= 1 
                    ? 
                        <div className="flexContainer column">
                            <button 
                                onClick={getRecipes}>
                                Get Recipes
                            </button> 
                            <button
                                onClick={handleClear}
                                className="muted">
                                Clear
                            </button>
                        </div>
                    : null
                }
                
                <h2 >Did you know?</h2>
                <p>{trivia}</p>
                <button onClick={getFact}>Click for a different food fact!</button>
            </div>

            < SearchResults 
                results={recipeResults}
                ingredients={userIngredients}
            />
        </>
    );
}


function Ingredient(props) {

    const { ingredient, handleClick, action, className } = props;

    return (
            <li className="flexContainer ingredients">
                <p>{ingredient.name}</p>
                <button 
                    onClick={() => { handleClick(ingredient)}}
                    data-id={ingredient.id}
                    className={className}>
                    {action}
                </button>
            </li>
    );
}

export default Search;