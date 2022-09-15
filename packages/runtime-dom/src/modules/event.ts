export const patchEvent = (el, key, preValue, nextValue) => {
  const invokers = el._vei || (el._vei = {});
  const exitstingInvoker = invokers[key];
  if (exitstingInvoker && nextValue) {
    // update
    invokers.value = nextValue;
  } else {
    if (nextValue) {
      // add
      const invoker = (invokers[key] = createInvoker(nextValue));
      el.addEventListener(key.slice(2).toLowerCase(), invoker);
    } else if (exitstingInvoker) {
      // remove
      el.removeEventListener(key.slice(2).toLowerCase(), exitstingInvoker);
      invokers[key] = undefined;
    }
  }
};

function createInvoker(fn) {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = fn;
  return invoker;
}
