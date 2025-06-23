"use server";
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from "@/lib/constants";
import { z } from "zod";

const checkUsername = (username: string) => !username.includes("potato");
const checkPasswords = ({
  password,
  comfirm_password,
}: {
  password: string;
  comfirm_password: string;
}) => password === comfirm_password;

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
      .transform((username) => `& ${username} &`)
      .refine(checkUsername, "No potato allowed!"),
    email: z.string().email().toLowerCase(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .regex(
        PASSWORD_REGEX,
        "A password must have lowercase, UPPERCASE, a number and special characters"
      ),
    comfirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .refine(checkPasswords, {
    message: "패스워드가 일치하지 않습니다.",
    path: ["comfirm_password"],
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    comfirm_password: formData.get("comfirm_password"),
  };

  const result = formSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    console.log(result.data);
  }
}
