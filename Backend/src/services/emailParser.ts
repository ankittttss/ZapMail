//A Parser Function to Parse the Raw Email using MailParser Library.

import { simpleParser, ParsedMail, AddressObject } from "mailparser";
import crypto from "crypto";

export interface ParsedEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  category?: string;
}

export const parseMail = async (raw: Buffer): Promise<ParsedEmail> => {
  const parsed: ParsedMail = await simpleParser(raw);

  const fromAddress =
    (parsed.from as AddressObject | undefined)?.value?.[0]?.address || "";

  const toAddress =
    (parsed.to as AddressObject | undefined)?.value?.[0]?.address || "";

  // Generate unique ID for email
  const idStr = `${fromAddress}-${toAddress}-${parsed.subject || ""}-${parsed.date?.toISOString() || new Date().toISOString()}`;
  const id = crypto.createHash("md5").update(idStr).digest("hex");

  return {
    id,
    subject: parsed.subject || "",
    from: fromAddress,
    to: toAddress,
    date: parsed.date || new Date(),
    category: "New",
  };
};
