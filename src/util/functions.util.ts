/**
 * Performs a distinct and returns an array with a set of values
 * (without duplicated) of the selected column
 * @param source Source array representing a table
 * @param columnIndex Index to get distinct values
 * @returns resulting array with distinct values
 */
export const selectDistinctColumnValues = (
  source: Array<Array<any>>,
  columnIndex: number,
): Array<any> => {
  if (columnIndex < 0) {
    throw new Error('Index must be a non-negative number');
  }
  const allValues = this.selectColumnValues(source, columnIndex);
  return [...new Set(allValues)];
};

/**
 * Returns an array with the column values of the selected column.
 * Analogal to a SQL single-column Select
 * @param sourceArray 2D Array
 * @param columnIndex Column index to be selected
 * @param skipFirst if true, it will skip the first element (frequently a column header)
 * @returns An array with the all the values existing on the specified sourceArray table column
 */
export const selectColumnValues = (
  sourceArray: Array<Array<any>>,
  columnIndex: number,
  skipFirst = false,
): Array<any> => {
  // index must be zero-based
  if (columnIndex < 0) {
    throw new Error(
      `columnIndex must be a non-negative value. Value passed ${columnIndex}`,
    );
  }
  const map = sourceArray.map(value => {
    return value[columnIndex];
  });
  if (skipFirst) {
    map.splice(0, 1);
  }
  return map;
};
