export class DuplicateModalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateModalError';
  }
}

// TODO: make commit to web3 with export from index.ts
export class SendTransactionError extends Error {
  logs: string[] | undefined;

  constructor(message: string, logs?: string[]) {
    super(message);

    this.logs = logs;
  }
}

export function parseSendTransactionError(error: SendTransactionError): string[] {
  const errors: string[] = [];
  if (error.logs) {
    error.logs.forEach((log: string) => {
      const regex = /Error: (.*)/gm;
      let m;
      // eslint-disable-next-line no-cond-assign
      while ((m = regex.exec(log)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (m.length > 1) {
          errors.push(m[1]);
        }
      }
    });
  }

  return errors;
}
