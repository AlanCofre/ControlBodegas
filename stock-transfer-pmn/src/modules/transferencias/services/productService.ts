/**
 * Servicio de productos
 * Abstrae la obtención de datos de productos
 * 
 * Uso actual: Retorna mocks locales
 * Uso futuro: Retornará datos desde Supabase
 */

export interface Product {
  id: string
  nombre: string
  categoria: string
  codigo: string
  precio: number
}

const PRODUCTOS_MOCK: Product[] = [
  {
    id: 'PROD-001',
    nombre: 'Laptop DELL XPS 13',
    categoria: 'Computadoras',
    codigo: 'DELL-XPS-13',
    precio: 1500,
  },
  {
    id: 'PROD-002',
    nombre: 'Monitor LG 27"',
    categoria: 'Monitores',
    codigo: 'LG-27',
    precio: 350,
  },
  {
    id: 'PROD-003',
    nombre: 'Teclado Mecánico RGB',
    categoria: 'Periféricos',
    codigo: 'KBD-RGB',
    precio: 150,
  },
  {
    id: 'PROD-004',
    nombre: 'Mouse Logitech MX Master',
    categoria: 'Periféricos',
    codigo: 'LOG-MXM',
    precio: 100,
  },
  {
    id: 'PROD-005',
    nombre: 'Monitor Samsung 32"',
    categoria: 'Monitores',
    codigo: 'SAM-32',
    precio: 400,
  },
  {
    id: 'PROD-006',
    nombre: 'Webcam Logitech HD',
    categoria: 'Periféricos',
    codigo: 'LOG-WBC',
    precio: 75,
  },
  {
    id: 'PROD-007',
    nombre: 'Auriculares Sony WH-1000XM5',
    categoria: 'Audio',
    codigo: 'SONY-XM5',
    precio: 380,
  },
  {
    id: 'PROD-008',
    nombre: 'Docking Station USB-C',
    categoria: 'Accesorios',
    codigo: 'DOCK-USB',
    precio: 120,
  },
  {
    id: 'PROD-009',
    nombre: 'Cable HDMI 2.1',
    categoria: 'Cables',
    codigo: 'HDMI-2.1',
    precio: 25,
  },
  {
    id: 'PROD-010',
    nombre: 'Adaptador DisplayPort',
    categoria: 'Adaptadores',
    codigo: 'DP-ADAPT',
    precio: 50,
  },
]

export const productService = {
  /**
   * Obtiene todos los productos
   * @returns Promise con array de productos
   */
  async getAll(): Promise<Product[]> {
    // TODO: Reemplazar con: return supabase.from('products').select('*')
    return Promise.resolve(PRODUCTOS_MOCK)
  },

  /**
   * Obtiene un producto por ID
   * @param id ID del producto
   * @returns Promise con el producto encontrado
   */
  async getById(id: string): Promise<Product | null> {
    // TODO: Reemplazar con: return supabase.from('products').select('*').eq('id', id).single()
    const product = PRODUCTOS_MOCK.find((p) => p.id === id)
    return Promise.resolve(product || null)
  },

  /**
   * Obtiene nombres de productos (para selectores)
   * @returns Promise con array de nombres
   */
  async getNames(): Promise<string[]> {
    // TODO: Reemplazar con: return supabase.from('products').select('nombre')
    const names = PRODUCTOS_MOCK.map((p) => p.nombre)
    return Promise.resolve(names)
  },

  /**
   * Busca productos por nombre
   * @param nombre Nombre o parte del nombre del producto
   * @returns Promise con array de productos encontrados
   */
  async searchByName(nombre: string): Promise<Product[]> {
    // TODO: Reemplazar con: return supabase.from('products').select('*').ilike('nombre', `%${nombre}%`)
    const filtered = PRODUCTOS_MOCK.filter((p) =>
      p.nombre.toLowerCase().includes(nombre.toLowerCase()),
    )
    return Promise.resolve(filtered)
  },

  /**
   * Obtiene productos por categoría
   * @param categoria Nombre de la categoría
   * @returns Promise con array de productos
   */
  async getByCategory(categoria: string): Promise<Product[]> {
    // TODO: Reemplazar con: return supabase.from('products').select('*').eq('categoria', categoria)
    const filtered = PRODUCTOS_MOCK.filter((p) => p.categoria === categoria)
    return Promise.resolve(filtered)
  },

  /**
   * Obtiene todas las categorías disponibles
   * @returns Promise con array de categorías
   */
  async getCategories(): Promise<string[]> {
    // TODO: Reemplazar con: return supabase.from('products').select('categoria').distinct()
    const categories = Array.from(new Set(PRODUCTOS_MOCK.map((p) => p.categoria)))
    return Promise.resolve(categories)
  },
}
