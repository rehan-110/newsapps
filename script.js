
document.addEventListener('DOMContentLoaded', () => {
  const showData = document.getElementById("showData");
  const input = document.getElementById("inputData");
  const searchBtn = document.getElementById("searchBtn");

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const showLoading = () => {
    showData.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
      </div>
    `;
  };

  const showAlert = (message, type = 'info') => {
    const alertTypes = {
      info: 'text-blue-600 bg-blue-50',
      error: 'text-red-600 bg-red-50',
      success: 'text-green-600 bg-green-50'
    };
    
    showData.innerHTML = `
      <div class="p-4 rounded-lg ${alertTypes[type]} max-w-2xl mx-auto text-center">
        ${message}
      </div>
    `;
  };

  const displayArticles = (articles) => {
    showData.innerHTML = articles.map(article => {
      const imageUrl = article.urlToImage || createPlaceholderSVG(article.title || 'News Image');
      const publishedDate = article.publishedAt ? 
        new Date(article.publishedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : '';

      return `
        <article class="news-card">
          <div class="card-image-container">
            <img src="${imageUrl}" 
                 class="card-image" 
                 alt="${article.title || ''}"
                 onerror="this.src='${createPlaceholderSVG('Image Load Error')}'">
          </div>
          <div class="card-content">
            <h3 class="card-title">${article.title || 'No Title Available'}</h3>
            <p class="card-text">${article.description || 'No description available.'}</p>
            <div class="card-footer">
              <span class="card-source">${article.source?.name || 'Unknown'} • ${publishedDate}</span>
              <a href="${article.url}" target="_blank" class="read-more">Read Story</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  };

  const createPlaceholderSVG = (text) => {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Inter, sans-serif" font-size="14" 
              fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
          ${text}
        </text>
      </svg>`
    )}`;
  };

  const getNews = async () => {
    const query = input.value.trim();
    
    if (!query) {
      showAlert("Please enter a search term", "error");
      return;
    }

    showLoading();

    try {
      const API_URL = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=12&language=en&apiKey=0411a42176a84cf2999c8031c2510b40`;
      
      const response = await fetch(API_URL, {
        headers: {
          'User-Agent': 'PrimeNews/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch news');
      }

      const data = await response.json();

      if (!data.articles?.length) {
        showAlert("No articles found. Try different keywords.", "info");
        return;
      }

      displayArticles(data.articles);
    } catch (error) {
      console.error("News fetch error:", error);
      showAlert(`Error: ${error.message}`, "error");
    }
  };

  searchBtn.addEventListener('click', debounce(getNews, 300));
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') debounce(getNews, 300)();
  });
});