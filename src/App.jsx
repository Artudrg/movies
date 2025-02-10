import React, { useEffect, useState } from 'react';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { updateSearchCount, getTendingMovies } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([])

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      const filteredGenres = data.genres.filter((genre) =>
        ['Horror', 'Comedy', 'Romance', 'Mystery', 'Action', 'Drama'].includes(genre.name)
      );
      setGenres(filteredGenres);
    } catch (error) {
      console.error(`Error fetching genres: ${error}`);
    }
  };

  const fetchMovies = async (query = '', genreId = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      let endpoint = query 
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      if (genreId) endpoint += `&with_genres=${genreId}`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      if (data.results) {
        setMovieList(data.results);
        if(query && data.results.length > 0){
          await updateSearchCount(query,data.results[0])
        }
      } else {
        setErrorMessage('No movies found.');
        setMovieList([]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () =>{
    try {
      const movies = await getTendingMovies()
      setTrendingMovies(movies)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadTrendingMovies()
  }, [])
  

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, selectedGenre);
  }, [debouncedSearchTerm, selectedGenre]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  return (
    <main>
      <div className='pattern' />
      <div className='wrapper max-w-[1200px] mx-auto px-4'>
        <header>
          <img src='/hero.png' alt='Hero Banner' />
          <h1 className='text-center'>
            Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className='genre-buttons mt-4 flex justify-center gap-2 flex-wrap'>
            {genres.map((genre) => (
              <button
                key={genre.id}
                className={`px-4 py-2 rounded ${
                  selectedGenre === genre.id.toString() ? 'bg-purple-600 text-white rounded-2xl' : 'bg-dark-100 shadow-light-100/10 text-white rounded-2xl shadow-inner'
                }`}
                onClick={() => setSelectedGenre(selectedGenre === genre.id.toString() ? '' : genre.id.toString())}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </header>

        {trendingMovies.length>0 && (<section className='trending'><h2>Trending Movies</h2>
        <ul>
          {trendingMovies.map((movie,index)=>(
            <li key={movie.$id}>
              <p>{index+1}</p>
              <img src={movie.poster_url} alt={movie.title} />
            </li>
          ))}
        </ul>
        </section>)}
        <section className='all-movies'>
          <h2>Popular</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;