INICIAR SERVIDOR LOCAL : php -S localhost:8000

# GitHub

Crear rama y clonar repositorio

- git init
- git clone URL
- git remote add origin
- git checkout -b mi-rama
- git add .
- git commit -m "Mensaje descriptivo de los cambios"
- git push origin <nombre-de-la-rama>

Actualizar Cambios en la rama

- git init (Usar si no se ha iniciado GIT)
- git add .
- git commit -m "Mensaje descriptivo de los cambios"
- git push origin <nombre-de-la-rama>

Actualizar Codigo

- git branch (Validar rama)
- git pull origin main (Actualizar mi proyecto local con lo que esta actualizado en main o produccion)
- git pull origin cstiven
-

Crear Agregar un repositorio mas la origin local

- git remote add neworigin URL
- git remote set-url origin

Crear el .gitinore para omitir cargue de archivos al GitHub

- touch .gitignore
- open -a TextEdit .gitignore
- git add .gitignore
- git commit -m "se agrega el .gitignore"
- git push origin <nombre-de-la-rama>

Prefijos

- feat: Una nueva característica para el usuario.
- fix: Arregla un bug que afecta al usuario.
- perf: Cambios que mejoran el rendimiento del sitio.
- build: Cambios en el sistema de build, tareas de despliegue o instalación.
- ci: Cambios en la integración continua.
- docs: Cambios en la documentación.
- refactor: Refactorización del código como cambios de nombre de variables o funciones.
- style: Cambios de formato, tabulaciones, espacios o puntos y coma, etc; no afectan al usuario.
- test: Añade tests o refactoriza uno existente.

# Api Teclab S.A.S

Este es un proyecto de ejemplo con una estructura básica para una aplicación Node.js con autenticación mediante JWT.

## Estructura del Proyecto

## Requisitos del Sistema

Asegúrate de tener Node.js y npm instalados en tu sistema.

## Configuración

1. Clona el repositorio: `git clone https://github.com/Teclab-Col/api-teclab-sas.git`
2. Entra al directorio del proyecto: `cd api-teclab-sas`
3. Instala las dependencias: `npm install`
4. Configura las variables de entorno creando un archivo `.env` en la raíz del proyecto con las siguientes variables:

## Uso

Ejecuta la aplicación con el siguiente comando:

```bash
npm start

La aplicación estará disponible en http://localhost:3000 por defecto.

Contribución
Si deseas contribuir al proyecto, sigue estos pasos:

Crea una rama: git checkout -b feature/nueva-caracteristica
Realiza tus cambios y haz commits: git commit -m "Agrega nueva característica"
Sube tus cambios: git push origin feature/nueva-caracteristica
Abre un Pull Request en GitHub.
Licencia
Este proyecto está bajo la licencia MIT.


Asegúrate de personalizar el contenido según las necesidades específicas de tu proyecto. Puedes agregar secciones adicionales o ajustar las existentes según tus requisitos y preferencias.
```
