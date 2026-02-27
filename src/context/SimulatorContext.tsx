'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { SimulatorAccount, Position, TradeRecord, OrderSide, OrderType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase';

// ── State ──
interface SimulatorState {
    account: SimulatorAccount;
    positions: Position[];
    history: TradeRecord[];
}

const INITIAL_BALANCE = 100000;

const initialState: SimulatorState = {
    account: {
        balance: INITIAL_BALANCE,
        equity: INITIAL_BALANCE,
        margin: 0,
        freeMargin: INITIAL_BALANCE,
        marginLevel: 0,
        totalPnL: 0,
        totalTrades: 0,
        winRate: 0,
    },
    positions: [],
    history: [],
};

// ── Actions ──
type Action =
    | { type: 'OPEN_POSITION'; payload: Omit<Position, 'pnl' | 'pnlPercent' | 'status'> }
    | { type: 'CLOSE_POSITION'; payload: { id: string; closePrice: number; closeTime: number; pnl: number } }
    | { type: 'UPDATE_PRICES'; payload: { symbol: string; price: number }[] }
    | { type: 'MODIFY_POSITION'; payload: { id: string; stopLoss?: number | null; takeProfit?: number | null } }
    | { type: 'SET_INITIAL_STATE'; payload: { positions: Position[]; history: TradeRecord[] } }
    | { type: 'RESET_ACCOUNT' };

function generateId(): string {
    return `pos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function simulatorReducer(state: SimulatorState, action: Action): SimulatorState {
    switch (action.type) {
        case 'OPEN_POSITION': {
            const newPosition: Position = {
                ...action.payload,
                pnl: 0,
                pnlPercent: 0,
                status: 'OPEN',
            };

            const positionValue = newPosition.quantity * newPosition.entryPrice;
            const requiredMargin = positionValue / newPosition.leverage;

            const newMargin = state.account.margin + requiredMargin;
            const newFreeMargin = state.account.balance - newMargin;

            return {
                ...state,
                positions: [...state.positions, newPosition],
                account: {
                    ...state.account,
                    margin: newMargin,
                    freeMargin: newFreeMargin,
                    marginLevel: newMargin > 0 ? (state.account.equity / newMargin) * 100 : 0,
                },
            };
        }

        case 'CLOSE_POSITION': {
            const { id, closePrice, closeTime, pnl } = action.payload;
            const position = state.positions.find(p => p.id === id);
            if (!position) return state;

            const tradeRecord: TradeRecord = {
                ...position,
                currentPrice: closePrice,
                closePrice,
                closeTime,
                pnl,
                pnlPercent: (pnl / (position.entryPrice * position.quantity)) * 100,
                status: 'CLOSED',
                result: pnl >= 0 ? 'WIN' : 'LOSS',
            };

            const updatedHistory = [...state.history, tradeRecord];
            const wins = updatedHistory.filter(t => t.result === 'WIN').length;
            const totalPnL = updatedHistory.reduce((sum, t) => sum + t.pnl, 0);
            const newBalance = INITIAL_BALANCE + totalPnL;

            const positionValue = position.quantity * position.entryPrice;
            const releasedMargin = positionValue / position.leverage;

            return {
                ...state,
                positions: state.positions.filter(p => p.id !== id),
                history: updatedHistory,
                account: {
                    ...state.account,
                    balance: newBalance,
                    equity: newBalance,
                    margin: Math.max(0, state.account.margin - releasedMargin),
                    freeMargin: newBalance - Math.max(0, state.account.margin - releasedMargin),
                    totalPnL,
                    totalTrades: updatedHistory.length,
                    winRate: updatedHistory.length > 0 ? (wins / updatedHistory.length) * 100 : 0,
                },
            };
        }

        case 'UPDATE_PRICES': {
            const priceMap = new Map(action.payload.map(p => [p.symbol, p.price]));
            let totalUnrealizedPnL = 0;

            const updatedPositions = state.positions.map(pos => {
                const currentPrice = priceMap.get(pos.symbol) ?? pos.currentPrice;
                const pnl = pos.side === 'BUY'
                    ? (currentPrice - pos.entryPrice) * pos.quantity * pos.leverage
                    : (pos.entryPrice - currentPrice) * pos.quantity * pos.leverage;
                const pnlPercent = (pnl / (pos.entryPrice * pos.quantity)) * 100;
                totalUnrealizedPnL += pnl;
                return { ...pos, currentPrice, pnl, pnlPercent };
            });

            const newEquity = state.account.balance + totalUnrealizedPnL;

            return {
                ...state,
                positions: updatedPositions,
                account: {
                    ...state.account,
                    equity: newEquity,
                    freeMargin: newEquity - state.account.margin,
                    marginLevel: state.account.margin > 0 ? (newEquity / state.account.margin) * 100 : 0,
                },
            };
        }

        case 'MODIFY_POSITION': {
            return {
                ...state,
                positions: state.positions.map(pos =>
                    pos.id === action.payload.id
                        ? {
                            ...pos,
                            ...(action.payload.stopLoss !== undefined && { stopLoss: action.payload.stopLoss }),
                            ...(action.payload.takeProfit !== undefined && { takeProfit: action.payload.takeProfit }),
                        }
                        : pos
                ),
            };
        }

        case 'SET_INITIAL_STATE': {
            const { positions, history } = action.payload;
            let totalPnL = 0;
            let wins = 0;
            let activeMargin = 0;

            history.forEach(t => {
                totalPnL += t.pnl;
                if (t.result === 'WIN') wins++;
            });

            positions.forEach(p => {
                activeMargin += (p.quantity * p.entryPrice) / p.leverage;
            });

            const currentBalance = INITIAL_BALANCE + totalPnL;
            const newEquity = currentBalance;
            const newFreeMargin = currentBalance - activeMargin;

            return {
                ...state,
                positions,
                history,
                account: {
                    ...state.account,
                    balance: currentBalance,
                    equity: newEquity,
                    margin: activeMargin,
                    freeMargin: newFreeMargin,
                    marginLevel: activeMargin > 0 ? (newEquity / activeMargin) * 100 : 0,
                    totalPnL,
                    totalTrades: history.length,
                    winRate: history.length > 0 ? (wins / history.length) * 100 : 0,
                }
            };
        }

        case 'RESET_ACCOUNT':
            return initialState;

        default:
            return state;
    }
}

// ── Context ──
interface SimulatorContextType {
    state: SimulatorState;
    openPosition: (params: {
        symbol: string;
        side: OrderSide;
        orderType: OrderType;
        entryPrice: number;
        quantity: number;
        leverage: number;
        stopLoss: number | null;
        takeProfit: number | null;
    }) => Promise<void>;
    closePosition: (id: string, closePrice: number) => Promise<void>;
    updatePrices: (prices: { symbol: string; price: number }[]) => void;
    modifyPosition: (id: string, stopLoss?: number | null, takeProfit?: number | null) => Promise<void>;
    resetAccount: () => void;
}

const SimulatorContext = createContext<SimulatorContextType | null>(null);

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(simulatorReducer, initialState);
    const { user } = useAuth();
    const supabase = createClient();

    // Load initial data
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', user.id)
                .order('open_time', { ascending: true });

            if (error || !data) {
                console.error("Error loading trades:", error);
                return;
            }

            const activePositions: Position[] = [];
            const history: TradeRecord[] = [];

            data.forEach(row => {
                const base = {
                    id: row.id,
                    symbol: row.symbol,
                    side: row.side as OrderSide,
                    orderType: 'MARKET' as OrderType,
                    entryPrice: row.entry_price,
                    currentPrice: row.status === 'OPEN' ? row.entry_price : (row.close_price || row.entry_price),
                    quantity: row.quantity,
                    leverage: row.leverage,
                    stopLoss: row.stop_loss,
                    takeProfit: row.take_profit,
                    pnl: row.pnl || 0,
                    pnlPercent: row.pnl ? (row.pnl / (row.entry_price * row.quantity)) * 100 : 0,
                    openTime: new Date(row.open_time).getTime(),
                    status: row.status as any,
                };

                if (row.status === 'OPEN') {
                    activePositions.push(base);
                } else if (row.status === 'CLOSED') {
                    history.push({
                        ...base,
                        closePrice: row.close_price!,
                        closeTime: new Date(row.close_time!).getTime(),
                        result: (row.pnl || 0) >= 0 ? 'WIN' : 'LOSS',
                    });
                }
            });

            dispatch({ type: 'SET_INITIAL_STATE', payload: { positions: activePositions, history } });
        };

        loadData();
    }, [user, supabase]);

    const openPosition = useCallback(async (params: {
        symbol: string;
        side: OrderSide;
        orderType: OrderType;
        entryPrice: number;
        quantity: number;
        leverage: number;
        stopLoss: number | null;
        takeProfit: number | null;
    }) => {
        if (!user) return;

        const { data, error } = await supabase.from('trades').insert({
            user_id: user.id,
            symbol: params.symbol,
            side: params.side,
            quantity: params.quantity,
            entry_price: params.entryPrice,
            leverage: params.leverage,
            stop_loss: params.stopLoss,
            take_profit: params.takeProfit,
            status: 'OPEN'
        }).select().single();

        if (error || !data) {
            console.error("Failed to open position:", error);
            return;
        }

        dispatch({
            type: 'OPEN_POSITION',
            payload: {
                ...params,
                id: data.id,
                currentPrice: params.entryPrice,
                openTime: new Date(data.open_time).getTime(),
            },
        });
    }, [user, supabase]);

    const closePosition = useCallback(async (id: string, closePrice: number) => {
        if (!user) return;

        const position = state.positions.find(p => p.id === id);
        if (!position) return;

        const pnl = position.side === 'BUY'
            ? (closePrice - position.entryPrice) * position.quantity * position.leverage
            : (position.entryPrice - closePrice) * position.quantity * position.leverage;

        const closeTime = Date.now();

        const { error } = await supabase.from('trades').update({
            close_price: closePrice,
            close_time: new Date(closeTime).toISOString(),
            pnl: pnl,
            status: 'CLOSED'
        }).eq('id', id).eq('user_id', user.id);

        if (error) {
            console.error("Failed to close position:", error);
            return;
        }

        dispatch({ type: 'CLOSE_POSITION', payload: { id, closePrice, closeTime, pnl } });
    }, [user, supabase, state.positions]);

    const updatePrices = useCallback((prices: { symbol: string; price: number }[]) => {
        dispatch({ type: 'UPDATE_PRICES', payload: prices });
    }, []);

    const modifyPosition = useCallback(async (id: string, stopLoss?: number | null, takeProfit?: number | null) => {
        if (!user) return;

        const { error } = await supabase.from('trades').update({
            stop_loss: stopLoss,
            take_profit: takeProfit
        }).eq('id', id).eq('user_id', user.id);

        if (error) {
            console.error("Failed to update position:", error);
            return;
        }

        dispatch({ type: 'MODIFY_POSITION', payload: { id, stopLoss, takeProfit } });
    }, [user, supabase]);

    const resetAccount = useCallback(() => {
        dispatch({ type: 'RESET_ACCOUNT' });
    }, []);

    return (
        <SimulatorContext.Provider value={{ state, openPosition, closePosition, updatePrices, modifyPosition, resetAccount }}>
            {children}
        </SimulatorContext.Provider>
    );
}

export function useSimulator() {
    const ctx = useContext(SimulatorContext);
    if (!ctx) throw new Error('useSimulator must be used within SimulatorProvider');
    return ctx;
}
