function getSequence(arr) {
  let len = arr.length;
  let result = [0];
  let start, end, mid;
  let p = arr.slice();
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    const j = result[result.length - 1];
    if (arr[j] < arrI) {
      p[i] = j;
      result.push(i);
      continue;
    }
    start = 0;
    end = result.length - 1;
    while (start < end) {
      mid = (start + end) >> 1;
      if (arr[result[mid]] < arrI) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }

    if (arrI < arr[result[start]]) {
      if (start > 0) {
        p[i] = result[start - 1];
      }
      result[start] = i;
    }
  }

  let i = result.length;
  let lastIndex = result[i - 1];
  while (i-- > 0) {
    result[i] = lastIndex;
    lastIndex = p[lastIndex];
  }
  return result;
}

console.log(getSequence([3, 1, 2, 4, 7, 5, 6]));
