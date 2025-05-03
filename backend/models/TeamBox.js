// models/TeamBox.js
module.exports = (sequelize, DataTypes) => {
    const TeamBox = sequelize.define('TeamBox', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      bio: {
        type: DataTypes.STRING,
        allowNull: true,
      },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    rating: {
        type: DataTypes.INTEGER, // User rating (can be integers)
        defaultValue: 0,
      },
      
      posts: {
        type: DataTypes.INTEGER, // Number of posts within the team
        defaultValue: 0,
      },
      followers: {
        type: DataTypes.INTEGER, // Number of followers
        defaultValue: 0,
      },
      following: {
        type: DataTypes.INTEGER, // Number of following
        defaultValue: 0,
      },
      
    postsCount: { // Renamed 'posts' to 'postsCount' to avoid the conflict
        type: DataTypes.INTEGER, // Number of posts
        defaultValue: 0,
      },
    });
  
    TeamBox.associate = (models) => {
      // A TeamBox can have many users (members)
      TeamBox.belongsToMany(models.User, {
        through: models.Member,
        as: 'members',
        foreignKey: 'teamBoxId',
      });
    };
  
    return TeamBox;
  };
  