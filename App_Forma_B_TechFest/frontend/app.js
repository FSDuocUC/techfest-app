// Frontend CRUD de expositores - TechFest Soluciones (Forma B)
const API = '/api/expositores';

const form = document.getElementById('form-expositor');
const cuerpoTabla = document.getElementById('cuerpo-tabla');
const formTitulo = document.getElementById('form-titulo');
const btnCancelar = document.getElementById('btn-cancelar');
const estadoConexion = document.getElementById('estado-conexion');

async function verificarConexion() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error();
    estadoConexion.textContent = 'Conexión con la base de datos RDS: OK';
    estadoConexion.className = 'estado ok';
  } catch {
    estadoConexion.textContent = 'Sin conexión con la base de datos RDS';
    estadoConexion.className = 'estado error';
  }
}

function formatearMonto(v) { return '$' + Number(v).toLocaleString('es-CL'); }

async function cargarExpositores() {
  try {
    const res = await fetch(API);
    const expositores = await res.json();
    if (expositores.length === 0) {
      cuerpoTabla.innerHTML = '<tr><td colspan="7">No hay expositores registrados.</td></tr>';
      return;
    }
    cuerpoTabla.innerHTML = expositores.map(x => `
      <tr>
        <td>${x.id}</td>
        <td>${x.nombre_empresa}</td>
        <td>${x.rubro}</td>
        <td>${formatearMonto(x.costo_stand)}</td>
        <td>${x.cupos_asignados}</td>
        <td>${x.contacto || '-'}</td>
        <td>
          <div class="botones-fila">
            <button class="editar" onclick="editar(${x.id})">Editar</button>
            <button class="eliminar" onclick="eliminar(${x.id})">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch {
    cuerpoTabla.innerHTML = '<tr><td colspan="7">Error al cargar expositores.</td></tr>';
  }
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const id = document.getElementById('expositor-id').value;
  const expositor = {
    nombre_empresa: document.getElementById('nombre_empresa').value,
    rubro: document.getElementById('rubro').value,
    costo_stand: parseFloat(document.getElementById('costo_stand').value),
    cupos_asignados: parseInt(document.getElementById('cupos_asignados').value) || 0,
    contacto: document.getElementById('contacto').value || null
  };
  try {
    if (id) {
      await fetch(`${API}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expositor) });
    } else {
      await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expositor) });
    }
    resetFormulario();
    cargarExpositores();
  } catch {
    alert('Error al guardar el expositor');
  }
});

async function editar(id) {
  const res = await fetch(`${API}/${id}`);
  const x = await res.json();
  document.getElementById('expositor-id').value = x.id;
  document.getElementById('nombre_empresa').value = x.nombre_empresa;
  document.getElementById('rubro').value = x.rubro;
  document.getElementById('costo_stand').value = x.costo_stand;
  document.getElementById('cupos_asignados').value = x.cupos_asignados;
  document.getElementById('contacto').value = x.contacto || '';
  formTitulo.textContent = 'Editar expositor';
  btnCancelar.classList.remove('oculto');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function eliminar(id) {
  if (!confirm('¿Seguro que deseas eliminar este expositor?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  cargarExpositores();
}

function resetFormulario() {
  form.reset();
  document.getElementById('expositor-id').value = '';
  formTitulo.textContent = 'Agregar expositor';
  btnCancelar.classList.add('oculto');
}

btnCancelar.addEventListener('click', resetFormulario);
verificarConexion();
cargarExpositores();
