"use server";

interface ActionState {
  errors: string[] | null;
}

export async function handleForm(
  prevState: ActionState | null,
  formData: FormData
) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log(formData.get("email"), formData.get("password"));
  console.log("i run in the server baby!");
  return {
    errors: ["wrong password", "password too short"],
  };
}
