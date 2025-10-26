import { useEffect, useState } from "react";

// DonationBox Component
export default function DonationBox({ isTest = true }) {
  const [amount, setAmount] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [thankYouMsg, setThankYouMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Pick keys based on mode
  const razorpayKeyId = isTest
    ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_TEST
    : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_LIVE;

  // Load the Razorpay script dynamically
  useEffect(() => {
    if (!document.querySelector("#razorpay-js")) {
      const script = document.createElement("script");
      script.id = "razorpay-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () =>
        alert("Failed to load Razorpay. Please check your network.");
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  // Donation handler
  const handlePayment = () => {
    if (!razorpayLoaded) return alert("Razorpay not yet ready!");
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 1) {
      alert("Please enter a valid amount (minimum ₹1)");
      return;
    }

    setIsProcessing(true);

    const options = {
      key: razorpayKeyId,
      amount: amt * 100, // in paise
      currency: "INR",
      name: "Retirement Calculator Support",
      description: "Support the ad-free experience ❤️",
      image:
        "https://razorpay.com/favicon.png",
      handler: function (response) {
        setIsProcessing(false);
        setThankYouMsg(
          `Thank you for your support! Payment ID: ${response.razorpay_payment_id}`
        );
      },
      prefill: {
        name: "Supporter",
        email: "supporter@example.com",
      },
      theme: {
        color: "#3182ce",
      },
      modal: {
        ondismiss: () => setIsProcessing(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
        border: "2px solid #e2e8f0",
        maxWidth: "500px",
        margin: "60px auto 80px auto",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "800",
          marginBottom: "12px",
          color: "#2d3748",
        }}
      >
        💖 Support This Calculator
      </h2>
      <p style={{ color: "#4a5568", fontSize: "15px", marginBottom: "20px" }}>
        This Calculator is <strong>ad-free</strong> to keep it clean and
        distraction-free. If you found it helpful, you can support it by
        contributing any amount of your choice.
      </p>

      {isTest && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            backgroundColor: "#f6e05e",
            color: "#2d3748",
            fontWeight: "700",
            marginBottom: "18px",
          }}
        >
          ⚠️ Test Mode Enabled — No real payments will be processed
        </div>
      )}

      <input
        type="number"
        placeholder="Enter amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          width: "70%",
          padding: "12px",
          marginBottom: "18px",
          fontSize: "16px",
          border: "2px solid #cbd5e0",
          borderRadius: "10px",
          outline: "none",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      />
      <br />

      <button
        onClick={handlePayment}
        disabled={!razorpayLoaded || isProcessing}
        style={{
          padding: "14px 30px",
          border: "none",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)",
          color: "#fff",
          fontWeight: "800",
          cursor: isProcessing ? "not-allowed" : "pointer",
          opacity: isProcessing ? 0.8 : 1,
          transition: "0.3s all ease",
          fontSize: "16px",
        }}
      >
        {isProcessing ? "Processing..." : "💰 Pay with Razorpay"}
      </button>

      {thankYouMsg && (
        <p
          style={{
            marginTop: "18px",
            color: "#2f855a",
            fontWeight: "700",
            fontSize: "15px",
          }}
        >
          {thankYouMsg}
        </p>
      )}
    </div>
  );
}
