export default function PaymentStatusBadge({ status }: { status: string }) {
  let color = "bg-gray-100 text-gray-700";
  if (status === "PAID") color = "bg-green-100 text-green-700";
  else if (status === "PENDING") color = "bg-yellow-100 text-yellow-700";
  else if (status === "FAILED") color = "bg-red-100 text-red-700";
  else if (status === "NOT_REQUIRED") color = "bg-blue-100 text-blue-700";

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}