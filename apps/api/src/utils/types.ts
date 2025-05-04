export type QuerySelect<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] // Is the property an array?
    ? QuerySelect<U> | true
    : T[P] extends object | null // Is the property an object?
      ? QuerySelect<T[P]> | true
      : true;
};

export type StrictQuerySelect<T> = {
  [P in keyof T]-?: T[P] extends (infer U)[]
    ? QuerySelect<U> | true
    : T[P] extends object | null
      ? QuerySelect<T[P]> | true
      : true;
};

export type QuerySelection<T, S extends QuerySelect<T>> = {
  // Iterate over only the keys present in the 'select' object 'S'.
  [P in keyof S & keyof T]: S[P] extends true
    ? T[P] // If 'select' has `{ key: true }', the result has the original type `T[P]`.
    : S[P] extends QuerySelect<T[P]> // If 'select' has a nested object...
      ? QuerySelection<T[P], S[P]> // ...then recursively calculate the nested type.
      : T[P] extends (infer U)[] // If it's an array on the original model...
        ? S[P] extends QuerySelect<U> // ...and the select is a nested object for the array item...
          ? QuerySelection<U, S[P]>[] // ...then the result is an array of the recursively calculated type.
          : never
        : never;
};
