
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Layout } from 'antd';
import ImageCard from './Components/ImageCard';
import PreviewModal from './Components/PreviewModal';
import { Dna } from 'react-loader-spinner'
const { Header } = Layout

const API_KEY = process.env.REACT_APP_API_KEY
console.log(API_KEY)
const API_URL_DEFAULT = `https://www.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${API_KEY}&safe_search=1&format=json&nojsoncallback=1`;
const API_URL_SEARCH = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&safe_search=1&format=json&nojsoncallback=1`;

const App = () => {
  const [photos, setPhotos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState(true)
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    fetchRecentPhotos();
    fetchSearchResults()
  }, []);
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [])




  const handleClickOutside = (event) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(event.target) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target)
    ) {
      setShowSuggestions(false);
    }
  };


  const fetchRecentPhotos = async () => {
    try {
      const response = await axios.get(API_URL_DEFAULT);
      setPhotos(response?.data?.photos?.photo);
      setLoaderStatus(false)
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSearchResults = async () => {
    try {
      const response = await axios.get(`${API_URL_SEARCH}&text=${searchText}&page=${page}`);
      const newPhotos = response?.data?.photos?.photo;
      if (newPhotos) {
        setSearchResults((prevResults) => [...prevResults, ...newPhotos]);
        setHasMore(newPhotos.length > 0);
        setLoaderStatus(false)
      }
    } catch (error) {
      console.error(error);
    }
  };


  const handleSearch = async (query) => {
    setSearchText(query)
    setSearchResults([])
    setLoaderStatus(true)
    try {
      const response = await axios.get(API_URL_SEARCH, {
        params: {
          api_key: API_KEY,
          text: query,
          safe_search: 1,
          format: "json",
          nojsoncallback: 1,
        },
      });

      setSearchResults(response.data.photos.photo);
      setLoaderStatus(false)
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (event) => {
    setLoaderStatus(true)
    const { value } = event.target;
    setSearchText(value)
    if (value) {
      handleSearch(value);
    } else {
      setSearchResults([]);
      setLoaderStatus(false)
    }
  };


  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchText.trim() !== '') {
      saveSearchQuery(searchText);
      setPage(1);
      setSearchResults([]);
      setHasMore(true);
      fetchSearchResults();
      setLoaderStatus(true);
    }
  };

  const handleScroll = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
      fetchSearchResults();
    }
  };

  const handlePhotoClick = (photo) => {
    setModalPhoto(photo);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalPhoto(null);
  };

  const saveSearchQuery = (query) => {
    query = query.toLowerCase()
    const searchQueries = localStorage.getItem('searchQueries');
    if (searchQueries) {
      const queries = JSON.parse(searchQueries);
      if (!queries.includes(query)) {
        queries.push(query);
        localStorage.setItem('searchQueries', JSON.stringify(queries));
      }
    } else {
      localStorage.setItem('searchQueries', JSON.stringify([query]));
    }
  };

  const loader = <Dna
    visible={true}
    height="200"
    width="200"
    ariaLabel="dna-loading"
    wrapperStyle={{}}
    wrapperClass="dna-wrapper"
  />

  return (
    <div className='App'>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >

        <nav className="navbar">
          <h1 className='logo'>Image Search Gallery</h1>
          <div className='search-bar'>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", }}>
              <input
                className='input-box'
                type="text"
                value={searchText}
                onChange={handleChange}
                placeholder="Search photos"
                onFocus={() => setShowSuggestions(true)}
                ref={inputRef}

              />
              <button
                type="submit"
                className='input-button'
              >
                Search
              </button>
            </form>
            {showSuggestions && localStorage.getItem('searchQueries') ? <ul className="suggestions" ref={suggestionsRef}>
              {localStorage.getItem('searchQueries') &&
                JSON.parse(localStorage.getItem('searchQueries')).map((query, index) => (
                  <li key={index} onClick={() => handleSearch(query)}>{query}</li>
                ))}
            </ul> : <></>}

          </div>
        </nav>
      </Header>
      <div className="main-layout">
        {loaderStatus && <div>{loader}</div>}
        {searchText ? (
          searchResults.length ? (
            <InfiniteScroll
              dataLength={searchResults.length}
              next={handleScroll}
              hasMore={hasMore}
              loader={loader}
            >
              <ImageCard photos={searchResults} handlePhotoClick={handlePhotoClick} />
            </InfiniteScroll>
          ) : loaderStatus ? (
            <></>
          ) : (
            <h4>Sorry! No Results Found</h4>
          )
        ) : (
          <ImageCard photos={photos} handlePhotoClick={handlePhotoClick} />
        )}
        <PreviewModal modalPhoto={modalPhoto} modalIsOpen={modalIsOpen} closeModal={closeModal} />
      </div>

    </div>
  );
};


export default App;


