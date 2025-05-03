// models/Favorite.js
module.exports = (sequelize, DataTypes) => {
    const Favorite = sequelize.define('Favorite', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Posts',
          key: 'id',
        },
      },
    });
  
    Favorite.associate = (models) => {
      Favorite.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
  
      Favorite.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post',
      });
    };
  
    return Favorite;
  };
  