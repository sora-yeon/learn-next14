"use server";
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from "@/lib/constants";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import getSession from "@/lib/session";

const checkUsername = (username: string) => !username.includes("potato");

const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "Username must be string",
      })
      .min(5, "Way too short!!")
      .max(10, "Thar is too looooooong!!")
      .toLowerCase()
      .trim()
      // .transform((username) => `& ${username} &`)
      .refine(checkUsername, "No potato allowed!"),
    email: z.string().email().toLowerCase(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .regex(
        PASSWORD_REGEX,
        "A password must have lowercase, UPPERCASE, a number and special characters"
      ),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This username is already taken",
        path: ["username"],
        fatal: true,
      });
      return z.NEVER; // 다음 refine을 진행하지 않는다.
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This email is already taken",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER; // 다음 refine을 진행하지 않는다.
    }
  })
  .refine(checkPasswords, {
    message: "패스워드가 일치하지 않습니다.",
    path: ["confirm_password"],
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const result = await formSchema.safeParseAsync(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    // 모든 validation을 통과한 객체들을 저장

    // hash password
    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    // save the user to db
    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });

    // log the user in
    const session = await getSession();
    session.id = user.id;
    await session.save();

    redirect("/profile");
  }
}
