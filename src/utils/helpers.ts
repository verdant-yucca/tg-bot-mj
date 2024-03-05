import { format } from 'date-fns';

export const handleStr = (str: string) => str.toUpperCase().replace(/\s/g, '');

export const getDateXlsx = (num: number) => {
  const date = new Date('1900-01-01');
  date.setDate(date.getDate() + num - 2);
  return format(date, 'dd.MM.yyyy');
};
