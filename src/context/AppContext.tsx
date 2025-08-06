import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { AppState, Client, Product, Supplier, WorkOrder, Action} from '../types';
import { GoogleGenAI } from '@google/genai';

const AUTH_TOKEN_KEY = 'dental-lab-token';
const API_BASE_URL = 'https://dental-lab-be.onrender.com/api';

declare const process: any;

// Per instructions, API_KEY is assumed to be in the environment.
const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

const initialState: AppState = {
  clients: [],
  products: [],
  suppliers: [],
  orders: [],
  isOnline: true,
  isInitialized: false,
  showDummyDataModal: false,
  isChatOpen: false,
  isChatLoading: false,
  chatMessages: [],
  isAuthenticated: false,
  user: null,
  token: null,
  authError: null,
};

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(action.payload));
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                authError: null,
            };
        case 'LOGOUT':
            localStorage.removeItem(AUTH_TOKEN_KEY);
            return {
                ...initialState,
                isInitialized: true,
                isAuthenticated: false,
                user: null,
                token: null,
            };
        case 'AUTH_ERROR':
            localStorage.removeItem(AUTH_TOKEN_KEY);
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                authError: action.payload,
            };
        case 'SET_INITIAL_STATE':
            return { ...state, ...action.payload };
        case 'SET_ONLINE_STATUS':
            return { ...state, isOnline: action.payload };
        case 'INITIALIZATION_COMPLETE':
            return { ...state, isInitialized: true };
        case 'ADD_CLIENT':
            return { ...state, clients: [...state.clients, action.payload] };
        case 'UPDATE_CLIENT':
            return { ...state, clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c) };
        case 'DELETE_CLIENT':
            return { ...state, clients: state.clients.filter(c => c.id !== action.payload) };
        case 'ADD_PRODUCT':
            return { ...state, products: [...state.products, action.payload] };
        case 'UPDATE_PRODUCT':
            return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
        case 'DELETE_PRODUCT':
            return { ...state, products: state.products.filter(p => p.id !== action.payload) };
        case 'ADD_SUPPLIER':
            return { ...state, suppliers: [...state.suppliers, action.payload] };
        case 'UPDATE_SUPPLIER':
            return { ...state, suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s) };
        case 'DELETE_SUPPLIER':
            return { ...state, suppliers: state.suppliers.filter(s => s.id !== action.payload) };
        case 'ADD_ORDER':
            return { ...state, orders: [...state.orders, action.payload] };
        case 'UPDATE_ORDER':
            return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o) };
        case 'DELETE_ORDER':
            return { ...state, orders: state.orders.filter(o => o.id !== action.payload) };
        case 'TOGGLE_CHAT':
            return { ...state, isChatOpen: !state.isChatOpen };
        case 'SEND_CHAT_MESSAGE_START':
            return {
                ...state,
                isChatLoading: true,
                chatMessages: [...state.chatMessages, { role: 'user', content: action.payload }]
            };
        case 'SEND_CHAT_MESSAGE_SUCCESS':
            return {
                ...state,
                isChatLoading: false,
                chatMessages: [...state.chatMessages, { role: 'model', content: action.payload }]
            };
        case 'SEND_CHAT_MESSAGE_ERROR':
            return {
                ...state,
                isChatLoading: false,
                chatMessages: [...state.chatMessages, { role: 'model', content: `Error: ${action.payload}` }]
            };
        default:
            return state;
    }
};

interface AppContextType {
    state: AppState;
    login: (credentials: { email: string, password: string}) => Promise<void>;
    logout: () => void;
    addClient: (client: Omit<Client, 'id'>) => Promise<void>;
    updateClient: (client: Client) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
    updateSupplier: (supplier: Supplier) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
    addOrder: (order: Omit<WorkOrder, 'id'>) => Promise<void>;
    updateOrder: (order: WorkOrder) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;
    toggleChat: () => void;
    sendMessageToAI: (message: string) => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

const fetcher = async (url: string, options?: RequestInit, token?: string | null) => {
    const headers = new Headers(options?.headers);
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    const res = await fetch(url, { ...options, headers });
    
    const resBody = await res.json();
    if (!res.ok) {
        const error = new Error(resBody.msg || 'An error occurred while fetching the data.');
        (error as any).info = resBody;
        (error as any).status = res.status;
        throw error;
    }
    return resBody;
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initializeApp = async () => {
        const storedAuth = localStorage.getItem(AUTH_TOKEN_KEY);
        if (storedAuth) {
            const { token, user } = JSON.parse(storedAuth);
            dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
            
            try {
                dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
                console.log("Session restored, fetching data from API...");
                const [clients, products, suppliers, orders] = await Promise.all([
                    fetcher(`${API_BASE_URL}/clients`, {}, token),
                    fetcher(`${API_BASE_URL}/products`, {}, token),
                    fetcher(`${API_BASE_URL}/suppliers`, {}, token),
                    fetcher(`${API_BASE_URL}/orders`, {}, token),
                ]);
                dispatch({ type: 'SET_INITIAL_STATE', payload: { clients, products, suppliers, orders } });
            } catch (error) {
                console.warn("Backend not reachable or session invalid, logging out.");
                dispatch({ type: 'LOGOUT' });
            }
        }
        dispatch({ type: 'INITIALIZATION_COMPLETE' });
    };
    initializeApp();
  }, []);
  
  const login = async (credentials: {email: string, password: string}) => {
    try {
        const data = await fetcher(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        // After successful login, fetch all data
        const [clients, products, suppliers, orders] = await Promise.all([
            fetcher(`${API_BASE_URL}/clients`, {}, data.token),
            fetcher(`${API_BASE_URL}/products`, {}, data.token),
            fetcher(`${API_BASE_URL}/suppliers`, {}, data.token),
            fetcher(`${API_BASE_URL}/orders`, {}, data.token),
        ]);
        dispatch({ type: 'SET_INITIAL_STATE', payload: { clients, products, suppliers, orders } });
    } catch (error: any) {
        dispatch({ type: 'AUTH_ERROR', payload: error.message });
        throw error; // Re-throw to be caught in component
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
  const toggleChat = () => dispatch({ type: 'TOGGLE_CHAT' });

  const sendMessageToAI = async (message: string) => {
    if (!ai) {
        const errorMessage = "La configuración de la API de IA no está disponible.";
        dispatch({ type: 'SEND_CHAT_MESSAGE_ERROR', payload: errorMessage });
        return;
    }
    if (!state.user) return; // Must be logged in
    dispatch({ type: 'SEND_CHAT_MESSAGE_START', payload: message });
    try {
        const { clients, products, suppliers, orders, chatMessages } = state;
        const databaseContent = `
            Clients: ${JSON.stringify(clients, null, 2)}
            Products: ${JSON.stringify(products, null, 2)}
            Suppliers: ${JSON.stringify(suppliers, null, 2)}
            Work Orders: ${JSON.stringify(orders, null, 2)}
        `;

        const systemInstruction = `You are an expert dental laboratory assistant integrated into a lab management application.
        Your two primary functions are:
        1. Answer questions by querying the application's data. I will provide the data as a JSON object. You must use this data to answer questions about clients, orders, products, etc. Be concise and precise.
        2. Act as an expert on general dentistry and dental mechanics topics. Provide knowledgeable and helpful answers on these subjects.
        
        Today's date is ${new Date().toLocaleDateString()}.
        
        Here is the current data from the application:
        ${databaseContent}
        `;
        
        const contents = chatMessages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction }
        });

        dispatch({ type: 'SEND_CHAT_MESSAGE_SUCCESS', payload: response.text ?? '' });

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        const errorMessage = error.message || 'Failed to get a response from the AI.';
        dispatch({ type: 'SEND_CHAT_MESSAGE_ERROR', payload: errorMessage });
    }
  };

  const addClient = async (clientData: Omit<Client, 'id'>) => {
      const newClient = await fetcher(`${API_BASE_URL}/clients`, {
        method: 'POST',
        body: JSON.stringify(clientData),
      }, state.token);
      dispatch({ type: 'ADD_CLIENT', payload: newClient });
  };

  const updateClient = async (clientData: Client) => {
      const updatedClient = await fetcher(`${API_BASE_URL}/clients/${clientData.id}`, {
            method: 'PUT',
            body: JSON.stringify(clientData),
      }, state.token);
      dispatch({ type: 'UPDATE_CLIENT', payload: updatedClient });
  };

  const deleteClient = async (id: string) => {
    await fetcher(`${API_BASE_URL}/clients/${id}`, { method: 'DELETE' }, state.token);
    dispatch({ type: 'DELETE_CLIENT', payload: id });
  };
  
  const addProduct = async (productData: Omit<Product, 'id'>) => {
      const newProduct = await fetcher(`${API_BASE_URL}/products`, {
            method: 'POST',
            body: JSON.stringify(productData),
      }, state.token);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
  };
  
  const updateProduct = async (productData: Product) => {
      const updatedProduct = await fetcher(`${API_BASE_URL}/products/${productData.id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
      }, state.token);
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
  };

  const deleteProduct = async (id: string) => {
    await fetcher(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' }, state.token);
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
      const newSupplier = await fetcher(`${API_BASE_URL}/suppliers`, {
            method: 'POST',
            body: JSON.stringify(supplierData),
      }, state.token);
      dispatch({ type: 'ADD_SUPPLIER', payload: newSupplier });
  };

  const updateSupplier = async (supplierData: Supplier) => {
      const updatedSupplier = await fetcher(`${API_BASE_URL}/suppliers/${supplierData.id}`, {
            method: 'PUT',
            body: JSON.stringify(supplierData),
      }, state.token);
      dispatch({ type: 'UPDATE_SUPPLIER', payload: updatedSupplier });
  };
  
  const deleteSupplier = async (id: string) => {
    await fetcher(`${API_BASE_URL}/suppliers/${id}`, { method: 'DELETE' }, state.token);
    dispatch({ type: 'DELETE_SUPPLIER', payload: id });
  };

  const addOrder = async (orderData: Omit<WorkOrder, 'id'>) => {
      const newOrder = await fetcher(`${API_BASE_URL}/orders`, {
            method: 'POST',
            body: JSON.stringify(orderData),
      }, state.token);
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
  };

  const updateOrder = async (orderData: WorkOrder) => {
      const updatedOrder = await fetcher(`${API_BASE_URL}/orders/${orderData.id}`, {
            method: 'PUT',
            body: JSON.stringify(orderData),
      }, state.token);
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
  };
  
  const deleteOrder = async (id: string) => {
    await fetcher(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE' }, state.token);
    dispatch({ type: 'DELETE_ORDER', payload: id });
  };
  
  const contextValue: AppContextType = {
      state,
      login,
      logout,
      addClient,
      updateClient,
      deleteClient,
      addProduct,
      updateProduct,
      deleteProduct,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addOrder,
      updateOrder,
      deleteOrder,
      toggleChat,
      sendMessageToAI,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
