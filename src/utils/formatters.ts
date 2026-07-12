import { format, differenceInDays } from 'date-fns';

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const calculateFine = (dueDate: string, returnDate?: string | null): number => {
  const end = returnDate ? new Date(returnDate) : new Date();
  const due = new Date(dueDate);

  if (end <= due) return 0;

  const daysLate = differenceInDays(end, due);
  const finePerDay = 0.5; // $0.50 per day

  return daysLate * finePerDay;
};
