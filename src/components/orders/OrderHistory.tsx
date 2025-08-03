import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ChevronRight, Package, Calendar, FileText, AlertCircle } from 'lucide-react';
import { useOrder } from '@/hooks/useOrder';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

export default function OrderHistory() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { orders, isLoadingOrders, ordersError, refetchOrders } = useOrder();
  const [activeTab, setActiveTab] = useState('all');

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
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

  // Filter orders based on tab
  const getFilteredOrders = () => {
    if (!orders) return [];
    
    switch (activeTab) {
      case 'pending':
        return orders.filter(order => 
          order.status === 'pending' || 
          order.paymentStatus === 'pending'
        );
      case 'processing':
        return orders.filter(order => 
          order.status === 'processing'
        );
      case 'completed':
        return orders.filter(order => 
          order.status === 'delivered' || 
          order.status === 'shipped'
        );
      case 'cancelled':
        return orders.filter(order => 
          order.status === 'cancelled'
        );
      default:
        return orders;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
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
  const getPaymentStatusColor = (status: string) => {
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

  // Handle order click
  const handleOrderClick = (orderId: string) => {
    navigate(`/account/orders/${orderId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-gray-900 border-gray-800 p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Sign In to View Your Orders</h2>
          <p className="text-gray-400 mb-6">
            Please sign in to view your order history and manage your purchases.
          </p>
          <Button onClick={() => navigate('/login')} className="bg-gold-500 hover:bg-gold-600 text-black font-bold">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gold-500">My Orders</h1>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border-gray-800 mb-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
            All Orders
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
            Pending
          </TabsTrigger>
          <TabsTrigger value="processing" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
            Processing
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
            Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoadingOrders ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
            </div>
          ) : ordersError ? (
            <Card className="bg-gray-900 border-gray-800 p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Error Loading Orders</h2>
              <p className="text-gray-400 mb-4">
                There was a problem loading your orders. Please try again.
              </p>
              <Button onClick={() => refetchOrders()} className="bg-gold-500 hover:bg-gold-600 text-black font-bold">
                Try Again
              </Button>
            </Card>
          ) : getFilteredOrders().length === 0 ? (
            <Card className="bg-gray-900 border-gray-800 p-6 text-center">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No Orders Found</h2>
              <p className="text-gray-400 mb-4">
                {activeTab === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `You don't have any ${activeTab} orders.`}
              </p>
              <Button onClick={() => navigate('/shop')} className="bg-gold-500 hover:bg-gold-600 text-black font-bold">
                Browse Products
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredOrders().map((order) => (
                <Card 
                  key={order.id}
                  className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleOrderClick(order.id)}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          Order #{order.id.substring(0, 8)}
                          <ChevronRight className="h-4 w-4 ml-1 text-gray-400" />
                        </h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-2 sm:mt-0">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator className="bg-gray-800 my-4" />
                    
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="flex justify-between">
                          <span className="text-gray-400">
                            {item.name} x {item.quantity}
                          </span>
                          <span className="text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-gray-500 text-sm">
                          + {order.items.length - 2} more item(s)
                        </div>
                      )}
                    </div>
                    
                    <Separator className="bg-gray-800 my-4" />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-gold-500" />
                        <span className="text-sm text-gray-400">{order.items.length} items</span>
                      </div>
                      <div className="font-bold text-gold-500">
                        {formatPrice(order.total)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}