import { AccountType } from "@/lib/types";
import jwt from "jsonwebtoken";
// Generate JWT
export function generateToken(
  id: string,
  accountType: AccountType = AccountType.FREE
): string {
  return jwt.sign({ id, accountType }, process.env.JWT_SECRET!, {
    expiresIn: "28d",
  });
}
