"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColegiosTable } from "@/components/admin/colegios-table";
import { PrendasTable } from "@/components/admin/prendas-table";
import { TallasTable } from "@/components/admin/tallas-table";
import { PreciosTable } from "@/components/admin/precios-table";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { getColegios } from "@/actions/colegios";
import { getPrendas } from "@/actions/prendas";
import { getTallas } from "@/actions/tallas";
import { getPrecios } from "@/actions/precios";
import { Colegio, Prenda, Talla } from "@prisma/client";

type PrecioWithRelations = Awaited<ReturnType<typeof getPrecios>>[0];

export function AdministracionClient() {
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [precios, setPrecios] = useState<PrecioWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [colegiosData, prendasData, tallasData, preciosData] = await Promise.all([
        getColegios(),
        getPrendas(),
        getTallas(),
        getPrecios(),
      ]);
      setColegios(colegiosData);
      setPrendas(prendasData);
      setTallas(tallasData);
      setPrecios(preciosData);

      // Small delay to ensure state updates are rendered
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header currentPage="administracion" />

      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Administración del Catálogo</h2>

        <Tabs defaultValue="colegios" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colegios">Colegios</TabsTrigger>
            <TabsTrigger value="prendas">Prendas</TabsTrigger>
            <TabsTrigger value="tallas">Tallas</TabsTrigger>
            <TabsTrigger value="precios">Precios</TabsTrigger>
          </TabsList>

          <TabsContent value="colegios">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <ColegiosTable colegios={colegios} onRefresh={loadData} />
            )}
          </TabsContent>

          <TabsContent value="prendas">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <PrendasTable prendas={prendas} onRefresh={loadData} />
            )}
          </TabsContent>

          <TabsContent value="tallas">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <TallasTable tallas={tallas} onRefresh={loadData} />
            )}
          </TabsContent>

          <TabsContent value="precios">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <PreciosTable
                precios={precios}
                colegios={colegios}
                prendas={prendas}
                tallas={tallas}
                onRefresh={loadData}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
