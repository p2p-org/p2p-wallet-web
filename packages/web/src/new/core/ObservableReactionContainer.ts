import { pullAt } from 'lodash';
import type { IReactionDisposer, IReactionOptions, IReactionPublic } from 'mobx';
import { reaction, runInAction } from 'mobx';

import { LifeCycleObject } from './LifeCycleObject';

/**
 * Object which helps manage reacting to Observable reactions, should be the base class for items that deal with Mobx
 * reactions and autorun code.
 *
 * This is primarily to reduce memory leaks by having Mobx object reaction code keeping an object alive after is should
 * be removed.
 *
 * An example:
 *  View Model Observer which uses a reaction then forgets to call the disposer
 *
 *  export class WalletViewModel {
 *      const { connected, getBalances } = useDependency<WalletModel>(WalletModel);
 *
 *      onInitialize() {
 *       // HERE IS THE BUG
 *          reaction(
 *            ()=>connected,
 *            ()=> {
 *                if(connected) getBalances();
 *            })
 *      }
 *  }
 *
 *  In the above code, even after the WalletViewModel is no longer used by the React View, Mobx will hold a pointer to
 *  it via the reaction() method call.  The JavaScript GC will be able to trace, through Mobx, to this object and will
 *  not GC it.  Also, anytime wallet changes, this object will execute the effect code and might cause all kinds of
 *  issues down the road.
 *
 *  This object resolves this by keeping track of IReactionDisposers and then making sure the are executed, which
 *  frees up the reference in Mobx.
 */
export abstract class ObservableReactionContainer extends LifeCycleObject {
  protected reactions: Array<IReactionDisposer>;

  constructor() {
    super();
    this.reactions = [];
  }

  protected onEnd() {
    this.removeAllReactions();
    this.afterReactionsRemoved();
  }

  protected abstract afterReactionsRemoved(): void;

  // this returns an index that can be used to clear a reaction later
  // via the clearReaction function.
  addReaction(reaction: IReactionDisposer): number {
    return this.reactions.push(reaction) - 1;
  }

  removeReaction(idx: number): void {
    if (idx > -1 && idx < this.reactions.length) {
      const disposer = this.reactions[idx];
      disposer && disposer();
      pullAt(this.reactions, idx);
    }
  }

  removeAllReactions(): void {
    for (const reactionDisposer of this.reactions) {
      reactionDisposer();
    }
    this.reactions = [];
  }

  get reactionsCount(): number {
    return this.reactions.length;
  }
}

/**
 * Some helper functions for dealing with Mobx
 */
export function delayedAction(expression: () => void, delayInMs: number): void {
  setTimeout(() => {
    runInAction(() => {
      expression();
    });
  }, delayInMs);
}

export async function awaitReaction<T>(
  expression: (r: IReactionPublic) => T,
  effect: (arg: T, prev: T, r: IReactionPublic) => void,
  opts: IReactionOptions<T, false> | undefined = {},
): Promise<T> {
  return new Promise((resolve) => {
    const disposer = reaction(
      expression,
      (arg, prev, r) => {
        effect(arg, prev, r);
        disposer();
        resolve(arg);
      },
      opts,
    );
  });
}
