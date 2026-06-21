import { useState, useEffect } from 'react'
import { useAuth, normalizeRole } from '../../../shared/auth/AuthContext'
import { supabase } from '../../../shared/utils/supabaseClient'

interface Role {
  id: number
  nombre: string
}

interface Bodega {
  id: number
  nombre: string
}

export default function LoginPage() {
  const { login, signUp } = useAuth()
  
  // Alternar vista de registro
  const [isRegister, setIsRegister] = useState(false)

  // Estados del login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Estados del registro
  const [regNombre, setRegNombre] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regRolId, setRegRolId] = useState('')
  const [regBodegaId, setRegBodegaId] = useState('')

  // Catálogos
  const [roles, setRoles] = useState<Role[]>([])
  const [bodegas, setBodegas] = useState<Bodega[]>([])
  const [loadingCatalogs, setLoadingCatalogs] = useState(false)

  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Determinar si el rol seleccionado requiere bodega
  const selectedRegRole = roles.find((r) => r.id === Number(regRolId))
  const regRoleNormalized = selectedRegRole ? normalizeRole(selectedRegRole.nombre) : ''
  const isSupervisorOrOperator = regRoleNormalized === 'supervisor_bodega' || regRoleNormalized === 'operador_bodega'

  // Cargar catálogos dinámicamente cuando el usuario decide registrarse
  useEffect(() => {
    if (!isRegister) return

    const loadCatalogs = async () => {
      try {
        setLoadingCatalogs(true)
        setErrorMsg('')

        // 1. Cargar todos los roles
        const { data: rolesData, error: rolesErr } = await supabase
          .from('roles')
          .select('id, nombre')
          .order('nombre', { ascending: true })

        if (rolesErr) throw rolesErr
        if (rolesData) setRoles(rolesData)

        // 2. Cargar bodegas activas
        const { data: bodegasData, error: bodegasErr } = await supabase
          .from('bodegas')
          .select('id, nombre')
          .eq('activa', true)
          .order('nombre', { ascending: true })

        if (bodegasErr) throw bodegasErr
        if (bodegasData) setBodegas(bodegasData)

      } catch (err: any) {
        console.error('Error al cargar catálogos en login:', err)
        setErrorMsg('Error al conectar con la base de datos para cargar roles y bodegas.')
      } finally {
        setLoadingCatalogs(false)
      }
    }

    loadCatalogs()
  }, [isRegister])

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      administrador: 'Administrador',
      supervisor_bodega: 'Supervisor de Bodega',
      operador_bodega: 'Operador de Bodega',
      transportista: 'Transportista'
    }
    return labels[role] || role
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setErrorMsg('Por favor ingrese su correo electrónico y contraseña')
      return
    }

    setSubmitLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await login(email.trim(), password)
    } catch (err: any) {
      console.error('Error de login:', err)
      setErrorMsg(err.message || 'Credenciales inválidas o error de conexión')
      setSubmitLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!regNombre.trim()) {
      setErrorMsg('Por favor ingrese su nombre completo')
      return
    }

    // 1. Validar correo corporativo con dominio @empresa.cl
    const emailTrimmed = regEmail.trim().toLowerCase()
    if (!emailTrimmed) {
      setErrorMsg('Por favor ingrese su correo electrónico')
      return
    }

    if (!emailTrimmed.endsWith('@empresa.cl')) {
      setErrorMsg('Solo se permiten correos corporativos con dominio @empresa.cl')
      return
    }

    // 2. Validar contraseña mínima de 8 caracteres con 1 mayúscula y 1 número
    if (regPassword.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres')
      return
    }

    const hasUppercase = /[A-Z]/.test(regPassword)
    const hasNumber = /[0-9]/.test(regPassword)

    if (!hasUppercase) {
      setErrorMsg('La contraseña debe incluir al menos una letra mayúscula')
      return
    }

    if (!hasNumber) {
      setErrorMsg('La contraseña debe incluir al menos un número')
      return
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden')
      return
    }

    if (!regRolId) {
      setErrorMsg('Por favor seleccione un rol')
      return
    }

    if (isSupervisorOrOperator && !regBodegaId) {
      setErrorMsg('Por favor seleccione una bodega para este rol')
      return
    }

    setSubmitLoading(true)
    try {
      await signUp(
        emailTrimmed,
        regPassword,
        regNombre.trim(),
        Number(regRolId),
        isSupervisorOrOperator ? Number(regBodegaId) : null
      )
      setSuccessMsg('Registro exitoso. Ya puedes iniciar sesión con tus credenciales.')
      // Limpiar campos
      setRegNombre('')
      setRegEmail('')
      setRegPassword('')
      setRegConfirmPassword('')
      setRegRolId('')
      setRegBodegaId('')
      
      // Retorno a vista de login después de 2.5s
      setTimeout(() => {
        setIsRegister(false)
        setSuccessMsg('')
      }, 2500)
    } catch (err: any) {
      console.error('Error de registro:', err)
      setErrorMsg(err.message || 'Error al crear el usuario en el sistema.')
      setSubmitLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {isRegister ? 'Crear Cuenta' : 'Control de Bodegas'}
          </h1>
          <p className="mt-2 text-sm text-blue-200/80">
            {isRegister 
              ? 'Regístrate con tu correo corporativo @empresa.cl' 
              : 'Ingresa tus credenciales para acceder al sistema'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">
            {successMsg}
          </div>
        )}

        {isRegister ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/95">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
                disabled={submitLoading}
                placeholder="Juan Pérez"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/35 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-white/95">
                Correo Electrónico Corporativo *
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={submitLoading}
                placeholder="usuario@empresa.cl"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/35 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/95">
                  Rol *
                </label>
                <select
                  value={regRolId}
                  onChange={(e) => {
                    setRegRolId(e.target.value)
                    const selectedRole = roles.find((r) => r.id === Number(e.target.value))
                    const normalizedRoleName = selectedRole ? normalizeRole(selectedRole.nombre) : ''
                    if (normalizedRoleName !== 'supervisor_bodega' && normalizedRoleName !== 'operador_bodega') {
                      setRegBodegaId('')
                    }
                  }}
                  disabled={submitLoading || loadingCatalogs}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-950">
                      {getRoleLabel(r.nombre)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/95">
                  Bodega
                </label>
                <select
                  value={regBodegaId}
                  onChange={(e) => setRegBodegaId(e.target.value)}
                  disabled={submitLoading || loadingCatalogs || !isSupervisorOrOperator}
                  className={`w-full rounded-lg border px-3 py-2 text-white outline-none transition focus:ring-1 text-sm ${
                    isSupervisorOrOperator
                      ? 'border-white/10 bg-slate-950 focus:border-blue-500 focus:ring-blue-500'
                      : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                  }`}
                  required={isSupervisorOrOperator}
                >
                  <option value="">-- Seleccionar --</option>
                  {bodegas.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-950">
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-white/95">
                Contraseña *
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                disabled={submitLoading}
                placeholder="Min. 8 carac, 1 Mayús, 1 Núm."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/35 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-white/95">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                disabled={submitLoading}
                placeholder="Confirmar contraseña"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/35 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading || loadingCatalogs}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {submitLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Registrando...
                </>
              ) : (
                'Registrarse'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false)
                  setErrorMsg('')
                  setSuccessMsg('')
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/95">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitLoading}
                placeholder="usuario@empresa.cl"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/35 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/95">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitLoading}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/35 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Iniciando sesión...
                </>
              ) : (
                'Ingresar'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true)
                  setErrorMsg('')
                  setSuccessMsg('')
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                ¿No tienes una cuenta? Regístrate
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}