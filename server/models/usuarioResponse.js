class UsuarioResponse {
  constructor(_id, avatar, email, login, nombre, rol, tipo, password) {
    this._id = _id;
    this.avatar = avatar;
    this.email = email;
    this.login = login;
    this.nombre = nombre;
    this.rol = rol;
    this.tipo = tipo;
    this.password = password;
    
  }
}
export default UsuarioResponse;
