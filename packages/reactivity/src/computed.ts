import { isFunction } from "@vue/shared";
import { ReactiveEffect, trackEffect, triggerEffect } from "./effect";

export function computed(getterOrOptions) {
  const isOnlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (isOnlyGetter) {
    getter = getterOrOptions;
    setter = () => {};
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedImpl(getter, setter);
}

class ComputedImpl {
  public __v_isRef = true; // 标识是一个 ref
  public _dirty = true; // 此变量控制getter函数是否被缓存
  public _effect;
  public _value;
  public deps;
  constructor(public getter, public setter) {
    this._effect = new ReactiveEffect(getter, {
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerEffect(this.deps);
        }
      },
    });
  }
  get value() {
    trackEffect(this.deps || (this.deps = new Set()));
    if (this._dirty) {
      // 脏的，说明要重新读取getter函数的返回值
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
  set value(val) {
    this.setter(val);
  }
}
