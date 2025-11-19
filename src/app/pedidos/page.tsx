import { PedidosPageClient } from "./pedidos-client";
import { OrdersProvider } from "@/contexts/orders-context";

export default function PedidosPage() {
  return (
    <OrdersProvider>
      <PedidosPageClient />
    </OrdersProvider>
  );
}

