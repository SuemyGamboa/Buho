<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## Zona de Papás y administración de contenido

La app para niños conserva el perfil de demostración Mateo. Solo las cuentas
de padres con el rol `admin` en `public.user_roles` pueden iniciar sesión en
`/admin` y cambiar el contenido. Laravel valida las credenciales mediante
Supabase Auth, guarda el token en la sesión del servidor y comprueba el token
y el rol en las rutas administrativas.

### Configuración

1. Configura `DB_CONNECTION=pgsql`, los datos del Session Pooler de Supabase y
   `DB_SSLMODE=require` en `.env`.
   El usuario del pooler debe incluir el identificador del proyecto
   (`postgres.<project-ref>`) y `DB_PASSWORD` debe ser la contraseña de la
   base de datos de Supabase, no la contraseña del usuario de Auth. Las
   sesiones y la caché locales usan archivos para que no dependan de
   PostgreSQL.
2. Configura `SUPABASE_URL` y `SUPABASE_ANON_KEY` en el backend. No uses la
   clave `service_role` en el navegador.
3. Ejecuta `php artisan migrate`. Las migraciones crean las tablas de contenido,
   políticas RLS, el trigger de perfiles, las portadas, catálogos de logros y
   recompensas y la configuración estructurada de minijuegos; también asignan
   el rol de administrador al UUID `05d8cad9-0b1b-414a-a2b2-cb6dbf839266`.
   Si `subjects.image_url`, `activities` y los catálogos `achievements` /
   `rewards` ya fueron creados en Supabase, las migraciones detectan los
   objetos existentes y no los recrean. Las migraciones tampoco eliminan esos
   objetos al revertirse, para preservar el esquema administrado en Supabase.
4. Ejecuta `php artisan storage:link` para publicar las imágenes de actividad
   cargadas en `storage/app/public`.
5. Ejecuta `php artisan db:seed --class=ContentDemoSeeder` para crear o actualizar
   las materias de demostración Matemáticas de prueba, Español e Inglés, con cinco
   actividades sencillas activas por materia. Los retos usan memorama, arrastrar
   y colocar, preguntas y unir parejas. El seeder puede ejecutarse varias veces
   sin duplicar los registros y llena los catálogos de logros y recompensas.
6. Inicia Laravel en `http://127.0.0.1:8000` y Vite desde `buhofront`. El proxy
   de desarrollo reenvía `/api` y `/storage` a Laravel; cambia
   `LARAVEL_API_TARGET` si el backend escucha en otra dirección.
   Después de cambiar `.env`, reinicia `php artisan serve`.
7. Crea o habilita la cuenta del padre en Supabase Auth. Mateo no necesita una
   cuenta ni credenciales.

El formulario de acceso también permite registrar una cuenta nueva. El
registro está abierto: cualquier persona que cree una cuenta recibe el rol
`admin`. Si Supabase requiere confirmación de correo, el panel indicará que
debe confirmar su dirección antes de iniciar sesión.

El panel permite ordenar, editar y activar/desactivar materias y actividades.
Las desactivaciones son lógicas para conservar el progreso asociado. Los
formularios visuales de memorama, arrastrar y colocar, preguntas de opción
múltiple y unir parejas generan automáticamente la configuración; el mismo
contenido estructurado se persiste en `activities.content` y
`activities.config` (JSONB) para compatibilidad con el cliente existente. Las
respuestas aceptan texto, números, emojis y URLs de imagen. Los formatos
anteriores se preservan al editar sus campos comunes. Las portadas se guardan
en el disco público de Laravel. En producción,
sirve el frontend y las rutas `/api` bajo el mismo origen para mantener
protegidas las cookies de sesión y CSRF. En producción HTTPS, configura
`SESSION_SECURE_COOKIE=true`.

Los catálogos conservan el esquema `achievements(id, name, description,
icon_url, created_at)` y `rewards(id, name, image_url, type, created_at)`.
Las actividades guardan `cover_image_url`, `internal_media_url`,
`achievement_id`, `reward_item_id`, `unlock_after`, `time_limit_seconds` y
`config` (JSONB); `subjects.image_url` almacena la imagen de cada materia.

El panel incluye puzzles, memorama, arrastrar y colocar, encontrar elementos,
retos con tiempo, construcción, selección de objetivos, preguntas, organización
por categorías, parejas y sumas. Se pueden configurar estrellas, monedas,
insignias, objetos visuales desbloqueables y el número de actividades
necesarias para desbloquear un reto. La pantalla de Mateo es una demostración:
su vista previa de progreso se guarda localmente en el navegador y no sustituye
el progreso autenticado de `player_progress` en producción.

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
