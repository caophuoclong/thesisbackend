CREATE TYPE "gender" AS ENUM ('male', 'female');

CREATE TYPE "message_status_type" AS ENUM ('sent', 'received', 'seen');

CREATE TYPE "conversation_role" AS ENUM ('member', 'admin', 'optional');

CREATE TYPE "user_status_type" AS ENUM ('online', 'offline', 'custom');

CREATE TYPE "message_type" AS ENUM (
    'text',
    'audio',
    'video',
    'image',
    'system',
    'sticker'
);

CREATE TYPE "notification_type" AS ENUM ('a');

CREATE TYPE "notification_status" AS ENUM ('sent', 'received', 'seen');

CREATE TYPE "user_log_type" AS ENUM ('add', 'delete', 'update');

CREATE TYPE "conversation_log_type" AS ENUM (
    'add_member',
    'update_info',
    'update_admin',
    'update_avatar',
    'delete_member',
    'block_member'
);

CREATE TYPE "conversation_theme" AS ENUM ('system', 'halloween', 'tet');

CREATE TYPE "conversation_noti_type" AS ENUM (
    'normal',
    'no_noti',
    'h3',
    'h2',
    'h1',
    'm15',
    'custom'
);

CREATE TABLE "user" (
    "id" varchar(255) PRIMARY KEY,
    "email" varchar(255) NOT NULL,
    "email_verified" boolean DEFAULT 'false',
    "first_name" varchar(255) NOT NULL,
    "last_name" varchar(255),
    "username" varchar(255) UNIQUE NOT NULL,
    "created_at" bigint NOT NULL,
    "updated_at" bigint NOT NULL,
    "dob" bigint NOT NULL DEFAULT 0,
    "avatar" text,
    "cover" text,
    "gender" gender
);

CREATE TABLE "user_log" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
    "user_id" varchar(255) NOT NULL,
    "created_at" bigint,
    "action" text,
    "device" varchar(255),
    "type" user_log_type
);

CREATE TABLE "user_status" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
    "status" user_status_type,
    "updated_at" bigint NOT NULL,
    "user_id" varchar(255) NOT NULL
);

CREATE TABLE "conversation" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
    "name" text,
    "description" text,
    "creator" varchar(255) NOT NULL,
    "created_at" bigint NOT NULL,
    "updated_at" bigint NOT NULL
);

CREATE TABLE "conversation_member" (
    "conversation_id" uuid NOT NULL,
    "user_id" varchar(255) NOT NULL,
    "role" conversation_role DEFAULT 'member',
    "theme" conversation_theme DEFAULT 'system',
    "created_at" bigint NOT NULL,
    "updated_at" bigint NOT NULL,
    "notification_type" conversation_noti_type DEFAULT 'normal',
    "notification_custom" varchar(255) DEFAULT null,
    PRIMARY KEY ("conversation_id", "user_id")
);

CREATE TABLE "conversation_blocked" (
    "conversation_id" uuid NOT NULL,
    "user_id" varchar(255) NOT NULL,
    "created_at" bigint,
    "updated_at" bigint,
    PRIMARY KEY ("conversation_id", "user_id")
);

CREATE TABLE "conversation_log" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
    "conversation_id" uuid NOT NULL,
    "type" conversation_log_type,
    "by" varchar(255) NOT NULL,
    "created_at" bigint NOT NULL
);

CREATE TABLE "message" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
    "sender" varchar(255) NOT NULL,
    "destination" uuid NOT NULL,
    "created_at" bigint NOT NULL,
    "updated_at" bigint NOT NULL,
    "type" message_type DEFAULT 'text',
    "content" text
);

CREATE TABLE "message_status" (
    "message_id" uuid,
    "user_id" varchar(255),
    "status" message_status_type,
    "updated_at" bigint NOT NULL,
    PRIMARY KEY ("message_id", "user_id")
);

CREATE TABLE "notifications" (
    "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "content" text,
    "type" notification_type,
    "status" notification_status,
    "created_at" bigint NOT NULL,
    "updated_at" bigint NOT NULL
);

CREATE TABLE "notifications_user" (
    "user_id" varchar(255) NOT NULL,
    "notification_id" uuid NOT NULL,
    PRIMARY KEY ("user_id", "notification_id")
);

ALTER TABLE
    "user_log"
ADD
    FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE
    "user_status"
ADD
    FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE
    "conversation"
ADD
    FOREIGN KEY ("creator") REFERENCES "user" ("id");

ALTER TABLE
    "conversation_member"
ADD
    FOREIGN KEY ("conversation_id") REFERENCES "conversation" ("id");

ALTER TABLE
    "conversation_member"
ADD
    FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE
    "conversation_blocked"
ADD
    FOREIGN KEY ("conversation_id") REFERENCES "conversation" ("id");

ALTER TABLE
    "conversation_blocked"
ADD
    FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE
    "conversation_log"
ADD
    FOREIGN KEY ("conversation_id") REFERENCES "conversation" ("id");

ALTER TABLE
    "conversation_log"
ADD
    FOREIGN KEY ("by") REFERENCES "user" ("id");

ALTER TABLE
    "message"
ADD
    FOREIGN KEY ("sender") REFERENCES "user" ("id");

ALTER TABLE
    "message"
ADD
    FOREIGN KEY ("destination") REFERENCES "conversation" ("id");

ALTER TABLE
    "message_status"
ADD
    FOREIGN KEY ("message_id") REFERENCES "message" ("id");

ALTER TABLE
    "message_status"
ADD
    FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE
    "notifications_user"
ADD
    FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE
    "notifications_user"
ADD
    FOREIGN KEY ("notification_id") REFERENCES "notifications" ("id");