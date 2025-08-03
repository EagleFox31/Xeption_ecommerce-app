import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  Truck, 
  Calendar, 
  CreditCard, 
  MapPin,
  Phone,
  User,
  AlertCircle 
} from 'lucide-react';
import { useOrder } from '@/hooks/useOrder';
import { Order } from '@/services/orderApiService';

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrder, verifyPayment, isVerifyingPayment } = useOrder();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  // Get order details
  const { 
    data: order, 
    isLoading, 
    error, 
    refetch 
  } = getOrder(orderId || '');

  // Format date to a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
    }).format(price);
  };

  // Get status badge color
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-500/10 text-gray-500';
    
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-500';
      case 'delivered':
        return 'bg-green-500/10 text-green-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Get payment status badge color
  const getPaymentStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-500/10 text-gray-500';
    
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Get payment method display
  const getPaymentMethodDisplay = (method?: string) => {
    if (!method) return 'N/A';
    
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'mobile':
        return 'Mobile Money';
      case 'cash':
        return 'Cash on Delivery';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  // Get delivery method display
  const getDeliveryMethodDisplay = (method?: string) => {
    if (!method) return 'N/A';
    
    switch (method) {
      case 'standard':
        return 'Standard Delivery (3-5 days)';
      case 'express':
        return 'Express Delivery (1-2 days)';
      case 'pickup':
        return 'Store Pickup';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  // Handle payment verification
  const handleVerifyPayment = async () => {
    if (!order?.transactionId) return;
    
    setIsVerifying(true);
    setVerificationMessage(null);
    
    try {
      verifyPayment(order.transactionId, {
        onSuccess: (data) => {
          if (data.status === 'completed') {
            setVerificationMessage('Payment has been verified and confirmed.');
            // Refetch order to update status
            refetch();
          } else if (data.status === 'pending') {
            setVerificationMessage('Payment is still being processed. Please check again later.');
          } else {
            setVerificationMessage('Payment verification failed. Please contact support.');
          }
          setIsVerifying(false);
        },
        onError: (error) => {
          setVerificationMessage('Error verifying payment. Please try again later.');
          setIsVerifying(false);
        }
      });
    } catch (error) {
      setVerificationMessage('Error verifying payment. Please try again later.');
      setIsVerifying(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate('/account/orders');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6 text-gray-400 hover:text-white" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>
      
      <h1 className="text-3xl font-bold mb-8 text-gold-500">
        Order Details
        {order && <span className="text-gray-400 ml-2 text-lg">#{order.id.substring(0, 8)}</span>}
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </div>
      ) : error ? (
        <Card className="bg-gray-900 border-gray-800 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Order</h2>
          <p className="text-gray-400 mb-4">
            There was a problem loading the order details. Please try again.
          </p>
          <Button onClick={() => refetch()} className="bg-gold-500 hover:bg-gold-600 text-black font-bold">
            Try Again
          </Button>
        </Card>
      ) : !order ? (
        <Card className="bg-gray-900 border-gray-800 p-6 text-center">
          <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-gray-400 mb-4">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack} className="bg-gold-500 hover:bg-gold-600 text-black font-bold">
            Back to Orders
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Order Status</h2>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Placed on {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2 lg:mt-0">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Status timeline - Future implementation */}
                
                {/* Payment verification button (only for pending mobile payments) */}
                {order.paymentStatus === 'pending' && order.paymentMethod === 'mobile' && order.transactionId && (
                  <div className="mt-4 bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-2">Verify Payment Status</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      Your mobile money payment is still being processed. Click the button below to check its current status.
                    </p>
                    {verificationMessage && (
                      <div className={`p-3 rounded-md mb-3 ${
                        verificationMessage.includes('confirmed') 
                          ? 'bg-green-500/10 text-green-400' 
                          : verificationMessage.includes('processed') 
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-red-500/10 text-red-400'
                      }`}>
                        {verificationMessage}
                      </div>
                    )}
                    <Button 
                      onClick={handleVerifyPayment} 
                      className="bg-gold-500 hover:bg-gold-600 text-black font-bold"
                      disabled={isVerifying || isVerifyingPayment}
                    >
                      {isVerifying || isVerifyingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Payment Status'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Items */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="h-16 w-16 flex-shrink-0 rounded-md bg-gray-800 overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-800">
                            <Package className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-white">{item.name}</h3>
                        <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <p className="text-sm text-gray-400">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Delivery Information */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Delivery Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-white flex items-center mb-2">
                      <Truck className="mr-2 h-4 w-4 text-gold-500" />
                      Delivery Method
                    </h3>
                    <p className="text-gray-400">
                      {getDeliveryMethodDisplay(order.deliveryMethod)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-white flex items-center mb-2">
                      <MapPin className="mr-2 h-4 w-4 text-gold-500" />
                      Delivery Address
                    </h3>
                    {order.deliveryMethod === 'pickup' ? (
                      <p className="text-gray-400">
                        Store Pickup - Xeption Store
                      </p>
                    ) : (
                      <div className="text-gray-400">
                        <p>{order.deliveryAddress?.name}</p>
                        <p>{order.deliveryAddress?.address}</p>
                        <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.country}</p>
                        <p className="flex items-center mt-1">
                          <Phone className="mr-1 h-3 w-3" />
                          {order.deliveryAddress?.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax</span>
                    <span className="text-white">{formatPrice(order.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Fee</span>
                    <span className="text-white">{formatPrice(order.deliveryCost)}</span>
                  </div>
                  <Separator className="bg-gray-800 my-4" />
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-gold-500">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-white flex items-center mb-2">
                      <CreditCard className="mr-2 h-4 w-4 text-gold-500" />
                      Payment Method
                    </h3>
                    <p className="text-gray-400">
                      {getPaymentMethodDisplay(order.paymentMethod)}
                    </p>
                  </div>
                  
                  {order.transactionId && (
                    <div>
                      <h3 className="font-medium text-white mb-1">Transaction ID</h3>
                      <p className="text-gray-400 text-sm break-all">
                        {order.transactionId}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-white flex items-center mb-2">
                      <User className="mr-2 h-4 w-4 text-gold-500" />
                      Billing Contact
                    </h3>
                    <div className="text-gray-400">
                      <p>{order.deliveryAddress?.name}</p>
                      <p className="flex items-center mt-1">
                        <Phone className="mr-1 h-3 w-3" />
                        {order.deliveryAddress?.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                onClick={() => navigate('/support')}
              >
                Need Help?
              </Button>
              <Button
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-black font-bold"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}