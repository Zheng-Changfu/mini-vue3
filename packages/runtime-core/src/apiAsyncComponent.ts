import { isFunction } from "@vue/shared";
import { h, ref } from "./index";
import { Fragment } from "./vnode";

export function defineAsyncComponent(source) {
  if (isFunction(source)) {
    source = { loader: source };
  }
  const {
    loader,
    loadingComponent,
    errorComponent,
    delay = 200,
    timeout,
    onError: userOnError,
  } = source;

  return {
    setup() {
      let resolveComp;
      let reties = 0;
      const loaded = ref(false);
      const error = ref(null);
      const delayed = ref(!!delay);

      const retry = () => {
        reties++;
        return load();
      };

      const load = () => {
        return loader()
          .then((comp) => {
            resolveComp = comp;
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

      if (delay) {
        setTimeout(() => {
          delayed.value = false;
        }, delay);
      }

      if (timeout) {
        setTimeout(() => {
          if (!loaded.value && !error.value) {
            const err = new Error(
              `async component time out after ${timeout}ms`
            );
            error.value = err;
          }
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
        if (loaded.value && resolveComp) {
          return h(resolveComp);
        } else if (error.value && errorComponent) {
          return h(errorComponent);
        } else if (!delayed.value && loadingComponent) {
          return h(loadingComponent);
        } else return h(Fragment, []);
      };
    },
  };
}
