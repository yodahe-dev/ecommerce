// models/Follow.js
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
      references: {
        model: 'Users', // Assuming Users table is named 'Users'
        key: 'id',
      },
    },
    followingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // Assuming Users table is named 'Users'
        key: 'id',
      },
    },
  });

  Follow.associate = (models) => {
    // A user can follow many users (one-to-many)
    Follow.belongsTo(models.User, {
      foreignKey: 'followerId',
      as: 'follower',
    });
    Follow.belongsTo(models.User, {
      foreignKey: 'followingId',
      as: 'following',
    });
  };

  return Follow;
};
