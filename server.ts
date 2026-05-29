import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Create a Stripe Checkout Session for real Gamepasses (Golden Basket)
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return res.status(400).json({
          error: "STRIPE_SECRET_KEY is missing. Please configure STRIPE_SECRET_KEY in the AI Studio Settings menu (Secrets) to enable real purchases.",
          instructions: "Get your live or test secret key (sk_live_... or sk_test_...) from the Stripe Dashboard, go to your AI Studio project Settings tab, and define a secret named 'STRIPE_SECRET_KEY'. This keeps your payments secure."
        });
      }

      // Initialize Stripe with user's backend key
      const stripe = new Stripe(stripeKey);

      // Determine correct return URL based on hosting env
      const origin = process.env.APP_URL || req.headers.origin || `http://localhost:3000`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Golden Basket (5 Golden Eggs)",
                description: "Instantly adds 5 Golden Eggs (Galactic Tier multipliers) to your active generator. Handled through Stripe's certified portal.",
              },
              unit_amount: 499, // $4.99 USD
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Stripe Session Creation Error:", err);
      res.status(500).json({ error: err.message || "Failed to create Stripe merchant flow." });
    }
  });

  // API 2: Verify paid status of completed checkout to prevent cheating
  app.get("/api/verify-checkout-session", async (req, res) => {
    const { session_id } = req.query;
    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ error: "Missing session_id parameter." });
    }

    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return res.status(400).json({ error: "STRIPE_SECRET_KEY is missing." });
      }

      const stripe = new Stripe(stripeKey);
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status === "paid" || session.status === "complete") {
        return res.json({ verified: true, payment_status: session.payment_status });
      } else {
        return res.json({ verified: false, payment_status: session.payment_status, reason: "Payment not completed or failed." });
      }
    } catch (err: any) {
      console.error("Stripe Session Retrieval Error:", err);
      res.status(500).json({ error: "Stripe verification returned an error. Check if session exists." });
    }
  });

  // Vite middleware setup to serve react client
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched on port ${PORT}`);
  });
}

startServer();
