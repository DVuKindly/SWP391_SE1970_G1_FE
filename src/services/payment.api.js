import apiClient from './apiClient';

// Create payment for registration
export async function createPaymentForRegistration(registrationId, examId, tokens) {
  const json = await apiClient.post('/api/payments/createpayment-for-registration', {
    tokens,
    query: {
      registrationId,
      examId
    }
  });
  return json;
}

// Handle VNPay return
export async function handleVnPayReturn(params, tokens) {
  const json = await apiClient.get('/api/payments/vnpayreturn', {
    tokens,
    query: params
  });
  return json;
}
