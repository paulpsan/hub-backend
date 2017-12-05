export default (sequelize, DataTypes)=> {
    const User = sequelize.define('user', {
        firstName: {
          type: DataTypes.TEXT
        },
        lastName: {
          type: DataTypes.TEXT
        }
      });
      
    //   User.sync({force: true}).then(() => {
    //     // Table created
    //     return User.create({
    //       firstName: 'John',
    //       lastName: 'Hancock'
    //     });
    //   });
      return User;
  }
  