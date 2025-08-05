export enum OrderStatus {
  Recibido = 'Recibido',
  EnProceso = 'En Proceso',
  ControlCalidad = 'Control de Calidad',
  Listo = 'Listo para Entrega',
  Entregado = 'Entregado',
}

export interface Client {
  id: string;
  name: string;
  clinic: string;
  phone: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  material: string;
  price: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  website: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface WorkOrder {
  id:string;
  patientName: string;
  clientId: string;
  items: OrderItem[];
  dueDate: string; // ISO string format
  status: OrderStatus;
  notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AppState {
  clients: Client[];
  products: Product[];
  suppliers: Supplier[];
  orders: WorkOrder[];
  isOnline: boolean;
  isInitialized: boolean;
  showDummyDataModal: boolean;
  // Chat state
  isChatOpen: boolean;
  isChatLoading: boolean;
  chatMessages: ChatMessage[];
  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  authError: string | null;
}

export type Action =
  | { type: 'SET_INITIAL_STATE'; payload: Omit<AppState, 'isOnline' | 'isInitialized' | 'showDummyDataModal' | 'isChatOpen' | 'isChatLoading' | 'chatMessages' | 'isAuthenticated' | 'user' | 'token' | 'authError'> }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'INITIALIZATION_COMPLETE' }
  | { type: 'SHOW_DUMMY_DATA_MODAL'; payload: boolean }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'ADD_ORDER'; payload: WorkOrder }
  | { type: 'UPDATE_ORDER'; payload: WorkOrder }
  | { type: 'DELETE_ORDER'; payload: string }
  // Chat actions
  | { type: 'TOGGLE_CHAT' }
  | { type: 'SEND_CHAT_MESSAGE_START'; payload: string }
  | { type: 'SEND_CHAT_MESSAGE_SUCCESS'; payload: string }
  | { type: 'SEND_CHAT_MESSAGE_ERROR'; payload: string }
  // Auth actions
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' };
