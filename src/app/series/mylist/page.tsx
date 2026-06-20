"use client"
import Link from "next/link";
import CatalogPage from "@/components/catalog/CatalogPage";
import { SEARCH_ROUTE } from "@/constants/app.route.const";

export default function MyList() {

  return (
    <CatalogPage
      page="myList"
      emptyMessage={
        <>To follow a serie click on the heart in the page <Link href={SEARCH_ROUTE} style={{ color: "var(--secondary-background-color)" }}>search series</Link></>
      }
    />
  );
}