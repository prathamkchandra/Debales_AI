import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AccessError } from "@/lib/access";

export function jsonError(error: unknown) {
  if (error instanceof AccessError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request.", issues: error.flatten() },
      { status: 400 },
    );
  }

  console.error(error);

  return NextResponse.json(
    { error: "Unexpected server error." },
    { status: 500 },
  );
}
