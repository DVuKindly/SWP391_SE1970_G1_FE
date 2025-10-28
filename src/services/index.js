
import apiClient, { apiClient as namedApiClient } from './apiClient';
import {
  getRoles,
  getAccounts,
  getAccountByEmail,
  putAccountStatus,
  bulkAccountStatus,
  createStaff,
} from './accounts.api';
import { getExams, getExamById } from './exam.api';
import { createPaymentForRegistration, handleVnPayReturn } from './payment.api';

export { namedApiClient as apiClient };

export const accounts = {
  getRoles,
  getAccounts,
  getAccountByEmail,
  putAccountStatus,
  bulkAccountStatus,
  createStaff,
};

export const exams = {
  getExams,
  getExamById,
};

export const payments = {
  createPaymentForRegistration,
  handleVnPayReturn,
};

const services = {
  apiClient,
  accounts,
  exams,
  payments,
};

export default services;


