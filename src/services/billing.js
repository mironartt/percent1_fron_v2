import { request } from './api.js'

export async function getTariffsLanding() {
  return request('POST', '/api/rest/front/land/tariffs/get/', {})
}

export async function getTariffs() {
  return request('POST', '/api/rest/front/app/tariffs/get/', {})
}

export async function getSubscription() {
  return request('POST', '/api/rest/front/app/subscription/get/', {})
}

export async function activatePromocode(code) {
  return request('POST', '/api/rest/front/app/promocode/activate/', { code })
}

export async function getPromocode() {
  return request('POST', '/api/rest/front/app/promocode/get/', {})
}

export async function calculatePayment(tariffId, termId) {
  return request('POST', '/api/rest/front/app/payment/calculate/', {
    tariff_id: tariffId,
    term_id: termId
  })
}

export async function createPayment(tariffId, termId, finalPrice) {
  return request('POST', '/api/rest/front/app/payment/create/', {
    tariff_id: tariffId,
    term_id: termId,
    final_price: finalPrice
  })
}

export async function getPaymentHistory() {
  return request('POST', '/api/rest/front/app/payment/history/', {})
}

export async function getPaymentDetails(paymentId) {
  return request('POST', '/api/rest/front/app/payment/get/', {
    payment_id: paymentId
  })
}
