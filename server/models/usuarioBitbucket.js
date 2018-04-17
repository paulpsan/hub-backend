class UsuarioBitbucket {
  constructor(
    username,
    website,
    display_name,
    account_id,
    links,
    created_on,
    is_staff,
    location,
    type,
    uuid,
    access_token
  ) {
    this.username = username;
    this.website = website;
    this.display_name = display_name;
    this.account_id = account_id;
    this.links = links;
    this.created_on = created_on;
    this.is_staff = is_staff;
    this.location = location;
    this.type = type;
    this.uuid = uuid;
    this.access_token = access_token;
  }
}
export default UsuarioBitbucket;
