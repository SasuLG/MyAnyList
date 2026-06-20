"use client"

import CatalogPage from "@/components/catalog/CatalogPage";
import { SEARCH_ROUTE } from "@/constants/app.route.const";
import Link from "next/link";

export default function WaitList() {
  return (
    <CatalogPage
      page="waitList"
      emptyMessage={
        <>To add a serie on the wait list click on the hourglass in the page <Link href={SEARCH_ROUTE} style={{ color: "var(--secondary-background-color)" }}>search series</Link></>
      }
    />
  );
}