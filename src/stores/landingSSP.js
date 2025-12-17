/**
 * Pinia store для тестов ССП с лендингов
 * 
 * Функциональность:
 * - Сохранение результатов теста (без авторизации)
 * - Получение результатов по hash
 * - Привязка теста к пользователю после авторизации
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postRequest } from '@/services/api.js'
import { DEBUG_MODE } from '@/config/settings.js'

const STORAGE_KEY = 'landing_ssp_hash'

const categoryBackendToFrontend = {
  'welfare': 'wealth',
  'hobby': 'hobbies',
  'environment': 'friendship',
  'health_sport': 'health',
  'work': 'career',
  'family': 'love'
}

const categoryFrontendToBackend = {
  'wealth': 'welfare',
  'hobbies': 'hobby',
  'friendship': 'environment',
  'health': 'health_sport',
  'career': 'work',
  'love': 'family'
}

export const useLandingSSPStore = defineStore('landingSSP', () => {
  const currentTest = ref(null)
  const pendingHash = ref(localStorage.getItem(STORAGE_KEY) || null)
  const isLoading = ref(false)
  const error = ref(null)
  
  const hasPendingTest = computed(() => !!pendingHash.value)
  
  function mapCategoryToBackend(frontendId) {
    return categoryFrontendToBackend[frontendId] || frontendId
  }
  
  function mapCategoryToFrontend(backendId) {
    return categoryBackendToFrontend[backendId] || backendId
  }
  
  function transformCategoriesForBackend(categories) {
    return categories.map(cat => ({
      category: mapCategoryToBackend(cat.category || cat.id),
      score: cat.score,
      answer: cat.answer || cat.rating_reason || null
    }))
  }
  
  function transformCategoriesFromBackend(categories) {
    if (!categories) return []
    return categories.map(cat => ({
      ...cat,
      frontendId: mapCategoryToFrontend(cat.category)
    }))
  }
  
  async function saveTest(categoriesData, page = 'ssp_test', meta = null) {
    isLoading.value = true
    error.value = null
    
    try {
      const payload = {
        page,
        categories_data: transformCategoriesForBackend(categoriesData)
      }
      
      if (meta) {
        payload.meta = meta
      }
      
      if (DEBUG_MODE) {
        console.log('[LandingSSP] Saving test:', payload)
      }
      
      const response = await postRequest('/api/rest/front/app/landing-ssp-test/save/', payload)
      
      if (response.status === 'ok') {
        currentTest.value = {
          ...response.data,
          categories_data: transformCategoriesFromBackend(response.data.categories_data)
        }
        
        if (!response.data.is_linked_to_user) {
          pendingHash.value = response.data.hash
          localStorage.setItem(STORAGE_KEY, response.data.hash)
        }
        
        if (DEBUG_MODE) {
          console.log('[LandingSSP] Test saved:', response.data)
        }
        
        return response.data
      } else {
        throw new Error(response.error_data?.error || 'Failed to save test')
      }
    } catch (err) {
      error.value = err.message || 'Failed to save test'
      if (DEBUG_MODE) {
        console.error('[LandingSSP] Save error:', err)
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function getTest(hash) {
    isLoading.value = true
    error.value = null
    
    try {
      if (DEBUG_MODE) {
        console.log('[LandingSSP] Getting test by hash:', hash)
      }
      
      const response = await postRequest('/api/rest/front/app/landing-ssp-test/get/', { hash })
      
      if (response.status === 'ok') {
        currentTest.value = {
          ...response.data,
          categories_data: transformCategoriesFromBackend(response.data.categories_data)
        }
        
        if (DEBUG_MODE) {
          console.log('[LandingSSP] Test loaded:', response.data)
        }
        
        return response.data
      } else {
        throw new Error(response.error_data?.error || 'Test not found')
      }
    } catch (err) {
      error.value = err.message || 'Failed to load test'
      if (DEBUG_MODE) {
        console.error('[LandingSSP] Get error:', err)
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function linkToUser() {
    if (!pendingHash.value) {
      if (DEBUG_MODE) {
        console.log('[LandingSSP] No pending hash to link')
      }
      return null
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      if (DEBUG_MODE) {
        console.log('[LandingSSP] Linking test to user:', pendingHash.value)
      }
      
      const response = await postRequest('/api/rest/front/app/landing-ssp-test/link/', {
        hash: pendingHash.value
      })
      
      if (response.status === 'ok') {
        pendingHash.value = null
        localStorage.removeItem(STORAGE_KEY)
        
        if (DEBUG_MODE) {
          console.log('[LandingSSP] Test linked:', response.data)
        }
        
        return response.data
      } else {
        throw new Error(response.error_data?.error || 'Failed to link test')
      }
    } catch (err) {
      if (err.response?.data?.error_data?.error === 'landing_ssp_already_linked_other') {
        pendingHash.value = null
        localStorage.removeItem(STORAGE_KEY)
      }
      
      error.value = err.message || 'Failed to link test'
      if (DEBUG_MODE) {
        console.error('[LandingSSP] Link error:', err)
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  function clearPendingHash() {
    pendingHash.value = null
    localStorage.removeItem(STORAGE_KEY)
  }
  
  function setPendingHash(hash) {
    pendingHash.value = hash
    localStorage.setItem(STORAGE_KEY, hash)
  }
  
  return {
    currentTest,
    pendingHash,
    isLoading,
    error,
    hasPendingTest,
    saveTest,
    getTest,
    linkToUser,
    clearPendingHash,
    setPendingHash,
    mapCategoryToBackend,
    mapCategoryToFrontend
  }
})
