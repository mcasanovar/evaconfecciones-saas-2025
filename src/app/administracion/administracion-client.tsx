"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

type PrecioWithRelations = Awaited<ReturnType<typeof getPrecios>>["data"][0];

interface PaginationState {
  page: number;
  totalPages: number;
  totalItems: number;
  search: string;
}

export function AdministracionClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current tab and page from URL
  const currentTab = searchParams.get("tab") || "colegios";

  // Data states
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [precios, setPrecios] = useState<PrecioWithRelations[]>([]);

  // Full data for dialogs (not paginated)
  const [allColegios, setAllColegios] = useState<Colegio[]>([]);
  const [allPrendas, setAllPrendas] = useState<Prenda[]>([]);
  const [allTallas, setAllTallas] = useState<Talla[]>([]);

  // Pagination states for each table
  const [colegiosPagination, setColegiosPagination] = useState<PaginationState>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    search: "",
  });
  const [prendasPagination, setPrendasPagination] = useState<PaginationState>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    search: "",
  });
  const [tallasPagination, setTallasPagination] = useState<PaginationState>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    search: "",
  });
  const [preciosPagination, setPreciosPagination] = useState<PaginationState>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    search: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingColegios, setIsLoadingColegios] = useState(false);
  const [isLoadingPrendas, setIsLoadingPrendas] = useState(false);
  const [isLoadingTallas, setIsLoadingTallas] = useState(false);
  const [isLoadingPrecios, setIsLoadingPrecios] = useState(false);

  // Helper to update URL params
  const updateURLParams = useCallback((tab: string, page: number, search?: string) => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    params.set("page", page.toString());
    if (search) {
      params.set("search", search);
    }
    router.push(`/administracion?${params.toString()}`, { scroll: false });
  }, [router]);

  // Helper to update only search query param (without triggering search)
  const updateSearchParam = useCallback((search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    router.replace(`/administracion?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Load colegios with pagination
  const loadColegios = useCallback(async (page: number = 1, search: string = "", updateURL = true) => {
    setIsLoadingColegios(true);
    try {
      const response = await getColegios({ page, pageSize: 20, search });
      setColegios(response.data);
      setColegiosPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        search,
      });
      if (updateURL) {
        updateURLParams("colegios", page, search);
      }
    } catch (error) {
      console.error("Error loading colegios:", error);
    } finally {
      setIsLoadingColegios(false);
    }
  }, [updateURLParams]);

  // Load prendas with pagination
  const loadPrendas = useCallback(async (page: number = 1, search: string = "", updateURL = true) => {
    setIsLoadingPrendas(true);
    try {
      const response = await getPrendas({ page, pageSize: 20, search });
      setPrendas(response.data);
      setPrendasPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        search,
      });
      if (updateURL) {
        updateURLParams("prendas", page, search);
      }
    } catch (error) {
      console.error("Error loading prendas:", error);
    } finally {
      setIsLoadingPrendas(false);
    }
  }, [updateURLParams]);

  // Load tallas with pagination
  const loadTallas = useCallback(async (page: number = 1, search: string = "", updateURL = true) => {
    setIsLoadingTallas(true);
    try {
      const response = await getTallas({ page, pageSize: 20, search });
      setTallas(response.data);
      setTallasPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        search,
      });
      if (updateURL) {
        updateURLParams("tallas", page, search);
      }
    } catch (error) {
      console.error("Error loading tallas:", error);
    } finally {
      setIsLoadingTallas(false);
    }
  }, [updateURLParams]);

  // Load precios with pagination
  const loadPrecios = useCallback(async (page: number = 1, search: string = "", updateURL = true) => {
    setIsLoadingPrecios(true);
    try {
      const response = await getPrecios({ page, pageSize: 20, search });
      setPrecios(response.data);
      setPreciosPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        search,
      });
      if (updateURL) {
        updateURLParams("precios", page, search);
      }
    } catch (error) {
      console.error("Error loading precios:", error);
    } finally {
      setIsLoadingPrecios(false);
    }
  }, [updateURLParams]);

  // Load full data for dialogs (without pagination)
  const loadFullData = useCallback(async () => {
    try {
      const [colegiosResponse, prendasResponse, tallasResponse] = await Promise.all([
        getColegios({ pageSize: 1000 }), // Get all
        getPrendas({ pageSize: 1000 }), // Get all
        getTallas({ pageSize: 1000 }), // Get all
      ]);
      setAllColegios(colegiosResponse.data);
      setAllPrendas(prendasResponse.data);
      setAllTallas(tallasResponse.data);
    } catch (error) {
      console.error("Error loading full data:", error);
    }
  }, []);

  // Load data from URL params on mount and when params change
  // Only listen to tab, page, and search params (NOT q param)
  useEffect(() => {
    const tab = searchParams.get("tab") || "colegios";
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";

    // Load full data for dialogs on first load
    if (isLoading) {
      loadFullData();
    }

    // Load specific tab data based on URL
    switch (tab) {
      case "colegios":
        loadColegios(page, search, false);
        break;
      case "prendas":
        loadPrendas(page, search, false);
        break;
      case "tallas":
        loadTallas(page, search, false);
        break;
      case "precios":
        loadPrecios(page, search, false);
        break;
    }

    if (isLoading) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only re-run when these specific params change (NOT q)
    searchParams.get("tab") || "colegios",
    searchParams.get("page") || "1",
    searchParams.get("search") || "",
  ]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header currentPage="administracion" />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <h2 className="text-2xl font-bold mb-6">Administración del Catálogo</h2>

        <Tabs
          value={currentTab}
          onValueChange={(value) => updateURLParams(value, 1)}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="colegios">Colegios</TabsTrigger>
            <TabsTrigger value="prendas">Prendas</TabsTrigger>
            <TabsTrigger value="tallas">Tallas</TabsTrigger>
            <TabsTrigger value="precios">Precios</TabsTrigger>
          </TabsList>

          <TabsContent value="colegios">
            {isLoading || isLoadingColegios ? (
              <TableSkeleton />
            ) : (
              <ColegiosTable
                colegios={colegios}
                currentPage={colegiosPagination.page}
                totalPages={colegiosPagination.totalPages}
                totalItems={colegiosPagination.totalItems}
                searchQuery={searchParams.get("q") || ""}
                onPageChange={(page) => loadColegios(page, colegiosPagination.search)}
                onSearchQueryChange={(query) => updateSearchParam(query)}
                onSearch={(search) => loadColegios(1, search)}
                onRefresh={() => loadColegios(colegiosPagination.page, colegiosPagination.search)}
              />
            )}
          </TabsContent>

          <TabsContent value="prendas">
            {isLoading || isLoadingPrendas ? (
              <TableSkeleton />
            ) : (
              <PrendasTable
                prendas={prendas}
                currentPage={prendasPagination.page}
                totalPages={prendasPagination.totalPages}
                totalItems={prendasPagination.totalItems}
                searchQuery={searchParams.get("q") || ""}
                onPageChange={(page) => loadPrendas(page, prendasPagination.search)}
                onSearchQueryChange={(query) => updateSearchParam(query)}
                onSearch={(search) => loadPrendas(1, search)}
                onRefresh={() => loadPrendas(prendasPagination.page, prendasPagination.search)}
              />
            )}
          </TabsContent>

          <TabsContent value="tallas">
            {isLoading || isLoadingTallas ? (
              <TableSkeleton />
            ) : (
              <TallasTable
                tallas={tallas}
                currentPage={tallasPagination.page}
                totalPages={tallasPagination.totalPages}
                totalItems={tallasPagination.totalItems}
                searchQuery={searchParams.get("q") || ""}
                onPageChange={(page) => loadTallas(page, tallasPagination.search)}
                onSearchQueryChange={(query) => updateSearchParam(query)}
                onSearch={(search) => loadTallas(1, search)}
                onRefresh={() => loadTallas(tallasPagination.page, tallasPagination.search)}
              />
            )}
          </TabsContent>

          <TabsContent value="precios">
            {isLoading || isLoadingPrecios ? (
              <TableSkeleton />
            ) : (
              <PreciosTable
                precios={precios}
                colegios={allColegios}
                prendas={allPrendas}
                tallas={allTallas}
                currentPage={preciosPagination.page}
                totalPages={preciosPagination.totalPages}
                totalItems={preciosPagination.totalItems}
                searchQuery={searchParams.get("q") || ""}
                onPageChange={(page) => loadPrecios(page, preciosPagination.search)}
                onSearchQueryChange={(query) => updateSearchParam(query)}
                onSearch={(search) => loadPrecios(1, search)}
                onRefresh={() => loadPrecios(preciosPagination.page, preciosPagination.search)}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
