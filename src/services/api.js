/**
 * API Service для работы с бэкендом
 * Предоставляет методы для всех API запросов
 */

class ApiService {
  constructor() {
    this.baseURL = '/api/rest/front'
    this.csrfToken = null
  }

  /**
   * Получить CSRF токен из кук
   */
  getCsrfTokenFromCookie() {
    const name = 'csrftoken'
    let cookieValue = null
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';')
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim()
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
          break
        }
      }
    }
    return cookieValue
  }

  /**
   * Запросить CSRF токен с сервера
   * Должен вызываться при инициализации приложения
   */
  async fetchCsrfToken() {
    try {
      const response = await fetch(`${this.baseURL}/csrf/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        credentials: 'same-origin'
      })

      // Токен будет в куках, извлечем его
      this.csrfToken = this.getCsrfTokenFromCookie()

      return { success: true, token: this.csrfToken }
    } catch (error) {
      console.error('Error fetching CSRF token:', error)
      return { success: false, error }
    }
  }

  /**
   * Базовый метод для выполнения запросов к API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    // Получаем актуальный CSRF токен из кук
    const csrfToken = this.getCsrfTokenFromCookie()

    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    // Добавляем CSRF токен для POST, PUT, PATCH, DELETE запросов
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase())) {
      if (csrfToken) {
        defaultHeaders['X-CSRFToken'] = csrfToken
      }
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'same-origin'
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      // Проверяем статус ответа
      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          status: data.status
        }
      } else {
        // Обработка ошибок 40x
        return {
          success: false,
          error: data.error_data || data,
          status: data.status,
          statusCode: response.status
        }
      }
    } catch (error) {
      console.error('API Request Error:', error)
      return {
        success: false,
        error: {
          message: 'Ошибка сети или сервера',
          error: 'NETWORK_ERROR',
          originalError: error
        }
      }
    }
  }

  /**
   * Регистрация нового пользователя
   */
  async register(userData) {
    return this.request('/registration/', {
      method: 'POST',
      body: JSON.stringify({
        first_name: userData.firstName,
        email: userData.email,
        password1: userData.password1,
        password2: userData.password2
      })
    })
  }

  /**
   * Вход пользователя
   */
  async login(credentials) {
    return this.request('/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  /**
   * Выход пользователя
   */
  async logout() {
    return this.request('/logout/', {
      method: 'POST'
    })
  }
}

// Создаем единственный экземпляр API сервиса
const apiService = new ApiService()

export default apiService
