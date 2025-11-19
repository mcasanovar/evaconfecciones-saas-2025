import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";

interface HeaderProps {
  currentPage: "pedidos" | "administracion";
  onNewPedido?: () => void;
}

export function Header({ currentPage, onNewPedido }: HeaderProps) {
  return (
    <header className="bg-slate-800 text-white py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Evaconfecciones</h1>
        </div>
        <nav className="flex gap-4">
          <Link href="/pedidos">
            <Button
              variant="ghost"
              size="sm"
              className={
                currentPage === "pedidos"
                  ? "bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
                  : "border-slate-600 bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
              }
            >
              Pedidos
            </Button>
          </Link>
          <Link href="/administracion">
            <Button
              variant={currentPage === "administracion" ? "ghost" : "outline"}
              size="sm"
              className={
                currentPage === "administracion"
                  ? "bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
                  : "border-slate-600 bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
              }
            >
              Administración
            </Button>
          </Link>
        </nav>
      </div>
      {currentPage === "pedidos" && onNewPedido && (
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onNewPedido}
        >
          Nuevo Pedido
        </Button>
      )}
    </header>
  );
}
