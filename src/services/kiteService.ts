import { KiteConnect } from "kiteconnect-ts";
import { config } from "../config/env";
import { State } from "../interfaces/State";
import { KiteOrder } from "../interfaces/Kite";

export class KiteService {
  private kc: KiteConnect;

  constructor() {
    this.kc = new KiteConnect({ api_key: config.kiteApiKey });
  }

  async authenticate(requestToken: string): Promise<string> {
    const session = await this.kc.generateSession(
      requestToken,
      config.kiteApiSecret
    );
    return session.access_token;
  }

  setAccessToken(accessToken: string): void {
    this.kc.setAccessToken(accessToken);
  }

  async getPortfolio(): Promise<State["portfolio"]> {
    const holdings = await this.kc.getHoldings();
    return holdings.map((h: any) => ({
      Stock: h.tradingsymbol,
      Quantity: h.quantity,
      PurchasePrice: h.average_price,
      CurrentPrice: h.last_price,
      MarketValue: h.last_price * h.quantity,
    }));
  }

  async getMarketData(symbols: string[]): Promise<State["marketData"]> {
    const quotes = await this.kc.getQuote(symbols.map((s) => `NSE:${s}`));
    return Object.values(quotes).map((q: any) => ({
      symbol: q.tradingsymbol,
      lastPrice: q.last_price,
      volume: q.volume,
      change: q.net_change,
    }));
  }

  async placeOrder(order: KiteOrder): Promise<string> {
    const transactionType =
      order.type === "buy"
        ? this.kc.TRANSACTION_TYPE_BUY
        : this.kc.TRANSACTION_TYPE_SELL;

    const orderParams = {
      variety: this.kc.VARIETY_REGULAR,
      exchange: this.kc.EXCHANGE_NSE,
      tradingsymbol: order.symbol,
      transaction_type: transactionType,
      quantity: order.quantity,
      order_type: order.price
        ? this.kc.ORDER_TYPE_LIMIT
        : this.kc.ORDER_TYPE_MARKET,
      price: order.price,
      product: this.kc.PRODUCT_CNC,
      validity: this.kc.VALIDITY_DAY,
    };
    const response = await this.kc.placeOrder(orderParams.variety, orderParams);
    return response.order_id;
  }
}
