import './App.css';
import { Footer } from './components/Footer/Footer';
import { Games } from './components/Games/Games';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Games />
      </main>
      <Footer />
    </>
  )
}

export default App;