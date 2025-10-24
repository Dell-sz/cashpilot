import React from 'react';

function TransactionCard({ transaction }) {
  return (
    <div>
      <h3>{transaction.description}</h3>
      <p>{transaction.amount}</p>
    </div>
  );
}

export default TransactionCard;
