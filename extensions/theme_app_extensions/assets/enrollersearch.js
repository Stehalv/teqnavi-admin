function initEnrollerSearch(blockId) {
  const container = document.querySelector(`.enrollment-form[data-block-id="${blockId}"]`);
  const defaultWebalias = container.dataset.defaultWebalias;
  const apiUrl = container.dataset.apiUrl;
  const referralCookieName = 'refId';

  const searchInput = document.getElementById(`cartSearchEnrollerInput-${blockId}`);
  const searchResults = document.getElementById(`cartEnrollerSearchResult-${blockId}`);
  const searchContainer = container.querySelector('.cart-enroller-search-container');
  const enrollerBox = container.querySelector('.cart-enroller-box');

  function delay(fn, ms) {
    let timer = 0;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(fn.bind(this, ...args), ms || 0);
    };
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
  }

  function getUrlVars() {
    const vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

  async function getEnroller(callback) {
    const webalias = getCookie(referralCookieName);
    try {
      const response = await fetch(`${apiUrl}/api/context/GetEnroller?webAlias=${webalias}&shopUrl=${window.location.host}`);
      const data = await response.json();
      callback(data);
    } catch (error) {
      console.error('Error fetching enroller:', error);
    }
  }

  async function searchForEnroller(query) {
    searchResults.style.display = 'block';
    const currentWebalias = getCookie(referralCookieName).toLowerCase();

    try {
      const response = await fetch(
        `${apiUrl}/api/context/EnrollerSearch?query=${query}&shopUrl=${window.location.host}&includeAffiliates=true`
      );
      const data = await response.json();

      if (data.length === 0) {
        searchResults.innerHTML = '<span class="enroller-no-result">No results found</span>';
      } else {
        const template = Handlebars.compile(document.getElementById(`cart-search-result-template-${blockId}`).innerHTML);
        data.forEach(item => {
          const url = location.href.includes('ref=')
            ? location.href.toLowerCase().replace(currentWebalias, item.webAlias)
            : `${location.href}?ref=${item.webAlias}`;
          item.link = url;
        });
        searchResults.innerHTML = template(data);
      }
    } catch (error) {
      console.error('Error searching for enroller:', error);
      searchResults.innerHTML = '<span class="enroller-no-result">Error searching for enrollers</span>';
    }
  }

  // Event Listeners
  container.querySelectorAll('[data-role="search-enroller"]').forEach(el => {
    el.addEventListener('click', () => {
      searchContainer.style.display = 'block';
      enrollerBox.style.display = 'none';
    });
  });

  container.querySelectorAll('[data-role="end-search-enroller"]').forEach(el => {
    el.addEventListener('click', () => {
      searchContainer.style.display = 'none';
      if (getCookie(referralCookieName).toLowerCase() !== defaultWebalias.toLowerCase()) {
        enrollerBox.style.display = 'block';
      }
    });
  });

  window.addEventListener('click', () => {
    searchResults.style.display = 'none';
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value !== '') {
      searchResults.style.display = 'block';
    }
  });

  searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  searchResults.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  searchInput.addEventListener('keyup', delay(function(e) {
    const query = this.value;
    if (query === '') {
      searchResults.style.display = 'none';
    } else {
      searchForEnroller(query);
    }
  }, 500));

  // Initialize enroller info
  const cartEnrollerSearch = document.getElementById(`cartEnrollerSearch-${blockId}`);
  if (cartEnrollerSearch) {
    getEnroller((response) => {
      document.getElementById(`cartEnrollerInfo-${blockId}`).innerHTML = 
        `${response.firstName} ${response.lastName} ID#${response.customerID}`;
      container.querySelectorAll('.cartenrollername').forEach(el => {
        el.innerHTML = `${response.firstName} ${response.lastName} ID#${response.customerID}`;
      });
      cartEnrollerSearch.style.display = 'block';
    });
  }

  if (getCookie(referralCookieName).toLowerCase() === defaultWebalias.toLowerCase()) {
    document.getElementById(`cartSearch-label-${blockId}`).innerHTML = "Let's find your Brand Partner or Affiliate";
    searchContainer.style.display = 'block';
    enrollerBox.style.display = 'none';
  }

  const cartopen = getUrlVars()['cartopen'];
  if (cartopen !== undefined) {
    document.querySelector('[aria-label="Cart"]').setAttribute('aria-expanded', true);
  }
}

// Initialize all enroller search blocks when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.enrollment-form').forEach(form => {
    initEnrollerSearch(form.dataset.blockId);
  });
});