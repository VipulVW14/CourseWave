alter table "public"."users" drop constraint "users_pkey";
alter table "public"."users"
    add constraint "users_pkey"
    primary key ("username");
