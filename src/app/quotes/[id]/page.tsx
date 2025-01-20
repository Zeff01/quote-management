import { use } from "react";
import QuoteDetails from "./QuoteDetails";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function QuotePage({ params }: PageProps) {
  const resolvedParams = use(Promise.resolve(params));
  return <QuoteDetails id={resolvedParams.id} />;
}
