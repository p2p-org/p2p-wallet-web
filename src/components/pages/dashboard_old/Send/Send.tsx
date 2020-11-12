import React, { FunctionComponent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';

import { transfer } from 'store/actions/solana';
import { RootState } from 'store/types';

const Wrapper = styled.div`
  display: table;
`;

const Row = styled.div`
  display: table-row;
`;

const Column = styled.div`
  display: table-cell;

  &:not(:last-child) {
    padding-right: 24px;
  }
`;

const validateAmount = (value: string, maxValue: number): [string | undefined, string] => {
  if (value.length === 0) {
    return [undefined, ''];
  }

  if (Number.parseInt(value, 10) > maxValue) {
    return ['error', 'Insufficient funds, did you account for fees?'];
  }

  if (/^\d+$/.exec(value)) {
    return ['success', ''];
  }

  return ['error', 'Not a valid number'];
};

const validatePublicKey = (value: string): [string | undefined, string] => {
  if (value.length === 0) {
    return [undefined, ''];
  }

  try {
    // eslint-disable-next-line no-new
    new web3.PublicKey(value);
    return ['success', ''];
  } catch {
    return ['error', 'Invalid Public Key'];
  }
};

export const Send: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [errorAmount, setAmountError] = useState('');
  const [errorRecipient, setRecipientError] = useState('');
  const balance = useSelector((state: RootState) => state.data.blockchain.balance);

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    const [, message] = validateAmount(value, balance);

    setAmount(value);
    setAmountError(message);
  };

  const handleChangePublicKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    const [, message] = validatePublicKey(value);

    setRecipient(value);
    setRecipientError(message);
  };

  const handleSendClick = () => {
    dispatch(transfer(String(recipient), 10));
  };

  return (
    <Wrapper>
      <Row>
        <Column>Amount</Column>
        <Column>Recipient's public key</Column>
      </Row>
      <Row>
        <Column>
          <input placeholder="Enter amount" value={amount} onChange={handleChangeAmount} />
          <div>{errorAmount}</div>
        </Column>
        <Column>
          <input placeholder="Enter publickey" value={recipient} onChange={handleChangePublicKey} />
          <div>{errorRecipient}</div>
        </Column>
      </Row>
      <button
        type="button"
        disabled={Boolean(errorAmount) || Boolean(errorRecipient)}
        onClick={handleSendClick}>
        Send
      </button>
    </Wrapper>
  );
};
