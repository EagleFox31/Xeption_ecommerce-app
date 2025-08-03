import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocationContext } from "@/context/LocationContext";
import {
  Check,
  CreditCard,
  MapPin,
  Truck,
  AlertCircle,
  Loader2,
  Smartphone,
  Banknote,
} from "lucide-react";
import {
  processMobilePayment,
  verifyPayment,
  generateTransactionId,
} from "@/services/paymentService";
import { useCart } from "@/hooks/useCart";
import { useOrder } from "@/hooks/useOrder";
import { useAuth } from "@/hooks/useAuth";
import { OrderRequest } from "@/services/orderApiService";

interface CheckoutProps {
  cartItems?: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
}

interface OrderData {
  orderId: string;
  items: any[];
  subtotal: number;
  tax: number;
  deliveryCost: number;
  total: number;
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus?: "pending" | "completed" | "failed";
  transactionId?: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  date: string;
}

// Form schemas
const deliveryFormSchema = z.object({
  deliveryMethod: z.enum(["standard", "express", "pickup"]),
  name: z.string().min(2, { message: "Name is required" }),
  address: z
    .string()
    .min(5, { message: "Address is required" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  phone: z.string().min(8, { message: "Valid phone number is required" }),
});

const paymentFormSchema = z.object({
  paymentMethod: z.enum(["card", "mobile", "cash"]),
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, { message: "Card number must be 16 digits" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  cardExpiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, { message: "Expiry date must be in MM/YY format" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  cardCvv: z
    .string()
    .regex(/^\d{3}$/, { message: "CVV must be 3 digits" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  mobileNumber: z
    .string()
    .min(8, { message: "Valid mobile number is required" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>;
type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function CheckoutPage({
  cartItems: propCartItems,
}: CheckoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, isLoading: isCartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { checkout, isCheckingOut, checkoutError } = useOrder();
  
  const [currentStep, setCurrentStep] = useState<
    "delivery" | "payment" | "confirmation"
  >("delivery");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error" | "pending"
  >("idle");
  const [transactionId, setTransactionId] = useState<string>("");

  // Initialize delivery form
  const deliveryForm = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      deliveryMethod: "standard",
      name: "",
      address: "",
      phone: "",
    },
  });

  // Initialize payment form
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: "card",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      mobileNumber: "",
    },
  });

  // Update payment method when it changes in the form
  const watchPaymentMethod = paymentForm.watch("paymentMethod");
  useEffect(() => {
    setSelectedPaymentMethod(watchPaymentMethod);
  }, [watchPaymentMethod]);

  // Get cart items from cart hook or fallback to props/location state
  const locationCartItems = location.state?.cartItems;
  const cartItems = cart?.items || propCartItems || locationCartItems || [];

  const { userLocation, calculateDeliveryCost, calculateTax } =
    useContext(LocationContext);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryCost = calculateDeliveryCost(subtotal);
  const tax = calculateTax(subtotal);
  const total = subtotal + deliveryCost + tax;

  // Generate a unique order ID
  const generateOrderId = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `XN-${timestamp}-${random}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
    }).format(price);
  };

  // Store order data in localStorage
  const storeOrder = (order: OrderData) => {
    try {
      // Get existing orders or initialize empty array
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(order);
      localStorage.setItem("orders", JSON.stringify(existingOrders));
      setOrderSuccess(true);
      return true;
    } catch (error) {
      console.error("Error storing order:", error);
      setOrderError(
        "Failed to save your order. Please try again or contact support.",
      );
      return false;
    }
  };

  const handleDeliverySubmit = (data: DeliveryFormValues) => {
    // Proceed to payment step
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = async (data: PaymentFormValues) => {
    // Create payment details based on the selected method
    const paymentDetails: any = {};
    
    if (data.paymentMethod === "card" && data.cardNumber) {
      paymentDetails.cardNumber = data.cardNumber;
      paymentDetails.cardExpiry = data.cardExpiry;
      paymentDetails.cardCvv = data.cardCvv;
    } else if (data.paymentMethod === "mobile" && data.mobileNumber) {
      paymentDetails.mobileNumber = data.mobileNumber;
    }

    // Generate transaction ID for payment tracking
    const txnId = generateTransactionId();
    setTransactionId(txnId);

    // Create delivery address object
    const deliveryData = deliveryForm.getValues();
    const deliveryAddress = {
      name: deliveryData.name,
      address: deliveryData.deliveryMethod === "pickup" ? "Store Pickup" : deliveryData.address || "",
      city: userLocation || "Douala",
      state: "",
      country: "Cameroon",
      postalCode: "",
      phone: deliveryData.phone,
    };

    // Create checkout request
    const checkoutData: OrderRequest = {
      cartId: cart?.id || "",
      deliveryAddress: deliveryAddress,
      deliveryMethod: {
        type: deliveryData.deliveryMethod as any,
        cost: deliveryCost,
        estimatedDeliveryDays: deliveryData.deliveryMethod === "express" ? "1-2" : "3-5",
      },
      paymentMethod: {
        type: data.paymentMethod as any,
        details: paymentDetails,
      },
      transactionId: txnId,
    };

    // For mobile money payments, process through payment gateway first
    if (data.paymentMethod === "mobile") {
      setPaymentProcessing(true);
      setPaymentStatus("processing");

      try {
        const paymentResult = await processMobilePayment({
          amount: total,
          currency: "XAF",
          transactionId: txnId,
          customerName: deliveryData.name,
          customerEmail: user?.email || "guest@example.com",
          customerPhone: data.mobileNumber || deliveryData.phone,
          paymentMethod: "MOBILE_MONEY",
          description: `Payment for order from Xeption`,
        });

        if (paymentResult.status === "success" || paymentResult.status === "pending") {
          // If payment was initiated successfully, proceed with checkout
          setPaymentStatus(paymentResult.status);
          checkout(checkoutData, {
            onSuccess: (order) => {
              // Create OrderData object for the UI
              const newOrderData: OrderData = {
                orderId: order.id,
                items: cartItems,
                subtotal: subtotal,
                tax: tax,
                deliveryCost: deliveryCost,
                total: total,
                deliveryMethod: deliveryData.deliveryMethod,
                paymentMethod: data.paymentMethod,
                paymentStatus: paymentResult.status === "success" ? "completed" : "pending",
                transactionId: txnId,
                customerDetails: {
                  name: deliveryData.name,
                  email: user?.email || "guest@example.com",
                  phone: deliveryData.phone,
                  address: deliveryData.address || "Store Pickup",
                },
                date: new Date().toISOString(),
              };
              
              setOrderData(newOrderData);
              setOrderSuccess(true);
              setCurrentStep("confirmation");
              setPaymentProcessing(false);
            },
            onError: (error) => {
              setOrderError(error.message || "Failed to create order");
              setPaymentProcessing(false);
              setPaymentStatus("error");
            }
          });
        } else {
          setPaymentStatus("error");
          setOrderError(paymentResult.message);
          setPaymentProcessing(false);
        }
      } catch (error) {
        setPaymentStatus("error");
        setOrderError(
          error instanceof Error ? error.message : "Payment processing failed",
        );
        setPaymentProcessing(false);
      }
    } else {
      // For other payment methods, proceed directly with checkout
      checkout(checkoutData, {
        onSuccess: (order) => {
          // Create OrderData object for the UI
          const newOrderData: OrderData = {
            orderId: order.id,
            items: cartItems,
            subtotal: subtotal,
            tax: tax,
            deliveryCost: deliveryCost,
            total: total,
            deliveryMethod: deliveryData.deliveryMethod,
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentMethod === "cash" ? "pending" : "completed",
            transactionId: txnId,
            customerDetails: {
              name: deliveryData.name,
              email: user?.email || "guest@example.com",
              phone: deliveryData.phone,
              address: deliveryData.address || "Store Pickup",
            },
            date: new Date().toISOString(),
          };
          
          setOrderData(newOrderData);
          setOrderSuccess(true);
          setCurrentStep("confirmation");
        },
        onError: (error) => {
          setOrderError(error.message || "Failed to create order");
        }
      });
    }
  };

  const handleContinue = () => {
    if (currentStep === "confirmation" && orderSuccess) {
      // Order completed successfully, navigate to a thank you page or back to home
      navigate("/");
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gold-500">Checkout</h1>

        {/* Checkout Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep === "delivery" ? "bg-gold-500 text-black" : "bg-gray-800 text-white"}`}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div
              className={`h-1 w-16 ${currentStep === "delivery" ? "bg-gray-700" : "bg-gold-500"}`}
            ></div>
            <div
              className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep === "payment" ? "bg-gold-500 text-black" : currentStep === "confirmation" ? "bg-gold-500 text-black" : "bg-gray-800 text-white"}`}
            >
              <CreditCard className="h-5 w-5" />
            </div>
            <div
              className={`h-1 w-16 ${currentStep === "confirmation" ? "bg-gold-500" : "bg-gray-700"}`}
            ></div>
            <div
              className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep === "confirmation" ? "bg-gold-500 text-black" : "bg-gray-800 text-white"}`}
            >
              <Check className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === "delivery" && (
              <Card className="bg-gray-900 border-gray-800">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-white">
                    Delivery Options
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Select your preferred delivery method and enter your details
                  </p>

                  <Form {...deliveryForm}>
                    <form
                      onSubmit={deliveryForm.handleSubmit(handleDeliverySubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={deliveryForm.control}
                        name="deliveryMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-4"
                              >
                                <div className="flex items-center space-x-2 rounded-lg border border-gray-800 p-4">
                                  <RadioGroupItem
                                    value="standard"
                                    id="standard"
                                  />
                                  <Label
                                    htmlFor="standard"
                                    className="flex-grow"
                                  >
                                    <div className="font-medium text-white">
                                      Standard Delivery
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      3-5 business days
                                    </div>
                                  </Label>
                                  <div className="text-gold-500">
                                    {formatPrice(deliveryCost)}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border border-gray-800 p-4">
                                  <RadioGroupItem
                                    value="express"
                                    id="express"
                                  />
                                  <Label
                                    htmlFor="express"
                                    className="flex-grow"
                                  >
                                    <div className="font-medium text-white">
                                      Express Delivery
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      1-2 business days
                                    </div>
                                  </Label>
                                  <div className="text-gold-500">
                                    {formatPrice(deliveryCost * 2)}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border border-gray-800 p-4">
                                  <RadioGroupItem value="pickup" id="pickup" />
                                  <Label htmlFor="pickup" className="flex-grow">
                                    <div className="font-medium text-white">
                                      Store Pickup
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      Available today
                                    </div>
                                  </Label>
                                  <div className="text-gold-500">Free</div>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={deliveryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      {deliveryForm.watch("deliveryMethod") !== "pickup" && (
                        <FormField
                          control={deliveryForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">
                                Delivery Address
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your delivery address"
                                  {...field}
                                  className="bg-gray-800 border-gray-700 text-white"
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={deliveryForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your phone number"
                                {...field}
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full mt-6 bg-gold-500 hover:bg-gold-600 text-black font-bold"
                      >
                        Continue to Payment
                      </Button>
                    </form>
                  </Form>
                </div>
              </Card>
            )}

            {currentStep === "payment" && (
              <Card className="bg-gray-900 border-gray-800">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-white">
                    Payment Method
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Select your preferred payment method
                  </p>

                  <Form {...paymentForm}>
                    <form
                      onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={paymentForm.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-4"
                              >
                                <div className="flex items-center space-x-2 rounded-lg border border-gray-800 p-4">
                                  <RadioGroupItem value="card" id="card" />
                                  <Label htmlFor="card" className="flex-grow">
                                    <div className="font-medium text-white">
                                      Credit/Debit Card
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      Visa, Mastercard, American Express
                                    </div>
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <img
                                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=visa"
                                      alt="Visa"
                                      className="h-6 w-6"
                                    />
                                    <img
                                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=mastercard"
                                      alt="Mastercard"
                                      className="h-6 w-6"
                                    />
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border border-gray-800 p-4">
                                  <RadioGroupItem value="mobile" id="mobile" />
                                  <Label htmlFor="mobile" className="flex-grow">
                                    <div className="font-medium text-white">
                                      Mobile Money
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      MTN Mobile Money, Orange Money
                                    </div>
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <div className="bg-yellow-500 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                                      MTN
                                    </div>
                                    <div className="bg-orange-500 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                                      OM
                                    </div>
                                    <Smartphone className="h-5 w-5 text-gray-400" />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border border-gray-800 p-4">
                                  <RadioGroupItem value="cash" id="cash" />
                                  <Label htmlFor="cash" className="flex-grow">
                                    <div className="font-medium text-white">
                                      Cash on Delivery
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      Pay when you receive your order
                                    </div>
                                  </Label>
                                  <Banknote className="h-5 w-5 text-gray-400" />
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {selectedPaymentMethod === "card" && (
                        <>
                          <FormField
                            control={paymentForm.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">
                                  Card Number
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="1234 5678 9012 3456"
                                    {...field}
                                    className="bg-gray-800 border-gray-700 text-white"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={paymentForm.control}
                              name="cardExpiry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    Expiry Date
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="MM/YY"
                                      {...field}
                                      className="bg-gray-800 border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={paymentForm.control}
                              name="cardCvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    CVV
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="123"
                                      {...field}
                                      className="bg-gray-800 border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}

                      {selectedPaymentMethod === "mobile" && (
                        <FormField
                          control={paymentForm.control}
                          name="mobileNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">
                                Mobile Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 677123456"
                                  {...field}
                                  className="bg-gray-800 border-gray-700 text-white"
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      )}

                      <Button
                        type="submit"
                        className="w-full mt-6 bg-gold-500 hover:bg-gold-600 text-black font-bold"
                        disabled={isCheckingOut || paymentProcessing}
                      >
                        {isCheckingOut || paymentProcessing ? (
                          <div className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          "Complete Order"
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </Card>
            )}

            {currentStep === "confirmation" && (
              <Card className="bg-gray-900 border-gray-800">
                <div className="p-6 text-center">
                  {paymentProcessing ? (
                    <>
                      <div className="rounded-full h-16 w-16 bg-blue-500 flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-white">
                        Processing Payment
                      </h2>
                      <p className="text-gray-400 mb-6">
                        Please wait while we process your mobile money
                        payment...
                      </p>
                    </>
                  ) : orderSuccess ? (
                    <>
                      <div className="rounded-full h-16 w-16 bg-gold-500 flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-black" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-white">
                        {paymentStatus === "pending"
                          ? "Order Received!"
                          : "Order Confirmed!"}
                      </h2>
                      <p className="text-gray-400 mb-6">
                        Thank you for your purchase. Your order #
                        {orderData?.orderId} has been received.
                        {paymentStatus === "pending" &&
                          orderData?.paymentMethod === "mobile" && (
                            <span className="block mt-2 text-yellow-500">
                              Your mobile money payment is being processed. You
                              will receive a confirmation shortly.
                            </span>
                          )}
                        {orderData?.transactionId && (
                          <span className="block mt-2 text-sm">
                            Transaction ID: {orderData.transactionId}
                          </span>
                        )}
                      </p>

                      <div className="bg-gray-800 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-white mb-2">
                          Order Summary
                        </h3>
                        <div className="space-y-2">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span className="text-gray-400">
                                {item.name} x {item.quantity}
                              </span>
                              <span className="text-white">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-gray-700">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Subtotal</span>
                              <span className="text-white">
                                {formatPrice(subtotal)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Tax</span>
                              <span className="text-white">
                                {formatPrice(tax)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Delivery</span>
                              <span className="text-white">
                                {formatPrice(deliveryCost)}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold mt-2">
                              <span className="text-white">Total</span>
                              <span className="text-gold-500">
                                {formatPrice(total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="bg-gold-500 hover:bg-gold-600 text-black font-bold"
                        onClick={() => navigate("/")}
                      >
                        Continue Shopping
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full h-16 w-16 bg-red-500 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-white">
                        Payment Processing Error
                      </h2>
                      <p className="text-red-400 mb-6">
                        {orderError ||
                          "There was an error processing your payment. Please try again."}
                      </p>
                      <div className="flex space-x-4 justify-center">
                        <Button
                          className="bg-gray-700 hover:bg-gray-600 text-white"
                          onClick={() => setCurrentStep("payment")}
                        >
                          Back to Payment
                        </Button>
                        <Button
                          className="bg-gold-500 hover:bg-gold-600 text-black font-bold"
                          onClick={() => {
                            setOrderError(null);
                            paymentForm.handleSubmit(handlePaymentSubmit)();
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div>
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-white">
                  Order Summary
                </h2>
                {isCartLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Your cart is empty
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-400">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="text-white">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <Separator className="bg-gray-800 my-4" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tax (19.25% VAT)</span>
                      <span className="text-white">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Delivery to {userLocation}
                      </span>
                      <span className="text-white">
                        {formatPrice(deliveryCost)}
                      </span>
                    </div>
                    <Separator className="bg-gray-800 my-4" />
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-gold-500">{formatPrice(total)}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
