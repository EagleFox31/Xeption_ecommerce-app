import React from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import OrderDetails from '@/components/orders/OrderDetails';

const OrderDetailsPage = () => {
  return (
    <AccountLayout>
      <OrderDetails />
    </AccountLayout>
  );
};

export default OrderDetailsPage;