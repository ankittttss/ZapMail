import { ToAccount, Category } from '../types/email';

export const TO_ACCOUNTS: ToAccount[] = [
  { value: 'all', label: 'All Accounts' },
  { value: 'anmolsainiii23@gmail.com', label: 'anmolsainiii23@gmail.com' },
  { value: 'ankitsaini955831@gmail.com', label: 'ankitsaini955831@gmail.com' }
];

export const CATEGORIES: Category[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'Interested', label: 'Interested' },
  { value: 'Meeting Booked', label: 'Meeting Booked' },
  { value: 'Not Interested', label: 'Not Interested' },
  { value: 'Spam', label: 'Spam' },
  { value: 'Out of Office', label: 'Out of Office' },
  { value: 'New', label: 'New' },
];

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];