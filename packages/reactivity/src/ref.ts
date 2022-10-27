import { trackEffect, triggerEffect } from "./effect";
import { isReactive, toReactive } from "./reactive";

export function ref(val) {
  if (isRef(val)) {
    return val;
  }
  return new RefImpl(val);
}

class RefImpl {
  public __v_isRef = true; // 标识是一个ref
  public _value; // 记录值
  public _deps;
  constructor(public _rawValue) {
    // const state = ref(0) state.value
    this._rawValue = _rawValue; // 0
    this._value = toReactive(_rawValue); // 0
  }
  get value() {
    trackEffect(this._deps || (this._deps = new Set()));
    return this._value;
  }
  set value(val) {
    // val !== this._rawValue
    if (!Object.is(val, this._rawValue)) {
      this._rawValue = val;
      this._value = toReactive(this._rawValue);
      triggerEffect(this._deps);
    }
  }
}

export function isRef(val) {
  return val && val.__v_isRef;
}
export function toRef(target, key, defaultValue?) {
  if (!isReactive(target)) return target;
  return new ObjectRefImpl(target, key, defaultValue);
}

class ObjectRefImpl {
  public __v_isRef = true;
  // const state = reactive({age:19})
  // const ageRef = toRef(state,'age')
  constructor(public source, public key, public defaultValue) {}
  get value() {
    // state.age
    const res = this.source[this.key];
    return res === undefined ? this.defaultValue : res;
  }
  set value(newVal) {
    this.source[this.key] = newVal;
  }
}

export function toRefs(object) {
  let res = {};
  for (const key in object) {
    res[key] = toRef(object, key);
  }
  return res;
}
export function unref(val) {
  return isRef(val) ? val.value : val;
}

export function customRef(factory) {
  return new CustomRefImpl(factory);
}

class CustomRefImpl {
  public __v_isRef = true;
  public _deps;
  public _value;
  public get;
  public set;
  constructor(public factory) {
    const { get, set } = factory(
      () => trackEffect(this._deps || (this._deps = new Set())),
      () => triggerEffect(this._deps)
    );
    this.get = get;
    this.set = set;
  }
  get value() {
    return this.get();
  }
  set value(newVal) {
    this.set(newVal);
  }
}

export function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs)
    ? objectWithRefs
    : new Proxy(objectWithRefs, {
        get(target, key, receiver) {
          return unref(Reflect.get(target, key, receiver));
        },
        set(target, key, value, receiver) {
          const oldValue = target[key]; // ref oldValue.value = value
          if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
          } else {
            return Reflect.set(target, key, value, receiver);
          }
        },
      });
}
