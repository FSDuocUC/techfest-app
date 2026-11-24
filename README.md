?# App Forma B - TechFest Soluciones
## CRUD de Expositores · Sumativa 5 (CDY2201)

Aplicación web para la **Forma B** de la actividad sumativa. Gestiona un catálogo de **expositores de ferias tecnológicas** con CRUD completo (agregar, listar, editar, eliminar) y se conecta a una base de datos **Amazon RDS MySQL**. Frontend en **nginx** y backend en **Node.js**, ejecutados como contenedores **Docker** sobre una instancia **EC2**.

---

## 1. Arquitectura

```
Navegador --80--> [nginx: frontend] --/api--> [Node.js: backend] --3306--> [Amazon RDS MySQL]
                       (contenedor)              (contenedor)
                  ambos en la instancia EC2 con Docker
```

- **Frontend (nginx):** sirve la web y hace proxy de `/api` al backend.
- **Backend (Node.js):** API REST del CRUD de expositores.
- **Base de datos (RDS):** MySQL gestionado, base de datos `techfest`.

---

## 2. Campos del CRUD

| Campo | Descripción |
|---|---|
| `nombre_empresa` | Nombre de la empresa expositora |
| `rubro` | Software, Hardware, IA, etc. |
| `costo_stand` | Valor del stand asignado |
| `cupos_asignados` | Cupos/entradas para el expositor |
| `contacto` | Correo o teléfono de contacto |

---

## 3. Requisitos previos (ambiente)

Antes de desplegar, deben existir (creados en el laboratorio de la Semana 5):
1. **Instancia EC2** (Amazon Linux 2023, t3.small) con **Docker** instalado.
2. **Base de datos Amazon RDS MySQL** (`db.t3.micro`, free tier).
3. **EC2 y RDS en la misma VPC.**
4. **Security Group de RDS** que permita el puerto **3306** desde el Security Group de la EC2.
5. **Acceso público de RDS en "No".**

---

## 4. Configuración y despliegue paso a paso

### Paso 1 - Conectarse a la instancia EC2
```bash
ssh -i tu-key.pem ec2-user@<IP-PUBLICA-EC2>
```

### Paso 2 - Verificar Docker Compose v2
En Amazon Linux 2023, Docker Compose v2 viene incluido con Docker y se invoca como `docker compose` (con espacio). No instales el antiguo binario `docker-compose` (con guion): esa versión (v1) ya no puede construir imágenes y falla con `compose build requires buildx ...`. Solo verifica que esté disponible:
```bash
docker compose version
```

### Paso 3 - Copiar la app a la EC2
```bash
scp -i tu-key.pem -r Forma_B_TechFest ec2-user@<IP-PUBLICA-EC2>:/home/ec2-user/
```

### Paso 4 - Configurar las variables de entorno
```bash
cd Forma_B_TechFest
cp .env.example .env
nano .env
```
Completa con los datos de tu RDS:
```
DB_HOST=<endpoint-de-tu-rds>.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=<tu-contrasena>
DB_NAME=techfest
```

### Paso 5 - Crear la base de datos y datos de ejemplo
```bash
mysql -h <ENDPOINT-RDS> -u admin -p < init_db.sql
```
> Si no ejecutas el script, crea al menos la base vacía: `CREATE DATABASE techfest;`

### Paso 6 - Construir y levantar los contenedores
```bash
sudo DOCKER_BUILDKIT=0 docker compose up -d --build
sudo docker compose ps
```

### Paso 7 - Verificar el despliegue
```bash
curl http://localhost/api/health
# {"status":"ok","db":"conectada a RDS"}
```
Abre en el navegador: `http://<IP-PUBLICA-EC2>` y confirma **"Conexión con la base de datos RDS: OK"**.

Opcional (ver los datos directamente en RDS por consola MySQL):
```bash
mysql -h <ENDPOINT-RDS> -u admin -p -e "SHOW DATABASES;"
mysql -h <ENDPOINT-RDS> -u admin -p -e "USE techfest; SELECT * FROM expositores;"
```

### Paso 8 - Probar el CRUD
Agrega, edita y elimina un expositor desde la web. Los cambios se guardan en RDS.

---

## 5. Endpoints de la API

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/health` | Verifica conexión con RDS |
| GET | `/api/expositores` | Listar expositores |
| GET | `/api/expositores/:id` | Consultar un expositor |
| POST | `/api/expositores` | Agregar expositor |
| PUT | `/api/expositores/:id` | Actualizar expositor |
| DELETE | `/api/expositores/:id` | Eliminar expositor |

Ejemplo de cuerpo (POST/PUT):
```json
{ "nombre_empresa": "CloudTech SpA", "rubro": "Cloud Computing", "costo_stand": 350000, "cupos_asignados": 4, "contacto": "ventas@cloudtech.cl" }
```

---

## 6. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| "Sin conexión con la base de datos RDS" | `.env` mal configurado o SG bloqueando 3306 | Revisa credenciales y la regla 3306 del SG de RDS |
| La web no carga | Contenedor caído o puerto 80 cerrado | `sudo docker compose ps` y abre el puerto 80 en el SG de la EC2 |
| `Access denied` al conectar a MySQL | Usuario/contraseña incorrectos | Verifica `DB_USER` y `DB_PASSWORD` |
| Tabla no existe | BD no creada | Ejecuta `init_db.sql` o crea la BD |

Ver logs:
```bash
sudo docker compose logs backend
sudo docker compose logs frontend
```

---

## 7. Limpieza de recursos
```bash
sudo docker compose down
```
Luego, en la consola de AWS, **detén/elimina la instancia EC2 y la base de datos RDS**.

---

## 8. Seguridad
- No subas el `.env` real al AVA ni a repositorios (está en `.dockerignore`).
- RDS con **acceso público en "No"** y puerto 3306 solo desde el SG de la EC2.
- Son credenciales de laboratorio; en producción se usa AWS Secrets Manager.

---

**Introducción al Cloud Computing (CDY2201)**
Creado por Ignacio Pastenet · DuocUC · Campus Virtual
