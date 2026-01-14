// MommyStockHub/screens/HomeScreen.tsx

import React, { useMemo } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/features/settings/hooks/useThemeColor";
import { DebtorsPieChart } from "@/features/debtors/components/DebtorsPieChart";
import { TopDebtorsList } from "@/features/debtors/components/TopDebtorsList";
import { LowCategoryList } from "@/features/inventory/components/LowCategoryList";
import { LowStockList } from "@/features/inventory/components/LowStockList";
import { StockByCategoryChart } from "@/features/inventory/components/StockByCategoryChart";
import { SummaryCards } from "@/features/inventory/components/SummaryCards";
import { useInventory } from "@/features/inventory/contexts/InventoryContext";
import { useDebtors } from "@/features/debtors/contexts/DebtorContext";

export default function HomeScreen() {
  const { items } = useInventory();
  const { debtors } = useDebtors();

  // Ensure useThemeColor is called consistently at the top level
  const backgroundColor = useThemeColor(
    { light: undefined, dark: undefined },
    "background"
  );
  const color = useThemeColor({ light: undefined, dark: undefined }, "text");

  // Precompute colors for PieChart at the top level
  // Cor base do tema (chamada única de Hook)
  const basePieColor = useThemeColor(
    { light: "rgba(245, 166, 137, 1)", dark: "rgba(245, 166, 137, 1)" },
    "text"
  );
  const legendFontColor = useThemeColor(
    { light: "#000", dark: "#FFF" },
    "text"
  );

  // Gera o array só com lógica normal (useMemo opcional, sem Hooks dentro)
  const pieChartColors = useMemo(
    () =>
      debtors.map((_, index) => ({
        color: `rgba(245, 166, 137, ${1 - index * 0.2})`, // ajusta a opacidade
        legendFontColor,
      })),
    [debtors, legendFontColor]
  );

  const totalProducts = items.length;

  const totalCategories = useMemo(() => {
    const categories = new Set(
      items.map((item) => item.category || "Sem Categoria")
    );
    return categories.size;
  }, [items]);

  const lowStock = useMemo(
    () => items.filter((item) => item.quantity <= 15),
    [items]
  );

  const topDebtors = useMemo(() => {
    return debtors
      .filter((debtor) => debtor.status === "open")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [debtors]);

  const stockByCategory = useMemo(() => {
    const categoryData = items.reduce<Record<string, number>>((acc, item) => {
      const category = item.category || "Sem Categoria";
      acc[category] = (acc[category] || 0) + item.quantity;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
        },
      ],
    };
  }, [items]);

  const debtorsData = useMemo(() => {
    return debtors.map((debtor, index) => ({
      name: debtor.name,
      amount: debtor.amount,
      color: pieChartColors[index]?.color,
      legendFontColor: pieChartColors[index]?.legendFontColor,
      legendFontSize: 12,
    }));
  }, [debtors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "row",
            paddingBottom: 20,
          }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 100, height: 100 }}
          />
          <ThemedText
            style={[styles.title, { flexShrink: 1, textAlign: "left" }]}
          >
            Bem-vindo(a) ao Inventy!
          </ThemedText>
        </View>

        {/* Seção de resumo */}
        <SummaryCards
          totalProducts={totalProducts}
          totalCategories={totalCategories}
          lowStockCount={lowStock.length}
        />
        <LowStockList lowStock={lowStock} />
        <TopDebtorsList topDebtors={topDebtors} />
        <LowCategoryList
          categories={items.reduce((acc, item) => {
            const category = item.category || "Sem Categoria";
            acc[category] = (acc[category] || 0) + item.quantity;
            return acc;
          }, {} as Record<string, number>)}
        />
        <StockByCategoryChart
          stockByCategory={stockByCategory}
          backgroundColor={backgroundColor}
          color={color}
        />
        <DebtorsPieChart debtorsData={debtorsData} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F5A689",
  },
  summaryLabel: {
    fontSize: 14,
  },
  lowStockSection: {
    marginBottom: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 4,
  },
  lowStockContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  lowStockCard: {
    flexBasis: "48%",
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  lowStockName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  lowStockQuantity: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyList: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
  },
  buttonsContainer: {
    marginTop: 24,
  },
  button: {
    backgroundColor: "#F5A689",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  chartContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
});
