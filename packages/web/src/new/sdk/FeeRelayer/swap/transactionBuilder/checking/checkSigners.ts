import type { BuildContext } from 'new/sdk/FeeRelayer';

export function checkSigners(context: BuildContext): void {
  // context.env.signers.push(context.config.userAccount) // can't do it on web
  if (context.env.sourceWSOLNewAccount) {
    context.env.signers.push(context.env.sourceWSOLNewAccount);
  }
  if (context.env.destinationNewAccount) {
    context.env.signers.push(context.env.destinationNewAccount);
  }
}
