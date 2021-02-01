import '../styles/App.scss';
import Header from './Header';
import Search from './Search';
import Footer from './Footer';

function App() {
  return (
    <div className="App">

      < Header />

      <main className="wrapper">

        < Search />

      </main>

      < Footer />
      
    </div>
  );
}

export default App;
