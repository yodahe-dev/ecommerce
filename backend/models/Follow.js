module.exports = (sequelize, DataTypes) => {
    const Follow = sequelize.define('Follow', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      followerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      followableId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      followableType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    Follow.associate = (models) => {
      Follow.belongsTo(models.User, {
        foreignKey: 'followerId',
        as: 'follower',
      });
  
      // No direct relation to User/TeamBox — handled manually in logic
    };
  
    return Follow;
  };
  