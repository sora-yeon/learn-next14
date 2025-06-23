"use server";

import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format"
  );
const tokenSchema = z.coerce.number().min(100000).max(999999);

export interface ActionState {
  token: boolean;
}

export async function smsLogin(prevState: ActionState, formData: FormData) {
  const data = {
    phone: formData.get("phone"),
    token: formData.get("token"),
  };

  if (!prevState.token) {
    // action을 처음 호출. 유저가 전화번호만 입력한 경우
    const result = phoneSchema.safeParse(data.phone);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      return {
        token: true,
      };
    }
  } else {
    // 유저가 토큰을 검증 요청한 경우
    const result = tokenSchema.safeParse(data.token);
    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
        // 재 검증 유도
      };
    } else {
      redirect("/");
    }
  }
}
