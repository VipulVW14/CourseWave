CREATE TABLE "public"."courses" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "title" text NOT NULL, "description" text NOT NULL, "imageLink" text NOT NULL, "price" integer NOT NULL, PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;
