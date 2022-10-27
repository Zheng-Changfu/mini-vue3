import { ref } from "@vue/reactivity";
import { isFunction } from "@vue/shared";
import { h } from "./h";
import { Fragment, Text } from "./vnode";

export function defineAsyncComponent(source) {
  if (isFunction(source)) {
    source = { loader: source };
  }

  const {
    loader,
    loadingComponent,
    errorComponent,
    timeout,
    delay = 200,
    onError: userOnError,
  } = source;
  let resolveComponent;
  let reties = 0; // 重试次数

  const retry = () => {
    reties++;
    return load();
  };

  const load = () => {
    return loader()
      .then((comp) => {
        resolveComponent = comp;
        return comp;
      })
      .catch((err) => {
        if (userOnError) {
          return new Promise((resolve, reject) => {
            const userRetry = () => resolve(retry());
            const userFail = () => reject(err);
            userOnError(err, userRetry, userFail, reties + 1);
          });
        }
        throw err;
      });
  };

  return {
    setup() {
      const loaded = ref(false);
      const error = ref();
      const delayed = ref(!!delay);

      if (delay) {
        setTimeout(() => {
          delayed.value = false;
        }, delay);
      }

      if (timeout) {
        setTimeout(() => {
          const err = new Error(`Async component time out after ${timeout}ms`);
          error.value = err;
        }, timeout);
      }

      load()
        .then(() => {
          loaded.value = true;
        })
        .catch((err) => {
          error.value = err;
        });

      return () => {
        if (loaded.value && resolveComponent) {
          return h(resolveComponent);
        } else if (error.value && errorComponent) {
          return h(errorComponent);
        } else if (!delayed.value && loadingComponent) {
          return h(loadingComponent);
        } else {
          return h(Fragment, []);
        }
      };
    },
  };
}
