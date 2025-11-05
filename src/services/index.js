
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
import {
  getExaminedPatients,
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  sendPrescriptionEmail,
  markRegistrationExamined,
} from './prescription.api';
import {
  getPatientList,
  getPaymentOverview,
  getPayments,
  getRevenueByMonth,
  getRevenueByYear,
  exportRevenueExcel,
} from './revenue.api';

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

export const prescriptions = {
  getExaminedPatients,
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  sendPrescriptionEmail,
  markRegistrationExamined,
};

export const revenue = {
  getPatientList,
  getPaymentOverview,
  getPayments,
  getRevenueByMonth,
  getRevenueByYear,
  exportRevenueExcel,
};

const services = {
  apiClient,
  accounts,
  exams,
  payments,
  appointments,
  prescriptions,
  revenue,
};

export default services;


