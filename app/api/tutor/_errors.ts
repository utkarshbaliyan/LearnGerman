export class ProviderRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
