import get from 'lodash.get';

const desc = (a, b, orderBy) => {
  const aValue = get(a, orderBy);
  const bValue = get(b, orderBy);

  if (bValue === undefined || bValue === '') return -1;
  if (aValue === undefined || aValue === '') return 1;

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
};

const asc = (a, b, orderBy) => {
  const aValue = get(a, orderBy);
  const bValue = get(b, orderBy);

  if (bValue === undefined || bValue === '') return -1;
  if (aValue === undefined || aValue === '') return 1;
  return -desc(a, b, orderBy);
};

export const stableSort = (array, cmp) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

export const getSorting = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => asc(a, b, orderBy);
};
