import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactHtmlParser from 'react-html-parser'; //package to parse strings in HTML elements


function SearchResults(props) {

    const { results, ingredients } = props;
    const [ displayedRecipe, setDisplayedRecipe ] = useState({}); //The recipe that is currently being displayed

    //On load/mount, get a random recipe and display it on the page as a Feature Recipe
    useEffect(() => {
        axios({
            url: 'https://api.spoonacular.com/recipes/random',
            method: 'GET',
            dataResponse: 'json',
            params: {
                apiKey: 'ebf0bdc8934b4824b0e22c89263afc4d',
            },
        }).then((res) => {
            setDisplayedRecipe(res.data.recipes[0]);
        }).catch((error) => {
            console.log(error);
        })
    }, [])

    //Function to display the details of the selected recipe (rather than the Feature Recipe)
    function handleClick(recipe){
        axios({
            url: `https://api.spoonacular.com/recipes/${recipe.id}/information`,
            method: 'GET',
            dataResponse: 'json',
            params: {
                apiKey: 'ebf0bdc8934b4824b0e22c89263afc4d',
            },
        }).then((res) => {
            setDisplayedRecipe(res.data);
        }).catch((error) => {
            console.log(error);
        })
        //scroll to detailed recipe section
        const element = document.getElementById('details');
        setTimeout(() => {
            window.scrollTo({
                behavior: element ? "smooth" : "auto",
                top: element ? element.offsetTop : 0
            });
        }, 100);
    }

    return (
        <div className="leftColumn" id="results">
        {
            results.length > 1 
            ? <div className="flexContainer">
                <h2>Recipes with:</h2> 
                <ul className="flexContainer included">
                {
                    ingredients.map(ingredient => {
                        return(
                            <li key={ingredient.id} className="ingredients">
                                {ingredient.name}
                            </li>
                        )
                    })
                }
                </ul>
                </div>
            : 
                <h2>Featured Recipe</h2>
        }
        
        <ul className="flexContainer searchResults center">
        {
            results.map(recipe => {
                return(
                    < Recipe 
                        key={recipe.id}
                        recipe={recipe}
                        handleClick={handleClick}
                    />
                );
            })
        }
        </ul>

        < Details 
            recipe={displayedRecipe}
        />

        </div>
    );
}


function Recipe(props) {

    const { recipe, handleClick } = props;

    return (
        <li 
            className="center resultRecipe lightBg"
            >
            <h3>{recipe.title}</h3>
            <div>
                <button 
                    onClick={() => {handleClick(recipe)}}
                >See recipe
                </button>
                <p>Missing ingredients: {recipe.missedIngredientCount}</p>
                <img src={recipe.image} alt={recipe.title}/>
            </div>
    </li>
    );
}


function Details(props) {

    const { recipe } = props;

    return (
        <div className="details" id="details">
            <div className="wrapper">
                <h2>{recipe.title}</h2>
                <p>Ready in: {recipe.readyInMinutes} minutes</p>
                <p>Recipe by: {recipe.creditsText}</p>
                <a href={recipe.sourceUrl}>View complete recipe</a>
                <img src={recipe.image} alt={recipe.title}/>
                <div> 
                    <h3>About this recipe:</h3>
                    {/* summary and instructions are being returned as a string, use the parser to render HTML content */}
                    { ReactHtmlParser (recipe.summary) } 
                </div>
                <ul>
                    <h3>What you'll need:</h3>
                {
                    recipe.extendedIngredients ?
                    recipe.extendedIngredients.map((ingredient, index) => {
                        return(
                            <li key={index}>
                                <p>{ingredient.amount} {ingredient.unit} {ingredient.name}</p>
                            </li>
                        )
                    })
                    : null
                }
                </ul>
                <div> 
                    <h3>Instructions:</h3>
                    { 
                        recipe.instructions === null 
                            ?   <p>View instructions <a href={recipe.sourceUrl}>here</a></p> //If no instructions are provided, link the the source
                            : ReactHtmlParser (recipe.instructions) 
                    } 
                </div>
            </div>
        </div>
    );
}

export default SearchResults;