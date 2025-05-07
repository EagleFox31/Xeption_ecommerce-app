import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Smartphone } from "lucide-react";
import {
  processMobilePayment,
  generateTransactionId,
} from "@/services/paymentService";

interface MobileMoneyPaymentProps {
  onPaymentComplete: (
    success: boolean,
    transactionId: string,
    message: string,
  ) => void;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export default function MobileMoneyPayment({
  onPaymentComplete,
  amount,
  customerName,
  customerPhone,
  customerEmail = "customer@example.com",
}: MobileMoneyPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState(customerPhone || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError("Please enter a valid phone number");
      return;
    }

    setError(null);
    setIsProcessing(true);

    const transactionId = generateTransactionId();

    try {
      const paymentResult = await processMobilePayment({
        amount,
        currency: "XAF",
        transactionId,
        customerName,
        customerEmail,
        customerPhone: phoneNumber,
        paymentMethod: "MOBILE_MONEY",
        description: `Payment for order from ${customerName}`,
      });

      if (
        paymentResult.status === "success" ||
        paymentResult.status === "pending"
      ) {
        onPaymentComplete(true, transactionId, paymentResult.message);
      } else {
        setError(paymentResult.message);
        onPaymentComplete(false, transactionId, paymentResult.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment processing failed";
      setError(errorMessage);
      onPaymentComplete(false, transactionId, errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Mobile Money Number</Label>
        <Input
          id="phone"
          placeholder="e.g. 677123456"
          className="bg-gray-800 border-gray-700 text-white"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={isProcessing}
        />
        <p className="text-xs text-gray-400">
          Enter your MTN or Orange Money number
        </p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <div className="pt-2">
        <Button
          onClick={handlePayment}
          className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Smartphone className="mr-2 h-4 w-4" />
              Pay with Mobile Money
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
