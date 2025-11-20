export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  category: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FilterState {
  searchTerm: string;
  toAccount: string;
  category: string;
}

export interface ToAccount {
  value: string;
  label: string;
}

export interface Category {
  value: string;
  label: string;
}
