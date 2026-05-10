export type ReadonlyDeep<TValue> = TValue extends (...args: never[]) => unknown
  ? TValue
  : TValue extends ReadonlyArray<infer TItem>
    ? ReadonlyArray<ReadonlyDeep<TItem>>
    : TValue extends object
      ? { readonly [K in keyof TValue]: ReadonlyDeep<TValue[K]> }
      : TValue;
