import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

// Componentes internos para cada sección
const RegisterUser = () => {
  const [form, setForm] = useState({
    usuario: "", nombreCompleto: "", email: "", contrasena: "", rolId: ""
  });
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8080/api/roles").then(res => setRoles(res.data));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/registrar", form);
      setMessage("Usuario registrado exitosamente");
    } catch (err) {
      setMessage(err.response?.data || "Error al registrar usuario");
    }
  };

  return (
    <div className="tab-content">
      <h3 className="section-title">Registrar Usuario</h3>
      {message && <p className={`message ${message.includes("exitosamente") ? "success" : "error"}`}>{message}</p>}
      <form onSubmit={handleSubmit} className="form-grid">
        {/* Campos del formulario */}
        {Object.keys(form).map(key => (
          key !== "rolId" ? (
            <div className="form-group" key={key}>
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input
                type={key === "contrasena" ? "password" : "text"}
                name={key}
                value={form[key]}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          ) : null
        ))}
        <div className="form-group">
          <label>Rol</label>
          <select name="rolId" value={form.rolId} onChange={handleChange} required className="form-select">
            <option value="">Selecciona un rol</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary">Registrar Usuario</button>
      </form>
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8080/api/usuarios")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Error al cargar usuarios", err));
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);  // Poner el usuario en el formulario de edición
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const url = `http://localhost:8080/api/usuarios/${id}/${isActive ? 'desactivar' : 'activar'}`;
      await axios.patch(url);
  
      // Actualiza el estado local manualmente
      setUsers(users.map(u =>
        u.id === id ? { ...u, activo: !isActive } : u
      ));
    } catch (err) {
      console.error("Error al cambiar estado del usuario", err);
    }
  };
  

  const handleChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  return (
    <div className="tab-content">
      <h3 className="section-title">Gestionar Usuarios</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.nombreCompleto}</td>
              <td>{u.email}</td>
              <td>{u.rol?.nombre || 'Sin rol'}</td>
              <td>{u.activo ? "Activo" : "Inactivo"}</td>
              <td>
  <button onClick={() => handleEdit(u)}>✏️ Editar</button>
  <button onClick={() => handleToggleActive(u.id, u.activo)}>
    {u.activo ? '⛔ Desactivar' : '✅ Activar'}
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>

      {editUser && (
        <div>
          <h3>Editar Usuario</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                name="nombreCompleto"
                value={editUser.nombreCompleto}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editUser.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="btn-primary">Actualizar Usuario</button>
          </form>
        </div>
      )}
    </div>
  );
};

const ManageRoles = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [editRole, setEditRole] = useState(null);
  const [allPrivilegios, setAllPrivilegios] = useState([]);
  const [selectedPrivilegios, setSelectedPrivilegios] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchPrivilegios();
  }, []);

  const fetchRoles = async () => {
    const res = await axios.get("http://localhost:8080/api/roles");
    setRoles(res.data);
  };

  const fetchPrivilegios = async () => {
    const res = await axios.get("http://localhost:8080/api/privilegios");
    setAllPrivilegios(res.data);
  };

  const fetchPrivilegiosDelRol = async (rolId) => {
    const res = await axios.get(`http://localhost:8080/api/roles/${rolId}/privilegios`);
    setSelectedPrivilegios(res.data.map(p => p.id));
  };

  const togglePrivilegio = (id) => {
    if (selectedPrivilegios.includes(id)) {
      setSelectedPrivilegios(prev => prev.filter(pid => pid !== id));
    } else {
      setSelectedPrivilegios(prev => [...prev, id]);
    }
  };

  const savePrivilegios = async (rolId) => {
    await axios.post(`http://localhost:8080/api/roles/${rolId}/asignarprivilegio`, selectedPrivilegios);
    alert("Privilegios actualizados correctamente");
  };

  return (
    <div className="tab-content">
      <h3>Gestionar Roles</h3>

      <div className="form-group">
        <input
          type="text"
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
          placeholder="Nuevo rol"
        />
        <button onClick={async () => {
          const res = await axios.post("http://localhost:8080/api/roles", { nombre: newRole });
          setRoles([...roles, res.data]);
          setNewRole("");
        }}>Agregar</button>
      </div>

      <ul>
        {roles.map(role => (
          <li key={role.id}>
            <strong>{role.nombre}</strong>
            <button onClick={() => {
              setEditRole(role);
              fetchPrivilegiosDelRol(role.id);
            }}>⚙️ Privilegios</button>
            <button onClick={() => axios.delete(`http://localhost:8080/api/roles/${role.id}`).then(fetchRoles)}>🗑️</button>
          </li>
        ))}
      </ul>

      {editRole && (
        <div>
          <h4>Privilegios para: {editRole.nombre}</h4>
          {allPrivilegios.map(p => (
            <div key={p.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedPrivilegios.includes(p.id)}
                  onChange={() => togglePrivilegio(p.id)}
                />
                {p.nombre}
              </label>
            </div>
          ))}
          <button onClick={() => savePrivilegios(editRole.id)}>💾 Guardar Privilegios</button>
        </div>
      )}
    </div>
  );
};


const ManagePrivileges = () => {
  const [privilegios, setPrivilegios] = useState([]);
  const [nuevoPrivilegio, setNuevoPrivilegio] = useState("");

  useEffect(() => {
    obtenerPrivilegios();
  }, []);

  const obtenerPrivilegios = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/privilegios");
      setPrivilegios(res.data);
    } catch (error) {
      console.error("Error al obtener privilegios:", error);
    }
  };

  const crearPrivilegio = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/privilegios", {
        nombre: nuevoPrivilegio
      });
      setPrivilegios([...privilegios, res.data]);
      setNuevoPrivilegio("");
    } catch (error) {
      console.error("Error al crear privilegio:", error);
    }
  };

  const eliminarPrivilegio = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/privilegios/${id}`);
      setPrivilegios(privilegios.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar privilegio:", error);
    }
  };

  return (
    <div className="tab-content">
      <h3>Gestionar Privilegios</h3>

      <div className="form-group">
        <input
          type="text"
          value={nuevoPrivilegio}
          onChange={e => setNuevoPrivilegio(e.target.value)}
          placeholder="Nuevo privilegio"
          className="form-input"
        />
        <button onClick={crearPrivilegio} className="btn-primary">Agregar</button>
      </div>

      <ul>
        {privilegios.map(p => (
          <li key={p.id}>
            {p.nombre}
            <button onClick={() => eliminarPrivilegio(p.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
};


export default function Dashboard() {
    const [tab, setTab] = useState('register');
  
    return (
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <button onClick={() => setTab('register')} className={`nav-btn ${tab === 'register' ? 'active' : ''}`}>
            👤 Registrar Usuario
          </button>
          <button onClick={() => setTab('users')} className={`nav-btn ${tab === 'users' ? 'active' : ''}`}>
            👥 Gestionar Usuarios
          </button>
          <button onClick={() => setTab('roles')} className={`nav-btn ${tab === 'roles' ? 'active' : ''}`}>
            🛡️ Gestionar Roles
          </button>
          <button onClick={() => setTab('privileges')} className={`nav-btn ${tab === 'privileges' ? 'active' : ''}`}>
            🔑 Gestionar Privilegios
          </button>
        </nav>
        <div className="dashboard-content">
          {tab === 'register' && <RegisterUser />}
          {tab === 'users' && <ManageUsers />}
          {tab === 'roles' && <ManageRoles />}
          {tab === 'privileges' && <ManagePrivileges />}
        </div>
      </div>
    );
  }
