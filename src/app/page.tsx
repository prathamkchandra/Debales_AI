import { redirect } from "next/navigation";

export default function Home() {
  redirect("/projects/acme-retail/chat/conv-sales");
}
