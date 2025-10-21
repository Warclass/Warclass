---
description: Instructions for using GitHub Copilot effectively.
---

# GitHub Copilot Instructions

## Stack Tecnológico

**Proyecto de Referencia**: El proyecto Laravel en `/archived` es la base para toda la migración. Usa su lógica, modelos, vistas y arquitectura como referencia tanto para el frontend como para el backend.

### Frontend Web (Next.js)
- **Framework**: Next.js 15.5.4 con App Router
- **Estilos**: Tailwind CSS 3.x
- **Componentes**: shadcn/ui
- **TypeScript**: Habilitado
- **Ubicación**: `/web`
- **Referencia**: Vistas Blade de Laravel en `/archived/resources/views`

### Mobile (React Native)
- **Framework**: Expo
- **Estilos**: Tailwind CSS 3.x (NativeWind)
- **TypeScript**: Habilitado
- **Ubicación**: `/mobile`
- **Referencia**: Lógica y flujos del frontend Laravel

### Backend (Next.js API Routes)
- **Framework**: Next.js 15.5.4 API Routes
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **TypeScript**: Habilitado
- **Ubicación**: `/web/app/api` (API Routes dentro del proyecto web)
- **Referencia**: Modelos, controladores y lógica de negocio de Laravel en `/archived/app`

## Directrices de Código

### General
1. **Siempre usa TypeScript** para todos los archivos nuevos en web y mobile
2. **Componentes reutilizables**: Prioriza la creación de componentes modulares y reutilizables
3. **Nomenclatura**: 
   - Componentes: PascalCase (ej: `UserProfile.tsx`)
   - Funciones/variables: camelCase (ej: `getUserData`)
   - Archivos de utilidades: kebab-case (ej: `api-client.ts`)
   - Constantes: UPPER_SNAKE_CASE (ej: `API_BASE_URL`)

### shadcn/ui
1. **SIEMPRE usa componentes de shadcn/ui** cuando estén disponibles en lugar de crear componentes custom desde cero
2. **Refactorización**: Si ves código que podría usar componentes de shadcn, sugiérelo o refactorízalo automáticamente
3. **Composición**: Combina componentes de shadcn para crear interfaces complejas
4. **Personalización**: Usa las variantes y props de shadcn antes de agregar estilos custom
5. **Componentes disponibles**: Button, Input, Card, Dialog, Select, Table, Form, etc.

### Tailwind CSS
1. **Mobile-first**: Usa el enfoque mobile-first (`sm:`, `md:`, `lg:`, `xl:`)
2. **Utility classes**: Prefiere utility classes sobre CSS custom
3. **Consistencia**: Usa el sistema de diseño de Tailwind (spacing, colors, etc.)
4. **Dark mode**: Considera soporte para dark mode con `dark:` prefix
5. **Responsive**: Asegúrate de que todos los componentes sean responsivos

### Next.js 15.5.4
1. **App Router**: Usa el App Router (no Pages Router)
2. **Server Components**: Por defecto, crea Server Components. Usa `'use client'` solo cuando sea necesario (interactividad, hooks, event listeners)
3. **File conventions**: 
   - `page.tsx` para páginas
   - `layout.tsx` para layouts
   - `loading.tsx` para estados de carga
   - `error.tsx` para manejo de errores
4. **Data fetching**: Usa `async/await` directamente en Server Components
5. **Metadata**: Exporta metadata en páginas y layouts
6. **Optimizaciones**: Usa `next/image`, `next/link`, `next/font` para optimizaciones automáticas

### React Native/Expo
1. **Expo Router**: Usa el sistema de routing basado en archivos
2. **Componentes nativos**: Prefiere componentes optimizados para mobile
3. **Performance**: Considera el rendimiento en dispositivos móviles
4. **AsyncStorage**: Para persistencia local
5. **Gestures**: Usa librerías optimizadas como `react-native-gesture-handler`

## Estructura de Archivos

### Web
```
app/           # Páginas y rutas (App Router)
components/    # Componentes reutilizables
  ui/          # Componentes shadcn/ui
  layout/      # Componentes de layout
lib/           # Utilidades y helpers
  types/       # TypeScript types e interfaces
utils/         # Funciones de utilidad
```

### Mobile
```
app/           # Pantallas y navegación (Expo Router)
components/    # Componentes reutilizables
assets/        # Imágenes, fuentes, etc.
```

## Mejores Prácticas

### Accesibilidad
- Usa etiquetas semánticas HTML
- Agrega `aria-*` attributes cuando sea necesario
- Asegura contraste de colores adecuado
- Soporta navegación por teclado

### Performance
- Lazy loading para componentes pesados
- Memoización con `React.memo`, `useMemo`, `useCallback` cuando sea apropiado
- Optimización de imágenes con `next/image`
- Code splitting automático con Next.js

### Testing
- Escribe código testeable
- Separa lógica de negocio de presentación
- Usa tipos de TypeScript para reducir errores

### Seguridad
- Valida y sanitiza inputs del usuario
- Usa variables de entorno para información sensible
- Implementa autenticación y autorización apropiadas

## Patrones de Código

### Componentes
```typescript
// Ejemplo de componente con shadcn
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>Action</Button>
      </CardContent>
    </Card>
  )
}
```

### Hooks personalizados
```typescript
// Prefijo "use" para hooks
export function useCustomHook() {
  // Lógica del hook
  return { data, loading, error }
}
```

## Notas Adicionales

- **Documentación**: Agrega comentarios JSDoc para funciones y componentes complejos
- **Errores**: Maneja errores de forma apropiada con try/catch y error boundaries
- **Git**: Commits descriptivos en español usando conventional commits