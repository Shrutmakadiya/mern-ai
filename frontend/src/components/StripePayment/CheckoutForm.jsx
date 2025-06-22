import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import StatusMessage from "../Alert/StatusMessage";
import { createStripePaymentIntentAPI, verifyPaymentAPI } from "@/apis/stripePayment/stripePayment";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutForm = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const plan = params.plan;
  const amount = searchParams.get("amount");

  const [errorMessage, setErrorMessage] = useState(null);

  const createOrderMutation = useMutation({
    mutationFn: createStripePaymentIntentAPI,
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: verifyPaymentAPI,
  });

  const handlePayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setErrorMessage("Razorpay SDK failed to load.");
      return;
    }

    try {
      const orderData = {
        amount, // Backend should multiply by 100 for Razorpay (in paise)
        plan,
      };

      createOrderMutation.mutate(orderData, {
        onSuccess: (orderResponse) => {
          const options = {
            key: "YOUR_RAZORPAY_KEY_ID",
            amount: orderResponse.amount,
            currency: "INR",
            name: "Your Company",
            description: `Payment for ${plan}`,
            order_id: orderResponse.id,
            handler: function (response) {
              verifyPaymentMutation.mutate({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            },
            prefill: {
              name: "John Doe",
              email: "john@example.com",
            },
            theme: {
              color: "#3399cc",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        },
        onError: (error) => {
          setErrorMessage("Failed to create Razorpay order.");
        },
      });
    } catch (err) {
      setErrorMessage("Unexpected error occurred.");
    }
  };

  return (
    <div className="bg-gray-900 h-screen -mt-4 flex justify-center items-center">
      <div className="w-96 mx-auto my-4 p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Complete Payment</h2>
        <p className="mb-6 text-gray-600">Pay ₹{amount} for {plan} plan</p>

        {createOrderMutation.isPending && (
          <StatusMessage type="loading" message="Creating order..." />
        )}
        {verifyPaymentMutation.isPending && (
          <StatusMessage type="loading" message="Verifying payment..." />
        )}
        {verifyPaymentMutation.isSuccess && (
          <StatusMessage type="success" message="Payment Successful!" />
        )}
        {verifyPaymentMutation.isError && (
          <StatusMessage type="error" message="Payment verification failed." />
        )}
        {errorMessage && (
          <div className="text-red-500 mt-4">{errorMessage}</div>
        )}

        <button
          onClick={handlePayment}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Pay with Razorpay
        </button>
      </div>
    </div>
  );
};

export default CheckoutForm;
