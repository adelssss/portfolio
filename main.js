// main.js

// Функция для обработки ошибок при загрузке страницы
function handleError(errorMessage) {
    alert(errorMessage);
  }
  
  // Пример для динамической загрузки и отображения данных (например, список портфолио)
  async function fetchPortfolioItems() {
    try {
      // Выполним запрос на сервер для получения данных о портфолио
      const response = await fetch('/portfolio');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio items');
      }
  
      const items = await response.json(); // Допустим, сервер возвращает данные в формате JSON
      displayPortfolioItems(items);
    } catch (error) {
      handleError(error.message);
    }
  }
  
  // Функция для отображения портфолио на странице
  function displayPortfolioItems(items) {
    const portfolioContainer = document.getElementById('portfolio-container');
    portfolioContainer.innerHTML = ''; // Очистим контейнер
  
    items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('portfolio-item');
      
      // Добавление изображений в карусель
      const images = item.images.map(image => `<img src="${image}" alt="${item.title}" />`).join('');
      itemElement.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="carousel">${images}</div>
        <p>Created: ${new Date(item.createdAt).toLocaleDateString()}</p>
        <p>Updated: ${new Date(item.updatedAt).toLocaleDateString()}</p>
      `;
      portfolioContainer.appendChild(itemElement);
    });
  }
  
  // Обработчик для формы регистрации
  document.getElementById('register-form')?.addEventListener('submit', async function (e) {
    e.preventDefault(); // Отключаем стандартное поведение формы
  
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
  
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Registration failed');
      }
  
      window.location.href = '/login'; // Перенаправляем на страницу входа
    } catch (error) {
      handleError(error.message);
    }
  });
  
  // Обработчик для формы логина
  document.getElementById('login-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      window.location.href = '/'; // Перенаправляем на главную страницу после успешного логина
    } catch (error) {
      handleError(error.message);
    }
  });
  
  // Пример автозаполнения поля поиска (для фильтрации контента)
  document.getElementById('search-bar')?.addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const portfolioItems = document.querySelectorAll('.portfolio-item');
  
    portfolioItems.forEach(item => {
      const title = item.querySelector('h3').textContent.toLowerCase();
      if (title.includes(searchTerm)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
  
  // Загружаем данные портфолио при инициализации страницы
  document.addEventListener('DOMContentLoaded', fetchPortfolioItems);
  
