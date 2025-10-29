
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
import {
  getAppointments,
  getAppointmentById,
  getEligiblePatients,
  getDoctorsWithSchedules,
  createAppointment,
  approveAppointment,
  deleteAppointment,
} from './appointment.api';

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

export const appointments = {
  getAppointments,
  getAppointmentById,
  getEligiblePatients,
  getDoctorsWithSchedules,
  createAppointment,
  approveAppointment,
  deleteAppointment,
};

const services = {
  apiClient,
  accounts,
  exams,
  payments,
  appointments,
};

export default services;


