import { getDashboardStats, getRecentPedidos, getTopPrendas, getTopColegios } from "@/actions/dashboard";
import { Header } from "@/components/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { TopPrendasChart } from "@/components/dashboard/top-prendas-chart";
import { TopColegiosChart } from "@/components/dashboard/top-colegios-chart";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  CheckCircle,
  DollarSign,
  AlertCircle
} from "lucide-react";

// Revalidate every 30 seconds to ensure fresh data
export const revalidate = 30;

export default async function DashboardPage() {
  const [stats, recentPedidos, topPrendas, topColegios] = await Promise.all([
    getDashboardStats(),
    getRecentPedidos(5),
    getTopPrendas(),
    getTopColegios(),
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header currentPage="dashboard" />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Resumen general de pedidos y ventas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Pedidos"
            value={stats.totalPedidos}
            icon={ShoppingCart}
            description="Todos los pedidos registrados"
          />

          <StatsCard
            title="Pedidos Ingresados"
            value={stats.pedidosIngresados}
            icon={Package}
            description="Esperando ser procesados"
          />

          <StatsCard
            title="En Proceso"
            value={stats.pedidosEnProceso}
            icon={TrendingUp}
            description="Pedidos en preparación"
          />

          <StatsCard
            title="Entregados"
            value={stats.pedidosEntregados}
            icon={CheckCircle}
            description="Pedidos completados"
          />

          <StatsCard
            title="Total Ventas"
            value={formatCurrency(stats.totalVentas)}
            icon={DollarSign}
            description="Ingresos totales"
          />

          <StatsCard
            title="Saldo Pendiente"
            value={formatCurrency(stats.saldoPendiente)}
            icon={AlertCircle}
            description="Por cobrar"
          />
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <RecentOrders pedidos={recentPedidos} />

          {/* Placeholder for future chart */}
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Pedidos por Estado</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ingresados</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${stats.totalPedidos > 0 ? (stats.pedidosIngresados / stats.totalPedidos) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {stats.pedidosIngresados}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">En Proceso</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${stats.totalPedidos > 0 ? (stats.pedidosEnProceso / stats.totalPedidos) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {stats.pedidosEnProceso}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Entregados</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${stats.totalPedidos > 0 ? (stats.pedidosEntregados / stats.totalPedidos) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {stats.pedidosEntregados}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <TopPrendasChart prendas={topPrendas} />
          <TopColegiosChart colegios={topColegios} />
        </div>
      </main>
    </div>
  );
}
