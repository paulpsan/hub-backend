class UsuarioBitbucket {
  constructor(
    username,
    website,
    display_name,
    account_id,
    hooks,
    self,
    repositories,
    html,
    followers,
    avatar,
    following,
    snippets,
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
    this.hooks = hooks;
    this.self = self;
    this.repositories = repositories;
    this.html = html;
    this.followers = followers;
    this.avatar = avatar;
    this.following = following;
    this.snippets = snippets;
    this.created_on = created_on;
    this.is_staff = is_staff;
    this.location = location;
    this.type = type;
    this.uuid = uuid;
    this.access_token = access_token;
  }
}
export default UsuarioBitbucket;
