interface ClassArgument<C, A extends any[]> {
  new (...args: A): C;
}
export { ClassArgument };
