import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

// Componentes internos para cada sección
const RegisterUser = () => {
  const [form, setForm] = useState({
    nombre: "", apellido: "", sexo: "", edad: "", cargo: "", direccion: "", telefono: "", email: "", contrasena: "", id_rol: ""
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
      await axios.post("http://localhost:8080/api/usuarios/register", form);
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
          key !== "id_rol" ? (
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
          <select name="id_rol" value={form.id_rol} onChange={handleChange} required className="form-select">
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

  useEffect(() => {
    axios.get("http://localhost:8080/api/usuarios").then(res => setUsers(res.data));
  }, []);

  const handleDelete = async id => {
    await axios.delete(`http://localhost:8080/api/usuarios/${id}`);
    setUsers(users.filter(u => u.id !== id));
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.nombre} {u.apellido}</td>
              <td>{u.email}</td>
              <td>{u.rol?.nombre || 'Sin rol'}</td>
              <td>
                <button onClick={() => handleDelete(u.id)}>
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ManageRoles = () => {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8080/api/roles").then(res => setRoles(res.data));
  }, []);

  const addRole = async () => {
    await axios.post("http://localhost:8080/api/roles", { nombre: name });
    setRoles([...roles, { id: Date.now(), nombre: name }]);
    setName("");
  };

  return (
    <div className="tab-content">
      <h3>Gestionar Roles</h3>
      <div className="form-group">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nuevo rol" />
        <button onClick={addRole}>Agregar</button>
      </div>
      <ul>
        {roles.map(r => <li key={r.id}>{r.nombre}</li>)}
      </ul>
    </div>
  );
};

const ManagePrivileges = () => {
    const [privileges, setPrivileges] = useState([]);
    const [name, setName] = useState("");
  
    useEffect(() => {
      axios.get("http://localhost:8080/api/privilegios").then(res => setPrivileges(res.data));
    }, []);
  
    const addPrivilege = async () => {
      try {
        const res = await axios.post("http://localhost:8080/api/privilegios", { nombre: name });
        setPrivileges([...privileges, res.data]);
        setName("");
      } catch (err) {
        console.error(err);
      }
    };
  
    return (
      <div className="tab-content">
        <h3>Gestionar Privilegios</h3>
        <div className="form-group">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nuevo privilegio" />
          <button onClick={addPrivilege}>Agregar</button>
        </div>
        <ul>
          {privileges.map(p => <li key={p.id}>{p.nombre}</li>)}
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
