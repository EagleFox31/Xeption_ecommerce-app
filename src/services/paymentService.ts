// Payment service for handling CinetPay integration
import CinetPay from "cinetpay-nodejs";

export interface PaymentResponse {
  status: "success" | "error" | "pending";
  transactionId?: string;
  message: string;
  paymentUrl?: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  description: string;
}

// Initialize CinetPay with environment variables
const siteId = import.meta.env.VITE_CINETPAY_SITE_ID;
const apiKey = import.meta.env.VITE_CINETPAY_API_KEY;
const apiSecret = import.meta.env.VITE_CINETPAY_API_SECRET;

// Function to process mobile money payments using CinetPay
export const processMobilePayment = async (
  paymentData: PaymentRequest,
): Promise<PaymentResponse> => {
  console.log("Processing payment with CinetPay:", paymentData);

  try {
    // Initialize CinetPay client
    const cinetpay = new CinetPay(siteId, apiKey);

    // Prepare payment data for CinetPay
    const paymentParams = {
      transaction_id: paymentData.transactionId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      channels: "MOBILE_MONEY",
      description: paymentData.description,
      customer_name: paymentData.customerName,
      customer_email: paymentData.customerEmail,
      customer_phone_number: paymentData.customerPhone,
      // Use relative URLs for callbacks to work in any environment
      payment_url: window.location.origin + "/payment/callback",
      return_url: window.location.origin + "/payment/return",
      notify_url: window.location.origin + "/payment/notify",
    };

    // Make the payment request to CinetPay
    const paymentResult = await cinetpay.makePayment(paymentParams);

    // Check if payment initialization was successful
    if (paymentResult && paymentResult.code === "201") {
      return {
        status: "pending",
        transactionId: paymentData.transactionId,
        message: "Payment initiated successfully",
        paymentUrl: paymentResult.data?.payment_url,
      };
    } else {
      return {
        status: "error",
        transactionId: paymentData.transactionId,
        message: paymentResult?.message || "Failed to initialize payment",
      };
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Payment processing failed",
    };
  }
};

// Verify payment status with CinetPay
export const verifyPayment = async (
  transactionId: string,
): Promise<PaymentResponse> => {
  console.log("Verifying payment status for transaction:", transactionId);

  try {
    // Initialize CinetPay client
    const cinetpay = new CinetPay(siteId, apiKey);

    // Check payment status with CinetPay
    const paymentStatus = await cinetpay.checkPaymentStatus(transactionId);

    // Process the response
    if (paymentStatus && paymentStatus.code === "00") {
      // Payment successful
      return {
        status: "success",
        transactionId,
        message: "Payment confirmed",
      };
    } else if (paymentStatus && paymentStatus.code === "600") {
      // Payment pending
      return {
        status: "pending",
        transactionId,
        message: "Payment is still being processed",
      };
    } else {
      // Payment failed or other status
      return {
        status: "error",
        transactionId,
        message: paymentStatus?.message || "Payment verification failed",
      };
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Payment verification failed",
    };
  }
};

// Generate a unique transaction ID
export const generateTransactionId = (): string => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `XN-PAY-${timestamp}-${random}`;
};
