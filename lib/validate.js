import { z } from "zod";

export const parse = (schema, input) => {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, errors: z.flattenError(result.error).fieldErrors };
};

export const fail = (message, field = "root") => ({ ok: false, errors: { [field]: [message] } });
