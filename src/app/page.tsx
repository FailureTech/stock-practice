import { HomeLayout } from "@/components/home-layout"
import { GET } from "./api/fetchStocks"

interface Stock {
  symbol: string
  name: string
  isin: string
}

async function getStocks(): Promise<Stock[]> {
  try {
    const response = await GET()
    const stocks = await response.json()
    return stocks || []
  } catch (error) {
    return []
  }
}

export default async function Home() {
  const stocks = await getStocks()

  return <HomeLayout stocks={stocks} />
}