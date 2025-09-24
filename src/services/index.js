
import apiClient, { apiClient as namedApiClient } from './apiClient';
import {
  getRoles,
  getAccounts,
  getAccountByEmail,
  putAccountStatus,
  bulkAccountStatus,
  createStaff,
} from './accounts.api';

export { namedApiClient as apiClient };

export const accounts = {
  getRoles,
  getAccounts,
  getAccountByEmail,
  putAccountStatus,
  bulkAccountStatus,
  createStaff,
};

const services = {
  apiClient,
  accounts,
};

export default services;


