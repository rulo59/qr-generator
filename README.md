# Generador de Códigos QR

Una aplicación web simple para generar códigos QR a partir de enlaces, especialmente diseñada para enlaces de Google Drive.

## 🚀 Características

- **Interfaz intuitiva**: Diseño limpio y moderno con Tailwind CSS
- **Múltiples enlaces**: Genera códigos QR para varios enlaces a la vez
- **Personalización**: Configura el tamaño y colores de los códigos QR
- **Descarga individual**: Descarga cada código QR por separado
- **Descarga masiva**: Descarga todos los códigos QR de una vez
- **Validación de URLs**: Verifica que los enlaces sean válidos antes de generar los QR
- **Responsive**: Funciona perfectamente en dispositivos móviles y escritorio

## 📱 Cómo usar

1. **Abrir la aplicación**: Abre el archivo `index.html` en tu navegador
2. **Ingresar enlaces**: Pega los enlaces en el área de texto 
   - Puedes separarlos por líneas nuevas (uno por línea)
   - O separarlos por comas en la misma línea
   - O una combinación de ambos métodos
3. **Configurar opciones** (opcional):
   - Selecciona el tamaño del QR (200x200 a 500x500 píxeles)
   - Elige el color del QR
   - Elige el color de fondo
4. **Generar**: Haz clic en "Generar Códigos QR"
5. **Descargar**: 
   - Descarga códigos individuales con el botón de cada QR
   - Descarga todos con "Descargar Todos"

## 🔗 Ejemplo de enlaces soportados

**Separados por líneas nuevas:**
```
https://drive.google.com/file/d/19FgrGSaiBs6tko4OuzR3lqIUMw399n2j/view?usp=drive_link
https://drive.google.com/file/d/1KAORB9c41u56I_8svftZj2KzSL5RiuGA/view?usp=drive_link
https://www.ejemplo.com
```

**Separados por comas:**
```
https://drive.google.com/file/d/19FgrGSaiBs6tko4OuzR3lqIUMw399n2j/view?usp=drive_link, https://www.ejemplo.com, https://github.com/usuario/repositorio
```

**Combinación de ambos:**
```
https://drive.google.com/file/d/19FgrGSaiBs6tko4OuzR3lqIUMw399n2j/view?usp=drive_link, https://www.ejemplo.com
https://github.com/usuario/repositorio
```

## 🛠️ Tecnologías utilizadas

- **HTML5**: Estructura de la aplicación
- **JavaScript (ES6+)**: Lógica de la aplicación
- **Tailwind CSS**: Estilos y diseño responsive
- **QRCode.js**: Librería para generar códigos QR

## 📂 Estructura del proyecto

```
create-qr/
├── index.html      # Página principal
├── script.js       # Lógica de la aplicación
└── README.md       # Documentación
```

## 🌟 Características adicionales

- **Validación automática**: Solo acepta URLs válidas
- **Feedback visual**: Indicadores de carga y confirmaciones
- **Truncado de URLs**: Muestra URLs largas de forma legible
- **Gestión de errores**: Manejo elegante de errores de generación

## 🔧 Personalización

Puedes personalizar fácilmente:

- **Tamaños de QR**: Modifica las opciones en el select `qr-size`
- **Colores predeterminados**: Cambia los valores por defecto en los inputs de color
- **Estilos**: Modifica las clases de Tailwind CSS según tus preferencias

## 📱 Compatibilidad

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🚀 Despliegue

Para usar la aplicación:

1. Descarga todos los archivos
2. Abre `index.html` en cualquier navegador moderno
3. ¡Listo para usar!

No requiere servidor web, funciona completamente en el cliente.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
