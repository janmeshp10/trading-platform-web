CREATE TABLE "indicator_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tradingview_username" varchar(100) NOT NULL,
	"plan_name" varchar(50) NOT NULL,
	"amount_inr" integer NOT NULL,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"access_status" varchar(20) DEFAULT 'pending_access' NOT NULL,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "indicator_subscriptions_razorpay_order_id_unique" UNIQUE("razorpay_order_id"),
	CONSTRAINT "indicator_subscriptions_razorpay_payment_id_unique" UNIQUE("razorpay_payment_id")
);
--> statement-breakpoint
ALTER TABLE "indicator_subscriptions" ADD CONSTRAINT "indicator_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;