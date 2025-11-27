"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutGrid, Menu } from "lucide-react";

interface HeaderProps {
  currentPage: "dashboard" | "pedidos" | "administracion";
  onNewPedido?: () => void;
}

export function Header({ currentPage, onNewPedido }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
        <Button
          variant="ghost"
          size="sm"
          className={
            currentPage === "dashboard"
              ? "bg-slate-700 text-white hover:bg-slate-600 hover:text-white w-full justify-start"
              : "border-slate-600 bg-slate-700 text-white hover:bg-slate-600 hover:text-white w-full justify-start"
          }
        >
          Dashboard
        </Button>
      </Link>
      <Link href="/pedidos" onClick={() => setIsOpen(false)}>
        <Button
          variant="ghost"
          size="sm"
          className={
            currentPage === "pedidos"
              ? "bg-slate-700 text-white hover:bg-slate-600 hover:text-white w-full justify-start"
              : "border-slate-600 bg-slate-700 text-white hover:bg-slate-600 hover:text-white w-full justify-start"
          }
        >
          Pedidos
        </Button>
      </Link>
      <Link href="/administracion" onClick={() => setIsOpen(false)}>
        <Button
          variant={currentPage === "administracion" ? "ghost" : "outline"}
          size="sm"
          className={
            currentPage === "administracion"
              ? "bg-slate-700 text-white hover:bg-slate-600 hover:text-white w-full justify-start"
              : "border-slate-600 bg-slate-700 text-white hover:bg-slate-600 hover:text-white w-full justify-start"
          }
        >
          Administración
        </Button>
      </Link>
    </>
  );

  return (
    <header className="bg-slate-800 text-white py-3 px-4 sm:py-4 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
          <h1 className="text-lg sm:text-xl font-semibold">Evaconfecciones</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4">
          <NavLinks />
        </nav>

        {/* Desktop New Pedido Button */}
        {currentPage === "pedidos" && onNewPedido && (
          <Button
            size="sm"
            className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onNewPedido}
          >
            Nuevo Pedido
          </Button>
        )}

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          {currentPage === "pedidos" && onNewPedido && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2"
              onClick={onNewPedido}
            >
              Nuevo
            </Button>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-slate-800 text-white border-slate-700">
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
