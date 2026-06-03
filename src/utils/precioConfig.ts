const PRECIO_KEY = 'precio_kilo_default';
const DEFAULT_PRECIO = 2500;

export const precioConfig = {
  getPrecio(): number {
    const stored = localStorage.getItem(PRECIO_KEY);
    return stored ? parseInt(stored, 10) : DEFAULT_PRECIO;
  },
  setPrecio(precio: number): void {
    localStorage.setItem(PRECIO_KEY, precio.toString());
  },
  getDefault(): number {
    return DEFAULT_PRECIO;
  },
};
