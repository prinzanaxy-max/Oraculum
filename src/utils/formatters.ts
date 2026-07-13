import { format, differenceInDays } from 'date-fns';

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const calculateFine = (
  dueDate: string,
  returnDate?: string | null,
  finePerDay = 0.5
): number => {
  const end = returnDate ? new Date(returnDate) : new Date();
  const due = new Date(dueDate);

  if (end <= due) return 0;

  const daysLate = differenceInDays(end, due);

  return daysLate * finePerDay;
};
