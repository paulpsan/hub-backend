import qs from "querystringify";
class GitlabOptions {
    static opciones(pagina = 1,max=100) {
        let options = '&'+qs.stringify({
            page: pagina,
            per_page: max
          });
      return options
    }
  }
  
  export default GitlabOptions;