import React from 'react';

const languageMap = {
  en: 'eng',
  es: 'spa',
  fr: 'fra',
  de: 'deu',
  it: 'ita',
  pt: 'por',
  ru: 'rus',
  zh: 'zho',
  ja: 'jpn',
  ko: 'kor',
};

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, original_language } }) => {
  const getThreeLetterCode = (lang) => languageMap[lang] || 'N/A';

  return (
    <div className='movie-card'>
      <img
        src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
        alt={title}
      />
      <div className='mt-4'>
        <h3>{title}</h3>
        <div className='content'>
          <div className='rating'>
            <img src='/star.svg' alt='Star Icon' />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>
          <span>•</span>
          <p className='lang'>{getThreeLetterCode(original_language)}</p>
          <span>•</span>
          <p className='year'>
            {release_date ? release_date.split('-')[0] : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;