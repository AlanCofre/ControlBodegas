import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las variables de entorno de Supabase en el archivo .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export async function seedDatabaseIfNeeded() {
  try {
    // 1. Roles
    const { count: roleCount, error: roleErr } = await supabase
      .from('roles')
      .select('*', { count: 'exact', head: true })

    if (roleErr) throw roleErr

    if (roleCount === 0) {
      console.log('Seeding roles...')
      const { error } = await supabase.from('roles').insert([
        { nombre: 'administrador' },
        { nombre: 'supervisor_bodega' },
        { nombre: 'operador_bodega' },
        { nombre: 'transportista' }
      ])
      if (error) console.error('Error seeding roles:', error)
    }

    // 2. Bodegas
    const { count: bodegaCount, error: bodegaErr } = await supabase
      .from('bodegas')
      .select('*', { count: 'exact', head: true })

    if (bodegaErr) throw bodegaErr

    if (bodegaCount === 0) {
      console.log('Seeding bodegas...')
      const { error } = await supabase.from('bodegas').insert([
        { codigo: 'BG-CTR', nombre: 'Bodega Centro', activa: true, direccion: 'Av. Libertador 123, Santiago Centro' },
        { codigo: 'BG-NRT', nombre: 'Bodega Norte', activa: true, direccion: 'Parque Industrial Norte, Lampa' },
        { codigo: 'BG-SUR', nombre: 'Bodega Sur', activa: true, direccion: 'Ruta 5 Sur Km 20, San Bernardo' },
        { codigo: 'BG-EST', nombre: 'Bodega Este', activa: true, direccion: 'Av. Providencia 456, Providencia' },
        { codigo: 'BG-OES', nombre: 'Bodega Oeste', activa: true, direccion: 'Camino Melipilla 7890, Maipú' }
      ])
      if (error) console.error('Error seeding bodegas:', error)
    }

    // 3. Productos
    const { count: productoCount, error: prodErr } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })

    if (prodErr) throw prodErr

    if (productoCount === 0) {
      console.log('Seeding productos...')
      const { error } = await supabase.from('productos').insert([
        { sku: 'LAP-DELL-XPS13', nombre: 'Laptop DELL XPS 13', descripcion: 'Intel Core i7, 16GB RAM, 512GB SSD', stock_minimo: 2, activo: true },
        { sku: 'MON-LG-27', nombre: 'Monitor LG 27"', descripcion: 'IPS UHD 4K, 60Hz, HDR10', stock_minimo: 3, activo: true },
        { sku: 'TEC-RGB-MECH', nombre: 'Teclado Mecánico RGB', descripcion: 'Switches Cherry MX Red, layout español', stock_minimo: 5, activo: true },
        { sku: 'MSE-LOG-MX', nombre: 'Mouse Logitech MX Master', descripcion: 'Mouse inalámbrico ergonómico de alta precisión', stock_minimo: 5, activo: true },
        { sku: 'MON-SAM-32', nombre: 'Monitor Samsung 32"', descripcion: 'Curvo FHD, 75Hz, modo Eye Saver', stock_minimo: 2, activo: true },
        { sku: 'CAM-LOG-HD', nombre: 'Webcam Logitech HD', descripcion: 'Full HD 1080p a 30fps con corrección de luz', stock_minimo: 4, activo: true },
        { sku: 'AUD-SONY-XM5', nombre: 'Auriculares Sony WH-1000XM5', descripcion: 'Inalámbricos con Noise Cancelling líder del sector', stock_minimo: 2, activo: true },
        { sku: 'DKG-USBC', nombre: 'Docking Station USB-C', descripcion: '11 puertos, entrega de energía de 100W', stock_minimo: 3, activo: true },
        { sku: 'CAB-HDMI-21', nombre: 'Cable HDMI 2.1', descripcion: 'Ultra High Speed 48Gbps, 2 metros', stock_minimo: 10, activo: true },
        { sku: 'ADP-DP', nombre: 'Adaptador DisplayPort', descripcion: 'Adaptador DP a HDMI 4K activo', stock_minimo: 8, activo: true }
      ])
      if (error) console.error('Error seeding productos:', error)
    }

    // 4. Inventario
    const { count: inventarioCount, error: invErr } = await supabase
      .from('inventario')
      .select('*', { count: 'exact', head: true })

    if (invErr) throw invErr

    if (inventarioCount === 0) {
      console.log('Seeding inventario...')
      const { data: allBodegas } = await supabase.from('bodegas').select('id')
      const { data: allProductos } = await supabase.from('productos').select('id')

      if (allBodegas && allProductos) {
        const inventarioInserts = []
        for (const b of allBodegas) {
          for (const p of allProductos) {
            inventarioInserts.push({
              bodega_id: b.id,
              producto_id: p.id,
              stock_disponible: 50, // stock inicial de prueba
              stock_reservado: 0
            })
          }
        }
        const { error } = await supabase.from('inventario').insert(inventarioInserts)
        if (error) console.error('Error seeding inventario:', error)
      }
    }

    // 5. Usuarios
    const { count: usuarioCount, error: userErr } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })

    if (userErr) throw userErr

    if (usuarioCount === 0) {
      console.log('Seeding usuarios...')
      const { data: dbRoles, error: getRolesErr } = await supabase
        .from('roles')
        .select('id, nombre')
      
      if (getRolesErr) throw getRolesErr

      const { data: dbBodegas, error: getBodegasErr } = await supabase
        .from('bodegas')
        .select('id, nombre')

      if (getBodegasErr) throw getBodegasErr

      if (dbRoles && dbBodegas) {
        const getRoleId = (roleName: string) => {
          const role = dbRoles.find(r => r.nombre.toLowerCase() === roleName.toLowerCase())
          return role ? role.id : null
        }

        const getBodegaId = (bodegaName: string) => {
          const b = dbBodegas.find(x => x.nombre.toLowerCase() === bodegaName.toLowerCase())
          return b ? b.id : null
        }

        const userInserts = [
          { nombre: 'Rodrigo M.', email: 'rodrigo@controlbodegas.com', rol_id: getRoleId('supervisor_bodega'), bodega_id: getBodegaId('Bodega Sur'), activo: true },
          { nombre: 'Carlos S.', email: 'carlos@controlbodegas.com', rol_id: getRoleId('supervisor_bodega'), bodega_id: getBodegaId('Bodega Centro'), activo: true },
          { nombre: 'Pedro R.', email: 'pedro@controlbodegas.com', rol_id: getRoleId('operador_bodega'), bodega_id: getBodegaId('Bodega Centro'), activo: true },
          { nombre: 'Miguel A.', email: 'miguel@controlbodegas.com', rol_id: getRoleId('operador_bodega'), bodega_id: getBodegaId('Bodega Sur'), activo: true },
          { nombre: 'Juan T.', email: 'juan@controlbodegas.com', rol_id: getRoleId('transportista'), bodega_id: null, activo: true },
          { nombre: 'Admin Control', email: 'admin@controlbodegas.com', rol_id: getRoleId('administrador'), bodega_id: null, activo: true }
        ].filter(u => u.rol_id !== null)

        if (userInserts.length > 0) {
          const { error: insertUserErr } = await supabase
            .from('usuarios')
            .insert(userInserts)
          if (insertUserErr) console.error('Error seeding usuarios:', insertUserErr)
        }
      }
    }
  } catch (err) {
    console.error('Error durante el seeding de la base de datos:', err)
  }
}
