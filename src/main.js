import { getImagesByQuery, PER_PAGE } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const input = document.querySelector('input[name="search-text"]');
const loadMoreBtn = document.querySelector('.load-more');

let currentQuery = '';
let currentPage = 1;
let totalHits = 0;

form.addEventListener('submit', async event => {
  event.preventDefault();
  currentQuery = input.value.trim();

  if (!currentQuery) {
    iziToast.warning({
      
      message: 'Please enter a search term!',
      position: 'topRight',
    });
    return;
  }

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  currentPage = 1;

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    totalHits = data.totalHits;

    if (!data.hits.length) {
      iziToast.info({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    if (totalHits <= PER_PAGE) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      
      showLoadMoreButton();
    }
  } catch (error) {
    console.error(error);
    iziToast.error({
      
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});


loadMoreBtn.addEventListener('click', async () => {
  
  hideLoadMoreButton();
  loadMoreBtn.disabled = true;
  showLoader();

  currentPage += 1;

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    if (Array.isArray(data.hits) && data.hits.length > 0) {
      createGallery(data.hits);

      
      smoothScroll();

      const totalLoaded = document.querySelectorAll('.gallery-item').length;
      if (totalLoaded >= totalHits) {
        hideLoadMoreButton();
        iziToast.info({
          message: "We're sorry, but you've reached the end of search results.",
          position: 'topRight',
        });
      } else {
        
        showLoadMoreButton();
      }
    } else {
      
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
      hideLoadMoreButton();
    }
  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong while loading more images.',
      position: 'topRight',
    });
    
    showLoadMoreButton();
  } finally {
    hideLoader();
    loadMoreBtn.disabled = false;
  }
});

function smoothScroll() {
  const firstCard = document.querySelector('.gallery-item');
  if (!firstCard) return;
  const { height: cardHeight } = firstCard.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}